import { Outlet, Link } from "react-router-dom";
import "./Sidebar.css"
import { useAuthContextData } from "../../../middleware/AuthProvider";

export default function Sidebar({ children }: { children: any }) {
    const { getAccessToken } = useAuthContextData();
    return (
        <>
            <nav className="sidebar">
                {
                    getAccessToken?.() &&
                    <ul>
                        <li>
                            <Link to="/intro">Intro</Link>
                        </li>
                        <li>
                            <Link to="/secured/">Home</Link>
                        </li>
                        <li>
                            <Link to="/secured/chats">Chats</Link>
                        </li>
                    </ul>
                }
                {
                    !getAccessToken?.() &&
                    <ul>
                        <li>
                            <Link to="/intro">Intro</Link>
                        </li>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                        <li>
                            <Link to="/register">Register</Link>
                        </li>
                    </ul>
                }
            </nav>
        </>
    )
}