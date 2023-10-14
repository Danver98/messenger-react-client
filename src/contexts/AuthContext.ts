import { createContext, } from "react";
import AuthContextData from "./AuthContextData";

const AuthContext = createContext<AuthContextData>({})
export default AuthContext;