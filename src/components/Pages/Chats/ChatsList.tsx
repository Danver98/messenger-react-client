import { forwardRef, } from "react";
import Chat from "../../../models/Chat";
import "./Chats.css";
import "../../../_styles/Common.css";
import { useNavigate } from "react-router-dom";
import { SecuredPages } from "../../../util/Constants";

const ItemBody = ({ chat }: { chat: Chat }) => {
    return (
        <>
            <img
                src={chat.avatar}
                alt={chat.name}
                className="chat-list-item__image"
            />
            <p className="chat-list-item__name">
                <b>{chat.name}</b>
            </p>
            <div className="chat-list-item__date">
                <span>{chat.getTime()?.toLocaleTimeString("ru")}</span>
                <br />
                <span>{chat.getTime()?.toLocaleDateString("ru")}</span>
            </div>
        </>
    )
}

const ChatListItem = forwardRef(({ chat, isLast, clickHandler }: 
    { chat: Chat, isLast: boolean, clickHandler?: (chat: Chat) => void }, ref?: any) => {
    if (isLast) {
        return (
            <li
                key={chat.id}
                ref={ref}
                onClick={() => {clickHandler?.(chat)}}
                className="chat-list-item"
            >
                <ItemBody chat={chat} />
            </li>
        )
    }
    return (
        <li
            key={chat.id}
            onClick={() => {clickHandler?.(chat)}}
            className="chat-list-item"
        >
            <ItemBody chat={chat} />
        </li>
    )
})

const ChatsList = forwardRef(({ chats }: { chats: Chat[] }, ref: any) => {
    const navigate = useNavigate();

    if (chats == null || chats.length == 0 ) {
        return (
            <>
                No chats!
            </>
        )
    }

    const itemClickHandler = (chat: Chat) => {
        navigate(SecuredPages.CHAT_ROOM_PAGE, {
            state: {
                chat
            }
        });
    }

    const listItems = chats.map((chat, index) =>
        <ChatListItem chat={chat} isLast={index == chats.length - 1} clickHandler={itemClickHandler} ref={ref} />
    )
    return (
        <ul className="chat-list">{listItems}</ul>
    )
})

export default ChatsList;