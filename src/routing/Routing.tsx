import Layout from "../components/Layout/Layout";
import { useAuthContextData } from "../middleware/AuthProvider"
import {
    createBrowserRouter,
    RouterProvider
} from "react-router-dom";
import ProtectedRoute from "../middleware/ProtectedRoute";
import Chats from "../components/Pages/Chats/Chats";
import Intro from "../components/Pages/Intro";
import Register from "../components/Pages/Register/Register";
import Login from "../components/Pages/Login/Login";
import Home from "../components/Pages/Home";
import Profile from "../components/Pages/Settings/Profile";
import Settings from "../components/Pages/Settings/Settings";

const Routing = () => {
    const { getAccessToken } = useAuthContextData();

    const authenticatedRoutes = [
        {
            path: '/secured',
            element: <ProtectedRoute />,
            children: [
                {
                    path: '/secured/home',
                    element: <Home />
                },
                {
                    path: '/secured/chats',
                    element: <Chats />
                },
                {
                    path: '/secured/profile',
                    element: <Profile />
                },
                {
                    path: '/secured/settings',
                    element: <Settings />
                }
            ]
        },
    ];

    const notAuthenticatedRoutes = [
        {
            path: '/register',
            element: <Register />
        },
        {
            path: '/Login',
            element: <Login />
        },
    ];

    const publicRoutes = [
        {
            path: '/intro',
            element: <Intro />
        },
    ];

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                ...publicRoutes,
                ...(!getAccessToken?.() ? notAuthenticatedRoutes : []),
                ...authenticatedRoutes
            ]
        },
    ]);

    return <RouterProvider router={router} />
}

export default Routing;