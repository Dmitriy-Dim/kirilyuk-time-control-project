import { accountServiceMongo } from "../../../src/services/AccountServiceMongoImpl.ts";
import { EmployeeModel } from "../../../src/model/EmployeeMongoModels.ts";

jest.mock("../../../src/model/EmployeeMongoModels.ts");

describe("AccountServiceMongoImpl.getEmployeeById", () => {
    test("Fail test: employee not found", async () => {
        const service = accountServiceMongo;

        (EmployeeModel.findById as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(null)
        });

        await expect(service.getEmployeeById("Unknown")).rejects.toThrow(
            "Employee with id Unknown not found"
        );
    });
});
