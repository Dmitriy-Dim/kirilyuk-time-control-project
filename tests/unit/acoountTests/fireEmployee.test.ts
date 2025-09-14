
import {accountServiceMongo} from "../../../src/services/AccountServiceMongoImpl.ts";

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


})