
import {accountServiceMongo} from "../../../src/services/AccountServiceMongoImpl.ts";
import {EmployeeModel, FiredEmployeeModel} from "../../../src/model/EmployeeMongoModels.ts";
import {convertEmployeeToFiredEmployee} from "../../../src/utils/tools.ts";
jest.mock("../../../src/utils/tools.ts");
jest.mock("../../../src/model/EmployeeMongoModels.ts");

describe("AccountServiceMongoImpl.fireEmployee", () => {
    const service = accountServiceMongo;
    const mockEmployee = {
        _id: "123",
        firstName: "Mokko",
        hash: "222",
        lastName: "Kokko",
        roles: "crew",
        table_num: "234"
    };
    const mockFiredEmployee = {
        firstName: "Mokko",
        lastName: "Kokko",
        _id: "123",
        table_num:"234",
        fireDate:'now',
    }

    test("Test fail: Employee not exists", () => {
        (EmployeeModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
        expect(service.fireEmployee('1234')).rejects.toThrow('Employee with id 1234 not found')
        expect(EmployeeModel.findByIdAndDelete).not.toHaveBeenCalledWith('123');
    });
    test('Test passed',async ()=>{
        (EmployeeModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockEmployee);
        (convertEmployeeToFiredEmployee as jest.Mock).mockReturnValue(mockFiredEmployee);
        (FiredEmployeeModel as unknown as jest.Mock).mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(mockFiredEmployee)
        }));
       await expect(service.fireEmployee('123')).resolves.toEqual(mockFiredEmployee);
        expect(EmployeeModel.findByIdAndDelete).toHaveBeenCalledWith('123');
        expect(convertEmployeeToFiredEmployee).toHaveBeenCalledWith(mockEmployee);
        expect(FiredEmployeeModel).toHaveBeenCalledWith(mockFiredEmployee);

    })


})