
import { accountServiceMongo } from "../../../src/services/AccountServiceMongoImpl.ts";
import { EmployeeModel } from "../../../src/model/EmployeeMongoModels.ts";
import { checkRole } from "../../../src/utils/tools.ts";

jest.mock("../../../src/model/EmployeeMongoModels.ts");
jest.mock("../../../src/utils/tools.ts");

describe("AccountServiceMongoImpl.setRole", () => {
    const service = accountServiceMongo;
    const empId = "123";
    const newRole = "manager";
    const mockEmployee = {
        _id: empId,
        firstName: "Mokko",
        lastName: "Kokko",
        roles: "crew",
        table_num: "234",
        hash: "hashedPassword"
    };

    test("Fail test: Employee not found in getEmployeeById", async () => {
        (EmployeeModel.findById as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(null)
        });

        await expect(service.setRole(empId, newRole)).rejects.toThrow(
            `Employee with id ${empId} not found`
        );

        expect(EmployeeModel.findById).toHaveBeenCalledWith(empId);
        expect(checkRole).not.toHaveBeenCalled();
    });

    test("Fail test: Invalid role", async () => {
        (EmployeeModel.findById as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockEmployee)
        });
        (checkRole as jest.Mock).mockImplementation(() => {
            throw new Error("Wrong role!");
        });

        await expect(service.setRole(empId, "invalidRole")).rejects.toThrow("Wrong role!");

        expect(EmployeeModel.findById).toHaveBeenCalledWith(empId);
        expect(checkRole).toHaveBeenCalledWith("invalidRole");
    });

    test("Fail test: Employee updating failed", async () => {
        (EmployeeModel.findById as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockEmployee)
        });
        (checkRole as jest.Mock).mockReturnValue(newRole);
        (EmployeeModel.findOneAndUpdate as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(null)
        });

        await expect(service.setRole(empId, newRole)).rejects.toThrow("Employee updating failed!");

        expect(EmployeeModel.findById).toHaveBeenCalledWith(empId);
        expect(checkRole).toHaveBeenCalledWith(newRole);
        expect(EmployeeModel.findOneAndUpdate).toHaveBeenCalledWith(
            { id: empId },
            { $set: { roles: newRole } },
            { new: true }
        );
    });

    test("Passed test: Role updated successfully", async () => {
        const mockUpdatedEmployee = {
            ...mockEmployee,
            roles: newRole
        };

        (EmployeeModel.findById as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockEmployee)
        });
        (checkRole as jest.Mock).mockReturnValue(newRole);
        (EmployeeModel.findOneAndUpdate as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUpdatedEmployee)
        });

        await expect(service.setRole(empId, newRole)).resolves.toEqual(mockUpdatedEmployee);

        expect(EmployeeModel.findById).toHaveBeenCalledWith(empId);
        expect(checkRole).toHaveBeenCalledWith(newRole);
        expect(EmployeeModel.findOneAndUpdate).toHaveBeenCalledWith(
            { id: empId },
            { $set: { roles: newRole } },
            { new: true }
        );
    });
});