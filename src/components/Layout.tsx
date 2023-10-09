import { Outlet, Link } from "react-router-dom"

export default function Layout() {
    return (
        <>
        <nav>
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

        <Outlet />
        </>
    )
}