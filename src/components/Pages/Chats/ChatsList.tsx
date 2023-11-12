import { forwardRef, } from "react";
import Chat from "../../../models/Chat";
import "./Chats.css";
import "../../../_styles/Common.css";

const ItemBody = ({ chat }: { chat: Chat }) => {
    return (
        <>
            <img
                src={chat.avatar ? chat.avatar : ''}
                className="chat-list-item__image"
            />
            <div className="chat-list-item__info">
                <div className="chat-list-item__nameDate">
                    <div className="chat-list-item__name">
                        <b>{chat.name}</b>
                    </div>
                    <div className="chat-list-item__date">
                        <span>{chat.getTime()?.toLocaleTimeString("ru")}</span>
                        <br />
                        <span>{chat.getTime()?.toLocaleDateString("ru")}</span>
                    </div>
                </div>
                {
                    chat.lastMessage &&
                    <div className="chat-list-item__messageInfo">
                        <div className="chat-list-item__lastMessage">
                            <span className="chat-list-item__lastMessage-author">{chat.lastMessage.getAuthorFullName()}</span>
                            <span>{ ': ' + chat.lastMessage.getDataText() }</span>
                        </div>
                        <div className="chat-list-item__messageCounter">
                            <div className="chat-list-item__messageCounter-round">

                            </div>
                        </div>
                    </div>
                }
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
                onClick={() => { clickHandler?.(chat) }}
                className="chat-list-item"
            >
                <ItemBody chat={chat} />
            </li>
        )
    }
    return (
        <li
            key={chat.id}
            onClick={() => { clickHandler?.(chat) }}
            className="chat-list-item"
        >
            <ItemBody chat={chat} />
        </li>
    )
})

const ChatsList = forwardRef(({ chats, itemClickHandler }: { chats: Chat[], itemClickHandler: (chat: Chat) => any }, ref: any) => {
    if (chats == null || chats.length === 0) {
        return (
            <>
                No chats!
            </>
        )
    }

    const listItems = chats.map((chat, index) =>
        <ChatListItem chat={chat} isLast={index === chats.length - 1} clickHandler={itemClickHandler} ref={ref} />
    )
    return (
        <ul className="chat-list">{listItems}</ul>
    )
})

export default ChatsList;