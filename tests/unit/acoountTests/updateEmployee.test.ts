
import { accountServiceMongo } from "../../../src/services/AccountServiceMongoImpl.ts";
import { EmployeeModel } from "../../../src/model/EmployeeMongoModels.ts";
import { UpdateEmployeeDto } from "../../../src/model/Employee.ts";

jest.mock("../../../src/model/EmployeeMongoModels.ts");

describe("AccountServiceMongoImpl.updateEmployee", () => {
    const service = accountServiceMongo;
    const empId = "123";
    const updateDto: UpdateEmployeeDto = {
        firstName: "NewFirstName",
        lastName: "NewLastName"
    };

    test("Fail test: Employee updating failed", async () => {
        (EmployeeModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(null)
        });

        await expect(service.updateEmployee(empId, updateDto)).rejects.toThrow(
            "Employee updating failed!"
        );

        expect(EmployeeModel.findByIdAndUpdate).toHaveBeenCalledWith(
            empId,
            { $set: { firstName: updateDto.firstName, lastName: updateDto.lastName } },
            { new: true }
        );
    });

    test("Passed test: Employee updated successfully", async () => {
        const mockUpdatedEmployee = {
            _id: empId,
            firstName: updateDto.firstName,
            lastName: updateDto.lastName,
            roles: "crew",
            table_num: "234",
            hash: "hashedPassword"
        };

        (EmployeeModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUpdatedEmployee)
        });

        await expect(service.updateEmployee(empId, updateDto)).resolves.toEqual(mockUpdatedEmployee);

        expect(EmployeeModel.findByIdAndUpdate).toHaveBeenCalledWith(
            empId,
            { $set: { firstName: updateDto.firstName, lastName: updateDto.lastName } },
            { new: true }
        );
    });
});