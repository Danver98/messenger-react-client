import { forwardRef, useCallback, useEffect, useRef } from "react";
import Message, { MessageDataType } from "../../../models/Message";
import FilePresentIcon from '@mui/icons-material/FilePresent';
import User from "../../../models/User";
import "./Chats.css";

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

function useEnableIntersectionObserver(
    rootElement: any,
    ref: any,
    handleIntersection: (params?: any) => void) {
    const callback = useCallback(handleIntersection, [handleIntersection]);
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                const position = entries[0].target.getAttribute('data-item-index');
                const params = {
                    id: entries[0].target.getAttribute('id'),
                    position: position? +position : null,
                }
                callback(params);
            }
        },
            {
                root: rootElement,
                threshold: 0.95
            }
        );
        if (ref.current) observer.observe(ref.current);
        return () => {
            observer.disconnect();
        };
    }, [rootElement, ref, callback]);
}

const MessageListItem = forwardRef((
    { message, user, index, isLast, listRoot,
        clickHandler, intersectionHandler }:
        {
            message: Message,
            user?: User | null,
            index?: number | null,
            isLast?: boolean,
            listRoot: HTMLElement | null,
            clickHandler?: ((id: any) => void) | null,
            intersectionHandler: (message: Message, params?: any) => void
        }, ref?: any) => {
    const messageId = message.id === null ? undefined : message.id;
    const itemRef = useRef(null);
    useEnableIntersectionObserver(
        listRoot,
        itemRef,
        (params?: any) => { intersectionHandler(message, params) }
    );
    if (isLast) {
        // TODO: fix problem with double ref: for 'read' flag and data fetching
        return (
            <li
                id={messageId}
                key={message.id}
                data-item-index={index}
                // ref={ref} // lastItemRef
                onClick={() => { clickHandler?.(message.id) }}
                className="message-list-item"
                tabIndex={-1}
                ref={ref}
            >
                <MessageBody message={message} user={user} />
            </li>
        )
    }
    return (
        <li
            id={messageId}
            key={message.id}
            data-item-index={index}
            onClick={() => { clickHandler?.(message.id) }}
            className="message-list-item"
            tabIndex={-1}
            ref={itemRef}
        >
            <MessageBody message={message} user={user} />
        </li>
    )
});

const MessageList = forwardRef(({ messages, user, lastReadMsgId, intersectionHandler }:
    {
        messages?: Message[],
        user?: User | null,
        lastReadMsgId?: number | string | null,
        intersectionHandler: (message: Message) => void
    }, ref?: any) => {
    const firstMsgId = messages && messages.length ? messages[messages?.length - 1].id : null;
    const listRef = useRef(null);

    // const handleScroll = () => {
    //     if (listRef.current) {
    //         const { scrollTop, scrollLeft } = listRef.current;
    //         const a = 1;
    //     }
    // }

    useEffect(() => {
        const refId = lastReadMsgId ? lastReadMsgId : firstMsgId;
        if (!refId) return;
        document.getElementById(String(refId))?.focus();
    }, [lastReadMsgId, firstMsgId]);

    if (messages == null || messages.length === 0) {
        return (
            <div className="chat-room-message-list-empty">
                No messages!
            </div>
        )
    }
    const listId = "chat-room-msg-list";
    const listRoot = document.getElementById(listId);
    // Subscribe to scroll event isnide message list

    let listItems: any[] = [];
    let newMsgDecoratorInserted = false
    // First message'll be in the bottom of display
    messages?.forEach((message, index) => {
        if (!newMsgDecoratorInserted && message.id === lastReadMsgId && index !== 0) {
            listItems.push([
                <NewMessagesDecorator />
            ]);
            newMsgDecoratorInserted = true;
        }
        listItems.push([
            <MessageListItem
                message={message}
                user={user}
                index={index}
                isLast={index === messages.length - 1}
                listRoot={listRoot}
                intersectionHandler={intersectionHandler}
                ref={ref}
            />
        ]);
    });
    if (!lastReadMsgId && messages.length) {
        listItems.push([
            <NewMessagesDecorator />
        ]);
    }

    return (
            <ul
                className="chat-room-message-list"
                id={listId}
                ref={listRef}
                //onScroll={handleScroll}
            >
                {listItems}
            </ul>
    )
});

export default MessageList;