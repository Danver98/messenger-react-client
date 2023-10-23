import { useContext } from "react"
import AuthContext from "../../../../contexts/AuthContext";
import './UserInfo.css';
import { useNavigate } from "react-router-dom";
import { Pages } from "../../../../util/Constants";
import AuthService from "../../../../services/AuthService";
import { useAuthContextData } from "../../../../middleware/AuthProvider";
import { Button, TextField } from "@mui/material";


export default function UserInfo() {
    //const authContext = useAuthContextData();
    const {user, setUser, getAccessToken, setToken } = useAuthContextData();
    const navigate = useNavigate();

    const logout = async () => {
        // At least clear token in storage;
        setToken?.(null);
        setUser?.(null);
        if (!user) {
            return;
        }
        await AuthService.logout(user.id);
        navigate(Pages.LOGIN_PAGE, {replace: true})
    }

    return (
        <>
            {
                user && getAccessToken?.() ?
                    <div className="UserInfo__block">
                        {/* Logged in */}
                        <img className="UserInfo__image-rounded" src={user.avatar} />
                        <label className="UserInfo__credentials">
                            {user.name + ' ' + user.surname}
                        </label>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={ () => {logout()}}>Logout
                        </Button>
                    </div>
                    :
                    'Not logged'
            }
        </>
    )
}