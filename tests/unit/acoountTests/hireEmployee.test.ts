
import {accountServiceMongo} from "../../../src/services/AccountServiceMongoImpl.ts";
import {EmployeeModel} from "../../../src/model/EmployeeMongoModels.ts";
import {Employee} from "../../../src/model/Employee.ts";
import {checkFiredEmployees} from "../../../src/utils/tools.ts";
jest.mock("../../../src/model/EmployeeMongoModels.ts");
jest.mock("../../../src/utils/tools.ts");

describe('AccountServiceMongoImpl.hireEmployee',()=>{
    const service = accountServiceMongo;

    const mockEmployee = {
        _id: "123",
        firstName: "Mokko", hash: "222",
        lastName: "Kokko",
        roles: "crew",
        table_num: "234"
    };
    //==========================
    test("Fail test:Employee exists", async () => {

        (EmployeeModel.findById as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockEmployee)
        });

        await expect(service.hireEmployee(mockEmployee as Employee)).rejects.toThrow(
            `Employee with id ${mockEmployee._id} already exists`);
        expect(EmployeeModel.findById).toHaveBeenCalledWith(mockEmployee._id);
    });
    //=============================

    test("Fail test:Employee was fierd early", async () => {
        (EmployeeModel.findById as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(null)
        });
        (checkFiredEmployees as jest.Mock).mockRejectedValue(new Error('mock Error'));
        await expect(service.hireEmployee(mockEmployee as Employee)).rejects.toThrow('mock Error');
        expect(EmployeeModel.findById).toHaveBeenCalledWith(mockEmployee._id);
        expect(checkFiredEmployees).toHaveBeenCalledWith(mockEmployee._id);
    })


    test('Create new account', async () => {
        (EmployeeModel.findById as jest.Mock).mockReturnValue({
            exec: jest.fn().mockResolvedValue(null)
        });
        (checkFiredEmployees as jest.Mock).mockResolvedValue(undefined);

        (EmployeeModel as unknown as jest.Mock).mockImplementation(()=>({
            save: jest.fn().mockResolvedValue(mockEmployee)
        }));

        const result = await service.hireEmployee(mockEmployee as Employee);
        expect(EmployeeModel.findById).toHaveBeenCalledWith(mockEmployee._id);
        expect(checkFiredEmployees).toHaveBeenCalledWith(mockEmployee._id);
        expect(result).toEqual(mockEmployee);
    })

})