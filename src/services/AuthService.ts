import HttpService from "./HttpService";

export class AuthService {

    private static _instance: AuthService;
    private static readonly URL = '/auth';

    private constructor() {

    }

    static get Instance() {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());      
    }

    async register(data: object): Promise<any> {
        return HttpService.post(AuthService.URL + '/register', data);
    }

    async login(data: object): Promise<any> {
        return HttpService.post(AuthService.URL + '/login', data);
    }

    async logout(userId: number | string): Promise<any> {
        return HttpService.get(AuthService.URL + `/logout/${userId}`);
    }

    async refreshToken(): Promise<any> {

    }
}

export default AuthService.Instance;