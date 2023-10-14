import User from "../models/User";
export default interface AuthContextData {
    user?: User;
    token?: string;
    setData?: () => {};
    clear?: () => {
    };
}