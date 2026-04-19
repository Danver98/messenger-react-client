import { forwardRef, useEffect, useRef } from "react";
import Message, { MessageDataType } from "../../../models/Message";
import FilePresentIcon from '@mui/icons-material/FilePresent';
import User from "../../../models/User";
import "./Chats.css";

export interface IMessageListRef {
    messageList: any;
}

const NewMessagesDecorator = () => {
    return (
        <div className="chat-room__newMsgDecorator" data-content="New Messages" />
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
                        alt=''
                        className="message-list-item__userImage" />
                }
            </div>
            <div className="message-list-item__messageBlock">
                <div className="message-list-item__UserName">
                    {/* {message.author?.name + ' ' + message.author?.surname} */}
                    {message.id}
                </div>
                <p className="message-list-item__messageData">
                    {
                        (message.data?.type === MessageDataType.TEXT ||
                            message.data?.type === MessageDataType.DEFAULT) && message.data?.data
                    }
                    {
                        message.data?.type === MessageDataType.IMAGE && message.data?.data &&
                        <img
                            src={message.data?.data}
                            alt=''
                            className="message-list-item_image"
                        />
                    }
                    {
                        message.data?.type === MessageDataType.AUDIO && message.data?.data &&
                        <audio
                            src={message.data?.data}
                            preload="metadata"
                            controls
                            className="message-list-item_audio"
                        />
                    }
                    {
                        message.data?.type === MessageDataType.VIDEO && message.data?.data &&
                        <video
                            src={message.data?.data}
                            preload="metadata"
                            controls
                            className="message-list-item_video"
                        />
                    }
                    {
                        message.data?.type === MessageDataType.FILE && message.data?.data &&
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
                            <span>{(message.data?.data as string)
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

const MessageListItem = forwardRef((
    { message, user, index, isLast, observer,
        clickHandler }:
        {
            message: Message,
            user?: User | null,
            index?: number | null,
            isLast?: boolean,
            observer?: IntersectionObserver | null
            clickHandler?: ((id: any) => void) | null,
        }, ref?: any) => {
    const messageId = message.id === null ? undefined : message.id;
    const itemRef = useRef(null);
    useEffect(() => {
        if (itemRef.current && observer) {
            observer.observe(itemRef.current);
        }
    }, [observer, itemRef])

    // TODO: fix problem with double ref: for 'read' flag and data fetching
    return (
        <li
            id={messageId}
            key={message.id}
            data-item-index={index}
            onClick={() => { clickHandler?.(message.id) }}
            className="message-list-item"
            tabIndex={-1}
            ref={isLast ? ref : itemRef} // lastItemRef or itemRef
        >
            <MessageBody message={message} user={user} />
        </li>
    )
});

const MessageList = forwardRef(({ messages, user, lastReadMsgIdOnOpen, intersectionHandler, listRef, lastReadMsgRef }:
    {
        messages?: Message[],
        user?: User | null,
        lastReadMsgIdOnOpen?: number | string | null, //lastReadMsgIdOnOpen on backend, before opening ChatRoom
        intersectionHandler: (params?: any) => void,
        listRef?: React.RefObject<HTMLUListElement | null>,
        lastReadMsgRef: React.RefObject<string | null>
    }, ref?: any) => {
    const firstMsgId = messages && messages.length ? messages[messages?.length - 1].id : null;
    const listId = "chat-room-msg-list";
    /**
     * Observes unread messages
     */
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const refId = lastReadMsgIdOnOpen ? lastReadMsgIdOnOpen : firstMsgId;
        if (!refId) return;
        document.getElementById(String(refId))?.focus();
    }, [lastReadMsgIdOnOpen, firstMsgId]);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry: IntersectionObserverEntry) => {
                if (entry.isIntersecting) {
                    const position = entries[0].target.getAttribute('data-item-index');
                    const params = {
                        id: entries[0].target.getAttribute('id'),
                        position: position ? +position : null,
                    };
                    observerRef.current?.unobserve(entry.target);
                    intersectionHandler(params);
                }
            })
        },
            {
                root: listRef?.current,
                threshold: 0.9
            }
        );
        return () => {
            observerRef.current?.disconnect();
        }
    }, [listRef, intersectionHandler]);

    if (messages == null || messages.length === 0) {
        return (
            <div className="chat-room-message-list-empty">
                No messages!
            </div>
        )
    }

    let listItems: any[] = [];
    let newMsgDecoratorInserted = false
    const lastMsgReadIndex = messages.findIndex(msg => msg.id === lastReadMsgRef.current);
    // First message'll be in the bottom of display
    messages?.forEach((message, index) => {
        // if (index + 1 === lastMsgReadIndex && !newMsgDecoratorInserted) {
        //     listItems.push([
        //         <NewMessagesDecorator />
        //     ]);
        //     newMsgDecoratorInserted = true;
        // }
        if (!newMsgDecoratorInserted &&
            (message.id === lastReadMsgIdOnOpen)
            && index !== 0) {
            // Additionally check whether message list scroll position is at the end - 
            // in that case user sees new message and we don't need to notify him more
            if (listRef?.current && listRef?.current?.scrollTop !== 0) {
                listItems.push([
                    <NewMessagesDecorator />
                ]);
                newMsgDecoratorInserted = true;
            }
        }
        listItems.push([
            <MessageListItem
                message={message}
                user={user}
                index={index}
                isLast={index === messages.length - 1}
                observer={index < lastMsgReadIndex ? observerRef.current : null}
                ref={ref}
            />
        ]);
    });
    if (!lastReadMsgIdOnOpen && messages.length) {
        listItems.push([
            <NewMessagesDecorator />
        ]);
    }

    return (
        <ul
            className="chat-room-message-list"
            id={listId}
            ref={listRef}
        >
            {listItems}
        </ul>
    )
});

export default MessageList;