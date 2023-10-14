import Chat from "../../../models/Chat";
import "./Chats.css";

export default function ChatListItem({ chat, isLast }: { chat: Chat, isLast: boolean }, ref?: any) {
    if (ref) {
        return (
            <li
                key={chat.id}
                ref={ref}
                className="chat-list-item"
            >
                <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="chat-list-item__image"
                />
                <p>
                    <b>{chat.name}</b>
                </p>
            </li>
        )
    }
    return (
        <li
            key={chat.id}
            className="chat-list-item"
        >
            <img
                src={chat.avatar}
                alt={chat.name}
                className="chat-list-item__image"
            />
            <p>
                <b>{chat.name}</b>
            </p>
        </li>
    )
}