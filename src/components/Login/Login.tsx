import AuthService from "../../services/AuthService"
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    const handleSubmit = async (event: any) => {
        const formData = new FormData(event.currentTarget);
        event.preventDefault();
        const data = {
            'email': formData.get('email'),
            'password': formData.get('password'),
        };
        if (await AuthService.login(data)) {
            navigate('/home', {replace: true});
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