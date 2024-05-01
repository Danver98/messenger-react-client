import { createRef, forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Message, { MessageDataType } from "../../../models/Message";
import FilePresentIcon from '@mui/icons-material/FilePresent';
import User from "../../../models/User";
import "./Chats.css";

const NewMessagesDecorator = () => {
    return (
        <div className="chat-room__newMsgDecorator" data-content="New Messages"/>
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
                    {message.author?.name + ' ' + message.author?.surname}
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

function useIntersecting(rootElement: any, ref: any, message: Message, handleIntersection: (obj: any) => void) {
    const callback = useCallback(handleIntersection, [handleIntersection]);
    
    useEffect(() => {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            //const id = entries[0].target.getAttribute('id');
            callback(message);
        }
      },
        {   
            root: rootElement,
            threshold: 0.8
        }
      );
      if (ref.current) observer.observe(ref.current);
      return () => {
        observer.disconnect();
      };
    }, [rootElement, ref, message, callback]);
  }

const MessageListItem = forwardRef(({ message, user, lastReadMsgId, isFirst, isLast, rootElement, clickHandler, intersectionHandler }:
    { 
        message: Message,
        user?: User | null,
        lastReadMsgId?: number | string | null,
        // isFirst - item in the bottom of the list (if look at the screen)
        isFirst?: boolean,
        isLast?: boolean,
        scrollRef?: any,
        rootElement: any,
        clickHandler?: ((id: any) => void) | null,
        intersectionHandler: ((message: Message) => void)
    }, ref?: any) => {
        const messageId = message.id === null ? undefined : message.id;
        const itemRef = useRef(null);
        useIntersecting(rootElement, itemRef, message, intersectionHandler);
        if (isLast) {
            // TODO: fix problem with double ref: for 'read' flag and data fetching
            return (
                <li
                    id={messageId}
                    key={message.id}
                    // ref={ref} // lastItemRef
                    onClick={() => { clickHandler?.(message.id) }}
                    className="message-list-item"
                    ref={ref}
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
                id={messageId}
                key={message.id}
                onClick={() => { clickHandler?.(message.id) }}
                className="message-list-item"
                ref={itemRef}
            >
                {
                    lastReadMsgId == null &&
                    <NewMessagesDecorator />
                }
                <MessageBody message={message} user={user} />
                {
                        message.id === lastReadMsgId && !isFirst &&
                        <NewMessagesDecorator />
                }
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
        const scrollRefs : { [id: string] : any; } = {}
        messages?.forEach((message: Message) => {
            scrollRefs[message.id!] = createRef();
        });

        useEffect(() => {
            //if (!loading) return;
            const refId = lastReadMsgId ? lastReadMsgId : firstMsgId;
            if (!refId) return;
            document.getElementById(String(refId))?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
            //setLoading(false);
            // scrollRefs[refId]?.current?.scrollIntoView({
            //     behavior: 'smooth',
            //     block: 'start',
            // });
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
        const listItems = messages?.map((message, index) => {
            return <MessageListItem
                message={message}
                user={user}
                lastReadMsgId={lastReadMsgId || firstMsgId}
                isFirst={index === 0}
                isLast={index === messages.length - 1}
                scrollRef={scrollRefs[message.id!]}
                rootElement={listRoot}
                ref={ref}
                intersectionHandler={intersectionHandler}
            />
        })

        return (
            <ul
                id={listId}
                className="chat-room-message-list"
            >
                {listItems}
            </ul>
        )
});

export default MessageList;