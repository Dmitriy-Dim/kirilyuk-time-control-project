import {ObjectSchema} from 'joi'
import {Response, Request, NextFunction} from "express";
import {HttpError} from "../errorHandler/HttpError.js";
import {ArraySchema} from "./joiSchemas.js";
import {logWarn} from "../logger/winston.js";

export const bodyValidation = (schema: ObjectSchema | ArraySchema) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body) {
                logWarn('Validation failed: Request body is missing', {
                    method: req.method,
                    url: req.originalUrl,
                    ip: req.ip
                });
                throw new HttpError(400, "Body required");
            }

            const { error } = schema.validate(req.body);

            if (error) {
                logWarn('Validation failed: Invalid request body', {
                    method: req.method,
                    url: req.originalUrl,
                    validationError: error.message,
                    requestBody: req.body,
                    ip: req.ip
                });
                throw new HttpError(400, error.message);
            }

            next();
        } catch (err) {
            next(err);
        }
    }