import UserInfo from "./UserInfo/UserInfo";
import "./Header.css";
export default function Header() {
    return (
        <>
            <div className="header">
                <div>Messenger App</div>
                <UserInfo />
            </div>
        </>
    )
}