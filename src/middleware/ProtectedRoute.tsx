import { Outlet } from 'react-router-dom';
import Login from '../components/Pages/Login/Login';
import { useAccessToken } from '../components/hooks/useToken';
import AuthContext from '../contexts/AuthContext';

export default function ProtectedRoute() {
    const { accessToken } = useAccessToken();
    if (accessToken || true) {
        return (
            <AuthContext.Provider value={{token: accessToken}}>
                <Outlet />
            </AuthContext.Provider>
        )
    }

    return <Login />
}