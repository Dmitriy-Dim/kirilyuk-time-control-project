import { ShiftService } from "./ShiftService.js";
import { CrewShift, CurrentCrewShift, ShiftCorrectionDto, Break } from "../model/CrewShift.js";
import { CrewShiftModel } from "../model/CrewShiftMongoModels.js";
import { EmployeeModel } from "../model/EmployeeMongoModels.js";
import { HttpError } from "../errorHandler/HttpError.js";
import {
    generateShiftId,
    calculateMonthHours,
    calculateShiftDuration,
    canTakeBreak,
    checkMinRestTime
} from "../utils/tools.js";
import { configuration } from "../config/timeControlConfig.js";

class ShiftServiceMongoImpl implements ShiftService {

    async startShift(table_num: string): Promise<{ table_num: string; time: number }> {
        const employee = await EmployeeModel.findOne({ table_num }).exec();
        if (!employee) {
            throw new HttpError(404, `Employee with table_num ${table_num} not found`);
        }

        const activeShift = await this.getActiveShiftByEmployee(table_num);
        if (activeShift) {
            throw new HttpError(409, `Employee ${table_num} already has an active shift`);
        }

        const canStart = await checkMinRestTime(table_num, configuration.minRestHours || 8);
        if (!canStart) {
            throw new HttpError(409, `Employee ${table_num} must rest at least ${configuration.minRestHours || 8} hours between shifts`);
        }

        const now = Date.now();
        const shiftId = await generateShiftId();

        const newShift: CrewShift = {
            shift_id: shiftId,
            startShift: now,
            finishShift: null,
            table_num,
            shiftDuration: 0,
            breaks: [],
            correct: null,
            monthHours: 0
        };

        const shiftDoc = new CrewShiftModel(newShift);
        await shiftDoc.save();

        return { table_num, time: now };
    }

    async finishShift(table_num: string): Promise<{ table_num: string; time: number }> {
        const activeShift = await this.getActiveShiftByEmployee(table_num);
        if (!activeShift) {
            throw new HttpError(404, `No active shift found for employee ${table_num}`);
        }

        const now = Date.now();
        const maxShiftMs = (configuration.maxShiftHours || 12) * 60 * 60 * 1000;

        if (now - activeShift.startShift > maxShiftMs) {
            throw new HttpError(400, `Shift duration exceeds maximum allowed ${configuration.maxShiftHours || 12} hours`);
        }

        const shiftDuration = calculateShiftDuration(activeShift.startShift, now, activeShift.breaks);
        const monthHours = await calculateMonthHours(table_num);

        await CrewShiftModel.findOneAndUpdate(
            { _id: activeShift._id },
            {
                $set: {
                    finishShift: now,
                    shiftDuration,
                    monthHours: monthHours + shiftDuration
                }
            }
        ).exec();

        return { table_num, time: now };
    }

    async takeBreak(table_num: string, duration: 15 | 30): Promise<void> {
        const activeShift = await this.getActiveShiftByEmployee(table_num);
        if (!activeShift) {
            throw new HttpError(404, `No active shift found for employee ${table_num}`);
        }

        const now = Date.now();
        const currentShiftDuration = Math.floor((now - activeShift.startShift) / (1000 * 60));

        if (!canTakeBreak(currentShiftDuration, activeShift.breaks, duration)) {
            throw new HttpError(400, `Break not allowed based on current shift duration and break policy`);
        }

        const newBreak: Break = {
            start: now,
            end: now + (duration * 60 * 1000),
            duration
        };

        await CrewShiftModel.findOneAndUpdate(
            { _id: activeShift._id },
            {
                $push: { breaks: newBreak }
            }
        ).exec();
    }

    async correctShift(correction: ShiftCorrectionDto): Promise<void> {
        const manager = await EmployeeModel.findOne({
            table_num: correction.table_num_mng,
            roles: { $in: ['manager', 'supervisor'] }
        }).exec();
        if (!manager) {
            throw new HttpError(404, `Manager with table_num ${correction.table_num_mng} not found or insufficient permissions`);
        }

        const targetDate = new Date(correction.date);
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);

        const shift = await CrewShiftModel.findOne({
            table_num: correction.table_num_crew,
            startShift: {
                $gte: dayStart.getTime(),
                $lte: dayEnd.getTime()
            }
        }).exec();

        if (!shift) {
            throw new HttpError(404, `No shift found for employee ${correction.table_num_crew} on ${correction.date}`);
        }

        const originalDuration = shift.finishShift ?
            calculateShiftDuration(shift.startShift, shift.finishShift, shift.breaks) : 0;
        const newDuration = calculateShiftDuration(correction.start, correction.finish, shift.breaks);

        if (newDuration > originalDuration) {
            throw new HttpError(400, `Correction can only decrease shift duration`);
        }

        const monthHours = await calculateMonthHours(correction.table_num_crew);
        const adjustedMonthHours = monthHours - (originalDuration - newDuration);

        await CrewShiftModel.findOneAndUpdate(
            { _id: shift._id },
            {
                $set: {
                    startShift: correction.start,
                    finishShift: correction.finish,
                    shiftDuration: newDuration,
                    correct: correction.table_num_mng,
                    monthHours: adjustedMonthHours
                }
            }
        ).exec();
    }

    async getCurrentShiftStaff(): Promise<CurrentCrewShift[]> {
        const activeShifts = await CrewShiftModel.find({
            finishShift: null
        }).exec();

        const result: CurrentCrewShift[] = [];

        for (const shift of activeShifts) {
            const employee = await EmployeeModel.findOne({ table_num: shift.table_num }).exec();

            const currentShift: CurrentCrewShift = {
                ...shift.toObject(),
                status: 'active',
                employeeInfo: employee ? {
                    firstName: employee.firstName,
                    lastName: employee.lastName
                } : undefined
            };

            result.push(currentShift);
        }

        return result;
    }

    async getActiveShiftByEmployee(table_num: string): Promise<CrewShift | null> {
        return await CrewShiftModel.findOne({
            table_num,
            finishShift: null
        }).exec();
    }

    async canStartShift(table_num: string): Promise<boolean> {
        try {
            const activeShift = await this.getActiveShiftByEmployee(table_num);
            if (activeShift) {
                return false;
            }

            return await checkMinRestTime(table_num, configuration.minRestHours || 8);
        } catch (error) {
            return false;
        }
    }
}

export const shiftServiceMongo = new ShiftServiceMongoImpl();