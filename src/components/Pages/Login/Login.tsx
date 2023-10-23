import { useAuthContextData } from "../../../middleware/AuthProvider";
import User from "../../../models/User";
import AuthService from "../../../services/AuthService"
import { SecuredPages } from "../../../util/Constants";
import { useAccessToken } from "../../hooks/useToken";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const authContext = useAuthContextData();

    const handleSubmit = async (event: any) => {
        const formData = new FormData(event.currentTarget);
        event.preventDefault();
        const data = {
            'email': formData.get('email'),
            'password': formData.get('password'),
        };
        const user: User = await AuthService.login(data);
        if (user) {
            authContext.setUser?.(user);
            navigate(SecuredPages.HOME_PAGE, {replace: true});
        };
        // Check if success and navigate to '/home'
    }

    return (
        <div className="login-wrapper">
            <h1>Login</h1>
            <form
                method="POST"
                onSubmit={handleSubmit}
                >
                <label htmlFor="email">
                    <p>Email</p>
                    <input name="email" type="email" required={true} onChange={e => {return}}></input>
                </label>
                <label htmlFor="password">
                    <p>Password</p>
                    <input name="password" type="password" required={true} onChange={e => {return}}></input>
                </label>

                <div className="margin-top-m">
                    <button type="submit">Login</button>
                </div>
            </form>
        </div>
    )
}