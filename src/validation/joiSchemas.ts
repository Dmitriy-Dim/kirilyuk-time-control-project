import Joi, {string} from 'joi'
import {Roles} from "../utils/Roles.js";

export const EmployeeDtoSchema = Joi.object({
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
    password: Joi.string().alphanum().min(8).required(),
    id: Joi.string().length(9).required(),
});
export const ChangePassDtoSchema = Joi.object({
    id:Joi.string().length(9).required(),
    newPassword: Joi.string().alphanum().min(8).required(),
});

export const UpdateEmployeeDtoSchema = Joi.object({
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
});

export const ChangeRolesSchema = Joi.array<Roles[]>()

export type ArraySchema = typeof ChangeRolesSchema;

export const ShiftStartDtoSchema = Joi.object({
    table_num: Joi.string().required().messages({
        'any.required': 'Table number is required',
        'string.empty': 'Table number cannot be empty'
    })
});

export const ShiftFinishDtoSchema = Joi.object({
    table_num: Joi.string().required().messages({
        'any.required': 'Table number is required',
        'string.empty': 'Table number cannot be empty'
    })
});

export const BreakDtoSchema = Joi.object({
    table_num: Joi.string().required().messages({
        'any.required': 'Table number is required',
        'string.empty': 'Table number cannot be empty'
    }),
    duration: Joi.number().valid(15, 30).required().messages({
        'any.required': 'Break duration is required',
        'any.only': 'Break duration must be either 15 or 30 minutes'
    })
});

export const ShiftCorrectionDtoSchema = Joi.object({
    table_num_crew: Joi.string().required().messages({
        'any.required': 'Crew table number is required',
        'string.empty': 'Crew table number cannot be empty'
    }),
    table_num_mng: Joi.string().required().messages({
        'any.required': 'Manager table number is required',
        'string.empty': 'Manager table number cannot be empty'
    }),
    start: Joi.number().positive().required().messages({
        'any.required': 'Start time is required',
        'number.positive': 'Start time must be a positive timestamp'
    }),
    finish: Joi.number().positive().required().messages({
        'any.required': 'Finish time is required',
        'number.positive': 'Finish time must be a positive timestamp'
    }),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
        'any.required': 'Date is required',
        'string.pattern.base': 'Date must be in YYYY-MM-DD format'
    })
}).custom((value, helpers) => {
    if (value.start >= value.finish) {
        return helpers.message({ custom: 'Start time must be before finish time' });
    }
    return value;
});