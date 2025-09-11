import {Request, Response, NextFunction} from "express";
import {HttpError} from "./HttpError.js";
import {logError, logWarn, logInfo} from "../logger/winston.js";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestInfo = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    };

    if (err instanceof HttpError) {
        if (err.status === 401) {
            res.status(err.status).json({ error: err.message });
            return;
        } else if (err.status >= 500) {
            logError(`Server Error ${err.status}`, err, {
                ...requestInfo,
                statusCode: err.status
            });
        } else if (err.status >= 400) {
            logWarn(`Client Error ${err.status}: ${err.message}`, {
                ...requestInfo,
                statusCode: err.status
            });
        }

        res.status(err.status).json({ error: err.message });
    } else {
        logError('Unknown server error', err, {
            ...requestInfo,
            statusCode: 500
        });

        res.status(500).json({
            error: 'Unknown server error: ' + err.message
        });
    }
};