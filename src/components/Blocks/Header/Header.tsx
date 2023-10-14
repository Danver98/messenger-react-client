import UserInfo from "./UserInfo/UserInfo";
import "./Header.css";
export default function Header() {
    return (
        <>
            <div className="header">
                <div>This is Header</div>
                <div className="UserInfo__block">
                    <UserInfo />
                </div>
            </div>
        </>
    )
}