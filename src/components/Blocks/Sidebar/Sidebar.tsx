import { Outlet, Link } from "react-router-dom";
import "./Sidebar.css"

export default function Sidebar({ children }: { children: any }) {
    return (
        <>
            <nav className="sidebar">
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
                    <li>
                        <Link to="/login">Login</Link>
                    </li>
                    <li>
                        <Link to="/register">Register</Link>
                    </li>
                </ul>
            </nav>
        </>
    )
}