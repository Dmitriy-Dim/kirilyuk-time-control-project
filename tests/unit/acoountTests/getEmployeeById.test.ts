import {accountServiceMongo} from "../../../src/services/AccountServiceMongoImpl.ts";
import {EmployeeModel} from "../../../src/model/EmployeeMongoModels.ts";

jest.mock("../../../src/model/EmployeeMongoModels.ts");

describe("AccountServiceMongoImpl.getEmployeeById", () => {
    const service = accountServiceMongo;

    test("Fail test: employee not found", async () => {


        (EmployeeModel.findById as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(null)
        });

        await expect(service.getEmployeeById("Unknown")).rejects.toThrow(
            "Employee with id Unknown not found"
        );
    });
    test("Passed test", async () => {
        const mockEmployee = {
            _id: "123",
            firstName: "Mokko", hash: "222",
            lastName: "Kokko",
            roles: "crew",
            table_num: "234"

        };
        (EmployeeModel.findById as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockEmployee)
        });
        await expect(service.getEmployeeById("123")).resolves.toEqual(mockEmployee);
        expect(EmployeeModel.findById).toHaveBeenCalledWith('123');
    })
});
