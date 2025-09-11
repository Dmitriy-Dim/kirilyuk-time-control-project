import {NextFunction, Response, Request} from "express";
import {Employee, EmployeeDto, UpdateEmployeeDto} from "../model/Employee.js";
import {convertEmployeeDtoToEmployee} from "../utils/tools.js";
import {accountServiceMongo} from "../services/AccountServiceMongoImpl.js";
import {logError, logInfo, logWarn} from "../logger/winston.js";

const service = accountServiceMongo;

export const setRole = (req: Request, res: Response, next: NextFunction) => {
};

export const getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query_id = req.query.id as string;

        if (!query_id) {
            logWarn('Get employee by id: missing id parameter', {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip
            });
            return res.status(400).json({ error: 'Employee id is required' });
        }

        const result = await service.getEmployeeById(query_id);

        logInfo(`Employee retrieved successfully`, {
            employeeId: query_id,
            method: req.method,
            url: req.originalUrl
        });

        res.json(result);
    } catch (error) {
        logError('Error getting employee by id', error, {
            employeeId: req.query.id,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        next(error);
    }
};

export const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await service.getAllEmployees();

        logInfo(`Retrieved ${result.length} employees`, {
            count: result.length,
            method: req.method,
            url: req.originalUrl
        });

        res.json(result);
    } catch (error) {
        logError('Error getting all employees', error, {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        next(error);
    }
};

export const updatePassword = (req: Request, res: Response, next: NextFunction) => {

};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as UpdateEmployeeDto;
        const query_id = req.query.id as string;

        if (!query_id) {
            logWarn('Update employee: missing id parameter', {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip
            });
            return res.status(400).json({ error: 'Employee id is required' });
        }

        const result = await service.updateEmployee(query_id, body);

        logInfo(`Employee updated successfully`, {
            employeeId: query_id,
            updatedFields: Object.keys(body),
            method: req.method,
            url: req.originalUrl
        });

        res.json(result);
    } catch (error) {
        logError('Error updating employee', error, {
            employeeId: req.query.id,
            updateData: req.body,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        next(error);
    }
};

export const fireEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query_id = req.query.id as string;

        if (!query_id) {
            logWarn('Fire employee: missing id parameter', {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip
            });
            return res.status(400).json({ error: 'Employee id is required' });
        }

        const result = await service.fireEmployee(query_id);

        logInfo(`Employee fired successfully`, {
            employeeId: query_id,
            firedEmployee: `${result.firstName} ${result.lastName}`,
            fireDate: result.fireDate,
            method: req.method,
            url: req.originalUrl
        });

        res.json(result);
    } catch (error) {
        logError('Error firing employee', error, {
            employeeId: req.query.id,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        next(error);
    }
};

export const hireEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as EmployeeDto;
        const emp: Employee = convertEmployeeDtoToEmployee(body);

        const result = await service.hireEmployee(emp);

        logInfo(`Employee hired successfully`, {
            employeeId: result._id,
            employeeName: `${result.firstName} ${result.lastName}`,
            tableNum: result.table_num,
            role: result.roles,
            method: req.method,
            url: req.originalUrl
        });

        res.status(201).json(result);
    } catch (error) {
        logError('Error hiring employee', error, {
            employeeData: {
                id: req.body?.id,
                firstName: req.body?.firstName,
                lastName: req.body?.lastName
            },
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        next(error);
    }
};