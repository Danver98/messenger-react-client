import { Outlet} from 'react-router-dom';
import Login from '../components/Login/Login';
import { useAccessToken } from '../components/hooks/useToken';

export default function ProtectedRoute() {
    const { accessToken } = useAccessToken();
    if (accessToken) {
        return <Outlet />
    }

    return <Login />
}