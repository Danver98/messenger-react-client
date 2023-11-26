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
import { SecuredPages } from "../util/Constants";

const Routing = () => {
    const { getAccessToken } = useAuthContextData();

    const authenticatedRoutes = [
        {
            path: SecuredPages.ROOT,
            element: <ProtectedRoute />,
            children: [
                {
                    path: SecuredPages.HOME_PAGE,
                    element: <Home />
                },
                {
                    path: SecuredPages.CHATS_PAGE,
                    element: <Chats />
                },
                {
                    path: SecuredPages.PROFILE_PAGE,
                    element: <Profile />
                },
                {
                    path: SecuredPages.SETTINGS,
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