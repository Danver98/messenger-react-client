import { forwardRef, } from "react";
import Message, { MessageDataType } from "../../../models/Message";
import User from "../../../models/User";
import "./Chats.css";


const MessageBody = ({ message, user }: { message: Message, user?: User | null}) => {
    // Currently assuming we only have text messages;
    const alignment = message.author?.id === user?.id ? 'right' : 'left';
    return (
        <div className={`message-list-item_container align-items-${alignment}`}>
            <div className="message-list-item__userBlock">
                {
                    (message.author?.id !== user?.id) &&
                    <img
                        src={message.author?.avatar}
                        className="message-list-item__userImage" />
                }
            </div>
            <div className="message-list-item__messageBlock">
                <div className="message-list-item__UserName">
                    {message.author?.name + ' ' + message.author?.surname}
                </div>
                <p className="message-list-item__messageData">
                    {message.data?.data}
                </p>
                <div className="message-list-item__messageBlock-date">
                    <div>{message.time?.toLocaleDateString("ru") + ' | ' + message.time?.toLocaleTimeString("ru")}</div>
                </div>
            </div>
        </div>
    )
};

const MessageListItem = forwardRef(({ message, user, isLast, clickHandler }:
    { message: Message, user?: User | null, isLast?: boolean, clickHandler?: (id: any) => void }, ref?: any) => {
    if (isLast) {
        return (
            <li
                key={message.id}
                ref={ref}
                onClick={() => { clickHandler?.(message.id) }}
                className="message-list-item"
            >
                <MessageBody message={message} user={user} />
            </li>
        )
    }
    return (
        <li
            key={message.id}
            onClick={() => { clickHandler?.(message.id) }}
            className="message-list-item"
        >
            <MessageBody message={message} user={user} />
        </li>
    )
});

const MessageList = forwardRef(({ messages, user }: { messages?: Message[], user?: User | null }, ref?: any) => {
    if (messages == null || messages.length === 0) {
        return (
            <div className="chat-room-message-list-empty">
                No messages!
            </div>
        )
    }
    const listItems = messages?.map((message, index) =>
        <MessageListItem message={message} user={user} isLast={index === messages.length - 1} ref={ref} />)

    return (
        <ul className="chat-room-message-list">{listItems}</ul>
    )
});

export default MessageList;