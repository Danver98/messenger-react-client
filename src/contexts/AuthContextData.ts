import User from "../models/User";
export default interface AuthContextData {
    user?: User | null;
    setUser?: ((user?: User | null) => any) | null;
    // Simple token reference doesn't work!
    token?: string;
    getAccessToken?: () => string | null;
    setToken?: (token: any) => any;
    refreshToken?: string;
    setRefreshToken?: (token: any) => any;
    setData?: () => {};
    clear?: () => {
    };
}