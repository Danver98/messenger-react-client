import { useContext } from "react"
import AuthContext from "../../../../contexts/AuthContext";
import './UserInfo.css';
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, Pages } from "../../../../util/Constants";
import AuthContextData from "../../../../contexts/AuthContextData";
import { setToken } from "../../../hooks/useToken";
import AuthService from "../../../../services/AuthService";


export default function UserInfo() {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    const logout = async (context: AuthContextData) => {
        // Clear AuthContext
        if (context.clear) {
            context.clear();
        } else {
            // At least clear token in storage;
            setToken(ACCESS_TOKEN, null);
        }
        if (!context.user) {
            return;
        }
        await AuthService.logout(context.user.id);
        navigate(Pages.LOGIN_PAGE, {replace: true})
    }

    return (
        <>
            {
                authContext.user && authContext.token ?
                    <div>
                        {/* Logged in */}
                        <img className="UserInfo__image-rounded" src={authContext.user.avatar} />
                        <div> {authContext.user.name} {authContext.user.surname}</div>
                        <button onClick={ () => {logout(authContext)}}></button>
                    </div>
                    :
                    'Not logged'
            }
        </>
    )
}