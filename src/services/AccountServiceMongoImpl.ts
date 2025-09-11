 import {AccountService} from "./AccountService.js";
import {Employee, EmployeeDto, SavedFiredEmployee, UpdateEmployeeDto} from "../model/Employee.js";
import {EmployeeModel, FiredEmployeeModel} from "../model/EmployeeMongoModels.js";
import {HttpError} from "../errorHandler/HttpError.js";
import {checkFiredEmployees, checkRole, convertEmployeeToFiredEmployee} from "../utils/tools.js";

class AccountServiceMongoImpl implements AccountService {

    changePassword(empId: string, newPassword: string): Promise<void> {
        throw "Not Implemented yet";
    }

    async fireEmployee(empId: string): Promise<SavedFiredEmployee> {
        const temp = await EmployeeModel.findByIdAndDelete(empId);
        if (!temp) throw new HttpError(404, `Employee with id ${empId} not found`);
        const fired:SavedFiredEmployee = convertEmployeeToFiredEmployee(temp as Employee);
        const firedDoc = new FiredEmployeeModel(fired);
        await firedDoc.save()
        return fired;
    }

    async getAllEmployees(): Promise<SavedFiredEmployee[]> {
        const result = await EmployeeModel.find({}).exec();
        return result as SavedFiredEmployee[]
    }

    async getEmployeeById(id: string): Promise<Employee> {
        const employee = await EmployeeModel.findById(id).exec();
        if (!employee) throw new HttpError(404, `Employee with id ${id} not found`);
        return employee;
    }

    async hireEmployee(employee: Employee): Promise<Employee> {
        const temp = await EmployeeModel.findById(employee._id).exec();
        if(temp) throw  new HttpError(409, `Employee with id ${employee._id} already exists`);

        await checkFiredEmployees(employee._id)
        const empDoc = new EmployeeModel(employee);
        await empDoc.save();
        return employee;
    }

    async setRole(id: string, newRole: string): Promise<Employee> {
        const emp = await this.getEmployeeById(id)
        const role = checkRole(newRole);
        const updated = await EmployeeModel.findOneAndUpdate({id}, {
            $set: {roles: newRole}
        }, {new: true}).exec();
        if (!updated) throw new HttpError(500, "Employee updating failed!");
        return updated as Employee

    }

    updateEmployee(empId: string, employee: UpdateEmployeeDto): Promise<Employee> {
        throw "Not Implemented yet";
    }

}
export const accountServiceMongo = new AccountServiceMongoImpl();