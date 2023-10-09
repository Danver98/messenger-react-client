import HttpService from "./HttpService";
import User from "../models/User";

class UserService {
    // TODO: coordinate backend and frontend API
    private static _instance: UserService;

    private constructor() {

    }

    static get Instance() {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());      
    }

    async get(id: number | string): Promise<User> {
        const data = (await HttpService.get(`/user/${id}`)) as User;
        // Store user somewhere to retrieve in the app
        return new User(data.id, data.name, data.surname, data.login, data.avatar, data.password);
    }

    async create(user: object): Promise<any> {
        return HttpService.post(`/users`, user);
    }

    async update(user: User): Promise<any> {
        return HttpService.put(`/users`, user);
    }

    async delete(id: number | string): Promise<any> {
        return HttpService.delete(`/users/${id}`);
    }
}

export default UserService.Instance;