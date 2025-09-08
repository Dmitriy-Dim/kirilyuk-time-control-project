import { NextFunction, Response, Request } from "express";
import { shiftServiceMongo } from "../services/ShiftServiceMongoImpl.js";
import { ShiftStartDto, ShiftFinishDto, BreakDto, ShiftCorrectionDto } from "../model/CrewShift.js";

const service = shiftServiceMongo;

export const startShift = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { table_num } = req.body as ShiftStartDto;
        const result = await service.startShift(table_num);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const finishShift = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { table_num } = req.body as ShiftFinishDto;
        const result = await service.finishShift(table_num);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const takeBreak = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { table_num, duration } = req.body as BreakDto;
        await service.takeBreak(table_num, duration);
        res.json({ message: `Break ${duration} minutes registered for employee ${table_num}` });
    } catch (error) {
        next(error);
    }
};

export const correctShift = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const correction = req.body as ShiftCorrectionDto;
        await service.correctShift(correction);
        res.json({ message: `Shift corrected for employee ${correction.table_num_crew} by manager ${correction.table_num_mng}` });
    } catch (error) {
        next(error);
    }
};

export const getCurrentShiftStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await service.getCurrentShiftStaff();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getActiveShiftByEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const table_num = req.query.table_num as string;
        if (!table_num) {
            return res.status(400).json({ error: 'table_num query parameter is required' });
        }

        const result = await service.getActiveShiftByEmployee(table_num);
        if (!result) {
            return res.status(404).json({ message: `No active shift found for employee ${table_num}` });
        }

        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const canStartShift = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const table_num = req.query.table_num as string;
        if (!table_num) {
            return res.status(400).json({ error: 'table_num query parameter is required' });
        }

        const canStart = await service.canStartShift(table_num);
        res.json({ table_num, canStart });
    } catch (error) {
        next(error);
    }
};