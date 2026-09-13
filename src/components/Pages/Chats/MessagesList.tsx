import { forwardRef, useCallback, useImperativeHandle, useEffect, useRef, useState } from "react";
import Message, { MessageDataType } from "../../../models/Message";
import FilePresentIcon from '@mui/icons-material/FilePresent';
import User from "../../../models/User";
import "./Chats.css";
import { Box, Button } from "@mui/material";
import MessengerService from "../../../services/MessengerService";
import { ID } from "../../../util/Types";

export interface IMessageListRef {
    messageList: any;
}

const NewMessagesDecorator = () => {
    return (
        <div className="chat-room__newMsgDecorator" data-content="New Messages" />
    )
}

const JoinChatLink = ({ chatId, link }: { chatId: ID, link: string }) => {
    const [chatName, setChatName] = useState('');

    useEffect(() => {
        const url = new URL(link);
        const newChatName = decodeURIComponent(url.searchParams.get('chatName') || '');
        setChatName(newChatName);
    }, [link]);
    const handleClick = async (event: any) => {
        event.stopPropagation();
        await MessengerService.joinChatByLink(chatId, link);
    };
    return (
        <Box 
            sx={{ 
                display: 'flex',
                width: '30%',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center', gap: 1,
                border: '2px solid #ffffff',
                backgroundColor: '#f0ebeb',
                borderRadius: '25px',
                padding: '10px'
            }}
        >
            <span>{chatName}</span>
            <Button
                variant="contained"
                size="small"
                onClick={handleClick}
            >
                Join chat
            </Button>
        </Box>

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
                        (message.data?.type === MessageDataType.JOIN_LINK) && message.data?.data &&
                        <JoinChatLink chatId={message.chatId} link={message.data?.data} />
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

const MessageListItem = forwardRef(( { message, user, index, observer, clickHandler }:
        {
            message: Message,
            user?: User | null,
            index?: number | null,
            observer?: IntersectionObserver | null
            clickHandler?: ((id: any) => void) | null,
        }, ref?: any) => {
    const messageId = message.id === null ? undefined : message.id;
    const itemRef = useRef<HTMLLIElement | null>(null);

    // Merge internal itemRef + forwarded ref
    const setRef = useCallback((node: HTMLLIElement | null) => {
        itemRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
    }, [ref]);

    // Observe only if this item has its own observer
    useEffect(() => {
        const el = itemRef.current;
        if (!el || !observer) return;
        observer.observe(el);
        return () => observer.unobserve(el);
    }, [observer]);

    return (
        <li
            id={messageId}
            data-item-index={index}
            onClick={clickHandler ? () => clickHandler(message.id) : undefined}
            className="message-list-item"
            tabIndex={-1}
            ref={setRef}
        >
            <MessageBody message={message} user={user} />
        </li>
    );
});

const MessageList = forwardRef(({ chatId, messages, user, lastReadMsgIdOnOpen, intersectionHandler, listRef, lastReadMsgRef }:
    {
        chatId: ID,
        messages?: Message[],
        user?: User | null,
        lastReadMsgIdOnOpen?: number | string | null, //lastReadMsgIdOnOpen on backend, before opening ChatRoom
        intersectionHandler: (params?: any) => void,
        listRef?: React.RefObject<HTMLUListElement | null>,
        lastReadMsgRef: React.RefObject<string | null>
    }, ref?: any) => {

    const topMessageId = messages && messages.length ? messages[messages.length - 1].id : null;
    let lastMsgReadIndex = messages?.findIndex(m => m.id === lastReadMsgRef.current) ?? -1;
    if ( messages?.length && lastMsgReadIndex === -1 && lastReadMsgIdOnOpen == null) {
        // User hasn't visited chat yet and there are brand new messages for him - mark'em all as unread
        lastMsgReadIndex = messages.length;
    }

    const [firstUnreadMsgId, setFirstUnreadMsgId] = useState<ID>(null);
    const firstUnreadSetForChatRef = useRef<ID | null>(null);
    useEffect(() => {
        if (!messages || messages.length === 0) return;

        // New chat → reset and re-evaluate from scratch.
        if (firstUnreadSetForChatRef.current !== chatId) {
            firstUnreadSetForChatRef.current = chatId;

            if (lastReadMsgIdOnOpen == null) {
                setFirstUnreadMsgId(messages[messages.length - 1].id);
                return;
            }
            const onOpenIndex = messages.findIndex(m => m.id === lastReadMsgIdOnOpen);
            if (onOpenIndex === -1) {
                return;
            }
            // Case 1: there's a recorded last-read message and it's not the newest.
            if (lastReadMsgIdOnOpen && onOpenIndex !== 0) {
                setFirstUnreadMsgId(messages[onOpenIndex - 1].id);
                return;
            }
        }

        // Same chat, decorator not yet set → check the "new message while scrolled away" case.
        // React runs effects after commiting the DOM, so the scroll position should be right
        if (firstUnreadMsgId == null) {
            const atNewest = listRef?.current == null || listRef.current.scrollTop === 0;
            if (!atNewest) {
                // The newest message is the first unread.
                setFirstUnreadMsgId(messages[0].id);
            }
        }
    }, [chatId, messages, lastReadMsgIdOnOpen, lastMsgReadIndex, listRef, firstUnreadMsgId]);

    const listId = "chat-room-msg-list";
    /**
     * Observes unread messages
     */
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [observerReady, setObserverReady] = useState(false);

    const hasFocusedRef = useRef(false);
    useEffect(() => {
        if (hasFocusedRef.current) return;
        const refId = lastReadMsgIdOnOpen ?? topMessageId;
        if (!refId) return;
        document.getElementById(String(refId))?.focus();
        hasFocusedRef.current = true;
    }, [lastReadMsgIdOnOpen, topMessageId, chatId]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const target = entry.target;
                const id = target.getAttribute('id');
                if (!id) return;
                observer.unobserve(target);
                const position = target.getAttribute('data-item-index');
                intersectionHandler({ id, position: position ? +position : null });
            });
        }, { root: listRef?.current, threshold: 0.9 });

        observerRef.current = observer;
        setObserverReady(true);

        return () => {
            observer.disconnect();
            observerRef.current = null;
            setObserverReady(false);
        };
    }, [listRef, intersectionHandler]);

    const sentinelNodeRef = useRef<HTMLLIElement | null>(null);
    // Expose the sentinel to the parent via the forwarded ref
    useImperativeHandle(ref, () => ({
        getSentinelNode: () => sentinelNodeRef.current,
    }), []);

    let listItems: any[] = [];
    let newMsgDecoratorInserted = false;
    // First message'll be in the bottom of display
    messages?.forEach((message, index) => {
        const isSentinel = index === messages.length - 1; // oldest message
        listItems.push(
            <MessageListItem
                key={message.id ?? `local-${index}`}
                message={message}
                user={user}
                index={index}
                observer={observerReady && index < lastMsgReadIndex ? observerRef.current : null}
                // Attach the sentinel ref only to the oldest message
                ref={isSentinel ? sentinelNodeRef : undefined}
            />
        );
        if (!newMsgDecoratorInserted && firstUnreadMsgId === message.id) {
            if (!(lastReadMsgIdOnOpen == null && firstUnreadMsgId === topMessageId)) {
                // We don't insert decorator if it's very first visit of che chat
                listItems.push(
                    <NewMessagesDecorator key="new-msg-decorator"/>
                );
                newMsgDecoratorInserted = true;
            }
        }
    });

    return (
        <ul
            className="chat-room-message-list"
            id={listId}
            ref={listRef}
        >
            {listItems.length === 0 && (
                <div className="chat-room-message-list-empty">No messages!</div>
            )}
            {listItems}
        </ul>
    );
});

export default MessageList;