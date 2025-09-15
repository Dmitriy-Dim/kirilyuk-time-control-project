
import { accountServiceMongo } from "../../../src/services/AccountServiceMongoImpl.ts";
import { EmployeeModel } from "../../../src/model/EmployeeMongoModels.ts";

jest.mock("../../../src/model/EmployeeMongoModels.ts");

describe("AccountServiceMongoImpl.getAllEmployees", () => {
    const service = accountServiceMongo;

    test("Passed test: Empty employees list", async () => {
        (EmployeeModel.find as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue([])
        });

        await expect(service.getAllEmployees()).resolves.toEqual([]);

        expect(EmployeeModel.find).toHaveBeenCalledWith({});
    });

    test("Passed test: Return list of employees", async () => {
        const mockEmployees = [
            {
                _id: "123",
                firstName: "Mokko",
                lastName: "Kokko",
                roles: "crew",
                table_num: "234",
                hash: "hashedPassword1"
            },
            {
                _id: "456",
                firstName: "Anna",
                lastName: "Smith",
                roles: "manager",
                table_num: "567",
                hash: "hashedPassword2"
            }
        ];

        (EmployeeModel.find as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockEmployees)
        });

        await expect(service.getAllEmployees()).resolves.toEqual(mockEmployees);

        expect(EmployeeModel.find).toHaveBeenCalledWith({});
    });
});