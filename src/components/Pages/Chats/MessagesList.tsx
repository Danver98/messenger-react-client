import { forwardRef, } from "react";
import Message, { MessageDataType } from "../../../models/Message";
import FilePresentIcon from '@mui/icons-material/FilePresent';
import User from "../../../models/User";
import "./Chats.css";

const NewMessagesDecorator = () => {
    return (
        <div className='message-list-item_container'>
            <hr>
                New Messages
            </hr>
        </div>
    )
}

const MessageBody = ({ message, user }: { message: Message, user?: User | null }) => {
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
                    {
                        (message.data?.type === MessageDataType.TEXT ||
                            message.data?.type === MessageDataType.DEFAULT) && message.data?.data
                    }
                    {
                        message.data?.type == MessageDataType.IMAGE && message.data?.data &&
                        <img
                            src={message.data?.data}
                            className="message-list-item_image"
                        />
                    }
                    {
                        message.data?.type == MessageDataType.AUDIO && message.data?.data &&
                        <audio
                            src={message.data?.data}
                            preload="metadata"
                            controls
                            className="message-list-item_audio"
                        />
                    }
                    {
                        message.data?.type == MessageDataType.VIDEO && message.data?.data &&
                        <video
                            src={message.data?.data}
                            preload="metadata"
                            controls
                            className="message-list-item_video"
                        />
                    }
                    {
                        message.data?.type == MessageDataType.FILE && message.data?.data &&
                        <div
                            className="message-list-item_file"
                        >
                            <a
                                href={message.data?.data}
                                download
                            >
                                <FilePresentIcon
                                    fontSize="large"
                                    color="primary"
                                />
                            </a>
                            <span>{ (message.data?.data as string)
                            .substring((message.data?.data as string).lastIndexOf('/') + 1)}</span>
                        </div>
                    }
                </p>
                <div className="message-list-item__messageBlock-date">
                    <div>{message.time?.toLocaleDateString("ru") + ' | ' + message.time?.toLocaleTimeString("ru")}</div>
                </div>
            </div>
        </div>
    )
};

const MessageListItem = forwardRef(({ message, user, lastReadMsgId, isLast, clickHandler }:
    { message: Message, user?: User | null, lastReadMsgId?: number | string | null, isLast?: boolean, clickHandler?: (id: any) => void }, ref?: any) => {
    if (isLast) {
        return (
            <li
                key={message.id}
                ref={ref}
                onClick={() => { clickHandler?.(message.id) }}
                className="message-list-item"
            >
                {
                    lastReadMsgId == null &&
                    <NewMessagesDecorator />
                }
                <MessageBody message={message} user={user} />
                {
                    message.id === lastReadMsgId &&
                    <NewMessagesDecorator />
                }
            </li>
        )
    }
    return (
        <li
            key={message.id}
            onClick={() => { clickHandler?.(message.id) }}
            className="message-list-item"
        >
            {
                lastReadMsgId == null &&
                <NewMessagesDecorator />
            }
            <MessageBody message={message} user={user} />
            {
                    message.id === lastReadMsgId &&
                    <NewMessagesDecorator />
            }
        </li>
    )
});

const MessageList = forwardRef(({ messages, user, lastReadMsgId }: 
    { messages?: Message[], user?: User | null, lastReadMsgId?: number | string | null }, ref?: any) => {
    if (messages == null || messages.length === 0) {
        return (
            <div className="chat-room-message-list-empty">
                No messages!
            </div>
        )
    }
    const listItems = messages?.map((message, index) =>
        <MessageListItem 
            message={message}
            user={user}
            lastReadMsgId={lastReadMsgId}
            isLast={index === messages.length - 1}
            ref={ref}
        />)

    return (
        <ul className="chat-room-message-list">{listItems}</ul>
    )
});

export default MessageList;