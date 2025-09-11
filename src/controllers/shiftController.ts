import { NextFunction, Response, Request } from "express";
import { shiftServiceMongo } from "../services/ShiftServiceMongoImpl.js";
import { ShiftStartDto, ShiftFinishDto, BreakDto, ShiftCorrectionDto } from "../model/CrewShift.js";
import { logError, logInfo, logWarn } from "../logger/winston.js";

const service = shiftServiceMongo;

export const startShift = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { table_num } = req.body as ShiftStartDto;
        const result = await service.startShift(table_num);

        logInfo(`Shift started successfully`, {
            tableNum: table_num,
            startTime: new Date(result.time).toISOString(),
            shiftId: result.time, // можно добавить shift_id если доступен
            method: req.method,
            url: req.originalUrl
        });

        res.status(201).json(result);
    } catch (error) {
        logError('Error starting shift', error, {
            tableNum: req.body?.table_num,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        next(error);
    }
};

export const finishShift = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { table_num } = req.body as ShiftFinishDto;
        const result = await service.finishShift(table_num);

        logInfo(`Shift finished successfully`, {
            tableNum: table_num,
            finishTime: new Date(result.time).toISOString(),
            method: req.method,
            url: req.originalUrl
        });

        res.json(result);
    } catch (error) {
        logError('Error finishing shift', error, {
            tableNum: req.body?.table_num,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        next(error);
    }
};

export const takeBreak = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { table_num, duration } = req.body as BreakDto;
        await service.takeBreak(table_num, duration);

        logInfo(`Break registered successfully`, {
            tableNum: table_num,
            breakDuration: duration,
            breakTime: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl
        });

        res.json({
            message: `Break ${duration} minutes registered for employee ${table_num}`
        });
    } catch (error) {
        logError('Error taking break', error, {
            tableNum: req.body?.table_num,
            duration: req.body?.duration,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        next(error);
    }
};

export const correctShift = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const correction = req.body as ShiftCorrectionDto;
        await service.correctShift(correction);

        logInfo(`Shift correction applied successfully`, {
            crewTableNum: correction.table_num_crew,
            managerTableNum: correction.table_num_mng,
            correctionDate: correction.date,
            newStartTime: new Date(correction.start).toISOString(),
            newFinishTime: new Date(correction.finish).toISOString(),
            method: req.method,
            url: req.originalUrl
        });

        res.json({
            message: `Shift corrected for employee ${correction.table_num_crew} by manager ${correction.table_num_mng}`
        });
    } catch (error) {
        logError('Error correcting shift', error, {
            correctionData: req.body,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        next(error);
    }
};

export const getCurrentShiftStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await service.getCurrentShiftStaff();

        logInfo(`Current shift staff retrieved`, {
            activeShiftsCount: result.length,
            activeEmployees: result.map(shift => shift.table_num),
            method: req.method,
            url: req.originalUrl
        });

        res.json(result);
    } catch (error) {
        logError('Error getting current shift staff', error, {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        next(error);
    }
};

export const getActiveShiftByEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const table_num = req.query.table_num as string;

        if (!table_num) {
            logWarn('Get active shift: missing table_num parameter', {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip
            });
            return res.status(400).json({
                error: 'table_num query parameter is required'
            });
        }

        const result = await service.getActiveShiftByEmployee(table_num);

        if (!result) {
            logInfo(`No active shift found for employee`, {
                tableNum: table_num,
                method: req.method,
                url: req.originalUrl
            });
            return res.status(404).json({
                message: `No active shift found for employee ${table_num}`
            });
        }

        logInfo(`Active shift retrieved for employee`, {
            tableNum: table_num,
            shiftId: result.shift_id,
            startTime: new Date(result.startShift).toISOString(),
            method: req.method,
            url: req.originalUrl
        });

        res.json(result);
    } catch (error) {
        logError('Error getting active shift by employee', error, {
            tableNum: req.query.table_num,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        next(error);
    }
};

export const canStartShift = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const table_num = req.query.table_num as string;

        if (!table_num) {
            logWarn('Can start shift check: missing table_num parameter', {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip
            });
            return res.status(400).json({
                error: 'table_num query parameter is required'
            });
        }

        const canStart = await service.canStartShift(table_num);

        logInfo(`Shift start eligibility checked`, {
            tableNum: table_num,
            canStart,
            method: req.method,
            url: req.originalUrl
        });

        res.json({ table_num, canStart });
    } catch (error) {
        logError('Error checking if can start shift', error, {
            tableNum: req.query.table_num,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        next(error);
    }
};