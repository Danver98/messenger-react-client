import { Navigate, Outlet } from 'react-router-dom';
import Login from '../components/Pages/Login/Login';
import AuthProvider, { useAuthContextData } from './AuthProvider';

export default function ProtectedRoute() {;
    const { getAccessToken } = useAuthContextData()
    if (getAccessToken?.()) {
        return <Outlet />
    }

    return <Navigate to="/login" />
    //return <Login />
}