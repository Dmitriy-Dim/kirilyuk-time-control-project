import winston from 'winston';
import {configuration} from "../config/timeControlConfig.js";

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaString = '';
        if (Object.keys(meta).length > 0) {
            metaString = ' ' + JSON.stringify(meta);
        }
        return `${timestamp} [${level}]: ${message}${metaString}`;
    })
);

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
    winston.format.prettyPrint()
);

export const logger = winston.createLogger({
    level: configuration.logLevel,
    format: fileFormat,
    transports: [
        new winston.transports.Console({
            format: consoleFormat
        }),
        new winston.transports.File({
            filename: 'error.log',
            level: 'error',
            format: fileFormat
        }),
        new winston.transports.File({
            filename: 'combined.log',
            format: fileFormat
        })
    ],
    exceptionHandlers: [
        new winston.transports.Console({
            format: consoleFormat
        }),
        new winston.transports.File({
            filename: 'exceptions.log',
            format: fileFormat
        })
    ],
    rejectionHandlers: [
        new winston.transports.Console({
            format: consoleFormat
        }),
        new winston.transports.File({
            filename: 'rejections.log',
            format: fileFormat
        })
    ]
});

export const logError = (message: string, error?: any, meta?: object) => {
    logger.error(message, {
        error: error?.message || error,
        stack: error?.stack,
        ...meta
    });
};

export const logWarn = (message: string, meta?: object) => {
    logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: object) => {
    logger.info(message, meta);
};

export const logDebug = (message: string, meta?: object) => {
    logger.debug(message, meta);
};