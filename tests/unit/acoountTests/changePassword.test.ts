
import { accountServiceMongo } from "../../../src/services/AccountServiceMongoImpl.ts";
import { EmployeeModel } from "../../../src/model/EmployeeMongoModels.ts";
import bcrypt from "bcrypt";

jest.mock("../../../src/model/EmployeeMongoModels.ts");
jest.mock("bcrypt");

describe("AccountServiceMongoImpl.changePassword", () => {
    const service = accountServiceMongo;
    const empId = "123";
    const newPassword = "newSecurePassword";
    const hashedPassword = "hashedNewPassword";

    test("Fail test: Employee not found", async () => {
        (bcrypt.hashSync as jest.Mock).mockReturnValue(hashedPassword);
        (EmployeeModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

        await expect(service.changePassword(empId, newPassword)).rejects.toThrow(
            `Employee with id ${empId} not found`
        );

        expect(bcrypt.hashSync).toHaveBeenCalledWith(newPassword, 10);
        expect(EmployeeModel.findByIdAndUpdate).toHaveBeenCalledWith(
            empId,
            { $set: { hash: hashedPassword } },
            { new: true }
        );
    });

    test("Passed test: Password changed successfully", async () => {
        const mockUpdatedEmployee = {
            _id: empId,
            firstName: "Mokko",
            lastName: "Kokko",
            roles: "crew",
            table_num: "234",
            hash: hashedPassword
        };

        (bcrypt.hashSync as jest.Mock).mockReturnValue(hashedPassword);
        (EmployeeModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedEmployee);

        await expect(service.changePassword(empId, newPassword)).resolves.toBeUndefined();

        expect(bcrypt.hashSync).toHaveBeenCalledWith(newPassword, 10);
        expect(EmployeeModel.findByIdAndUpdate).toHaveBeenCalledWith(
            empId,
            { $set: { hash: hashedPassword } },
            { new: true }
        );
    });
});