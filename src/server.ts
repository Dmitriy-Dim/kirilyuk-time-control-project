import express from 'express';
import {configuration} from "./config/timeControlConfig.js";
import {errorHandler} from "./errorHandler/errorHandler.js";
import * as fs from "node:fs";
import morgan from "morgan";
import {accountRouter} from "./routes/accountRouter.js";
import {shiftRouter} from "./routes/shiftRouter.js";
import {logError, logInfo} from "./logger/winston.js";


export const launchServer = () => {

    const app = express();
    app.listen(configuration.port, () => {
        logInfo(`Server started successfully`, {
            port: configuration.port,
            environment: process.env.NODE_ENV || 'development',
            logLevel: configuration.logLevel
        });
        const logStream = fs.createWriteStream('access.log', {flags:'a'});
       //==============SecurityMiddleware==========

        //=============Middlewares================
        app.use(express.json());
        app.use(morgan('dev'));
        app.use(morgan('combined', {stream:logStream}))

        //==============Routers===================
        app.use('/accounts', accountRouter);
        app.use('/shifts', shiftRouter);


        //===============ErrorHandler==============
        app.use(errorHandler)

        process.on('uncaughtException', (error) => {
            logError('Uncaught Exception - Server shutting down', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            logError('Unhandled Rejection - Server shutting down', reason, {
                promise: promise.toString()
            });
            process.exit(1);
        });
    })
}