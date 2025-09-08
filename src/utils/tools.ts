import {Employee, EmployeeDto, SavedFiredEmployee} from "../model/Employee.js";
import bcrypt from 'bcrypt'
import {Roles} from "./Roles.js";
import {v4 as uuidv4} from 'uuid';
import {HttpError} from "../errorHandler/HttpError.js";
import {FiredEmployeeModel} from "../model/EmployeeMongoModels.js";


function generateTabNumber() {
    return uuidv4();
}

export const convertEmployeeDtoToEmployee = (dto:EmployeeDto) => {

    const employee:Employee = {
        firstName: dto.firstName,
        lastName: dto.lastName,
        _id: dto.id,
        hash: bcrypt.hashSync(dto.password, 10),
        table_num: generateTabNumber(),
        roles: Roles.CREW
    }

    return employee;
}

export const checkFiredEmployees = async(id:string) => {
    if(await FiredEmployeeModel.findOne({id}))
        throw new HttpError(409,  "This employee was fired");
}

export const convertEmployeeToFiredEmployee = (emp:Employee) =>{
    const fired:SavedFiredEmployee = {
        fireDate: new Date().toDateString(),
        firstName: emp.firstName,
        lastName: emp.lastName,
        _id: emp._id,
        table_num: emp.table_num
    }
    return fired;
}
export const checkRole = (role:string) => {
    const newRole = Object.values(Roles).find(r => r === role)
    if(!newRole) throw new HttpError(400, "Wrong role!");
    return newRole;
}

import { CrewShiftModel } from "../model/CrewShiftMongoModels.js";

export const generateShiftId = async (date: Date = new Date()): Promise<string> => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const lastShift = await CrewShiftModel
        .findOne({
            startShift: {
                $gte: dateStart.getTime(),
                $lte: dateEnd.getTime()
            }
        })
        .sort({ shift_id: -1 })
        .exec();

    let shiftNumber = 1;
    if (lastShift && lastShift.shift_id) {
        const lastNumber = parseInt(lastShift.shift_id.slice(-2));
        shiftNumber = lastNumber + 1;
    }

    const shiftNumberStr = String(shiftNumber).padStart(2, '0');
    return `${day}${month}${year}${shiftNumberStr}`;
};

export const calculateMonthHours = async (table_num: string, currentDate: Date = new Date()): Promise<number> => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const shifts = await CrewShiftModel.find({
        table_num,
        startShift: {
            $gte: monthStart.getTime(),
            $lte: monthEnd.getTime()
        },
        finishShift: { $ne: null }
    }).exec();

    return shifts.reduce((total, shift) => total + shift.shiftDuration, 0);
};

export const calculateShiftDuration = (startTime: number, endTime: number, breaks: any[]): number => {
    const totalTime = Math.floor((endTime - startTime) / (1000 * 60)); // в минутах
    const breakTime = breaks.reduce((total, breakItem) => total + breakItem.duration, 0);
    return totalTime - breakTime;
};

export const canTakeBreak = (shiftDurationMinutes: number, currentBreaks: any[], requestedDuration: 15 | 30): boolean => {
    const totalBreakTime = currentBreaks.reduce((total, breakItem) => total + breakItem.duration, 0);

    if (shiftDurationMinutes < 4 * 60) { // менее 4 часов
        return false;
    } else if (shiftDurationMinutes >= 4 * 60 && shiftDurationMinutes < 6 * 60) { // 4-6 часов
        return totalBreakTime + requestedDuration <= 15;
    } else if (shiftDurationMinutes >= 6 * 60) { // более 6 часов
        return totalBreakTime + requestedDuration <= 30;
    }

    return false;
};

export const checkMinRestTime = async (table_num: string, minRestHours: number): Promise<boolean> => {
    const lastShift = await CrewShiftModel
        .findOne({
            table_num,
            finishShift: { $ne: null }
        })
        .sort({ finishShift: -1 })
        .exec();

    if (!lastShift || !lastShift.finishShift) {
        return true;
    }

    const now = Date.now();
    const minRestMs = minRestHours * 60 * 60 * 1000;

    return (now - lastShift.finishShift) >= minRestMs;
};