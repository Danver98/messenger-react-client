import User from "../models/User";
import HttpService from "./HttpService";

export interface AuthData {
    user: User;
    accessToken: string;
    refreshToken: string;
}

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
        return HttpService.postJson(AuthService.URL + '/register', data);
    }

    async login(data: object): Promise<AuthData> {
        return HttpService.postJson(AuthService.URL + '/login', data);
    }

    async logout(userId: number | string): Promise<any> {
        return HttpService.get(AuthService.URL + `/logout/${userId}`);
    }

    async getRefreshToken(): Promise<any> {
        return HttpService.get(AuthService.URL + `/refreshToken`); 
    }

    async getAccessToken(): Promise<any> {
        return HttpService.get(AuthService.URL + `/accessToken`);
    }
}

export default AuthService.Instance;