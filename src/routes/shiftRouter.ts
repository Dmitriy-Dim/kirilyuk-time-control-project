import express from "express";
import { bodyValidation } from "../validation/bodyValidation.js";
import {
    ShiftStartDtoSchema,
    ShiftFinishDtoSchema,
    BreakDtoSchema,
    ShiftCorrectionDtoSchema
} from "../validation/joiSchemas.js";
import * as controller from '../controllers/shiftController.js';

export const shiftRouter = express.Router();

// Начать смену
shiftRouter.post('/start', bodyValidation(ShiftStartDtoSchema), controller.startShift);
// Завершить смену
shiftRouter.post('/finish', bodyValidation(ShiftFinishDtoSchema), controller.finishShift);
// Зарегистрировать перерыв
shiftRouter.post('/break', bodyValidation(BreakDtoSchema), controller.takeBreak);
// Коррекция времени смены (только для менеджеров)
shiftRouter.patch('/correct', bodyValidation(ShiftCorrectionDtoSchema), controller.correctShift);
// Получить текущий состав смены
shiftRouter.get('/current', controller.getCurrentShiftStaff);
// Получить активную смену конкретного сотрудника
shiftRouter.get('/employee', controller.getActiveShiftByEmployee);
// Проверить возможность начать смену
shiftRouter.get('/can-start', controller.canStartShift);