import { useCallback, useState, useEffect, useEffectEvent, useRef } from "react";
import MessageList from "./MessagesList";
import { CHATS_COMPONENT_MSG_UNREAD_COUNT_QUEUE, DIRECTION,
    CHATS_COMPONENT_MESSAGE_QUEUE } from "../../../util/Constants";
import Chat from "../../../models/Chat";
import Message, { MessageData, MessageDataType, MessageType } from "../../../models/Message";
import User from "../../../models/User";
import { useAuthContextData } from "../../../middleware/AuthProvider";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Box, Button, IconButton, TextareaAutosize } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import ClearIcon from '@mui/icons-material/Clear';
import { IPublishParams, StompHeaders } from '@stomp/stompjs';
import { useStompClient } from "react-stomp-hooks";
import { useBus, useListener } from 'react-bus';
import MessengerService from "../../../services/MessengerService";
import { getType } from "../../../util/FileUtils";
import { Headers } from "../../../util/Constants";
import CloseIcon from '@mui/icons-material/Close';
import ChatRoomMenu from "./ChatRoomMenu";
import { ID } from "../../../util/Types";
import ChatRoomEdit from "./ChatRoomEdit";

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export interface MessageListHandle {
    getSentinelNode: () => HTMLLIElement | null;
}

const Circle = ({value, clickHandler }: {value?: string | number | null, clickHandler: () => void}) => (
    <Box
        className='chat-room-page__unreadMsgCounter_Box'
        sx={{
            position: "absolute",
            bottom: 80,
            right: 5
        }}
    >
        <Button
            type="submit"
            variant="contained"
            color="secondary"
            sx={{
                aspectRatio:"1/1",
                borderRadius: '50%',
            }}
        >
            {value}
        </Button>
        <IconButton
            className='chat-room-page__unreadMsgCounter_arrowDown'
            onClick={clickHandler}
        >
            <KeyboardArrowDownIcon
                fontSize="small"
                sx={{
                    boxShadow: 'none', filter: 'none'
                }}
                />
        </IconButton>
    </Box>
);

export interface PagingParams {
    chatId?: number | string | null;
    userId?: number | string | null;
    time?: Date | null;
    messageId?: number | string | null;
    direction?: number | null;
    count?: number | null;
    include?: boolean | null;
}


function MessageSender({ handleSubmit }: { handleSubmit: (event: any) => any }) {
    const fileUpload = useRef<any>(null);
    const textArea = useRef<HTMLTextAreaElement | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    
    const fileInputChanged = (event: any) => {
        setSelectedFiles((prev) => [...prev, event.target.value])
    }

    const clearFileList = (event: any) => {
        fileUpload.current.value = null;
        setSelectedFiles([]);
    }

    const clearInput = (event: any) => {
        if (textArea.current) {
            textArea.current.value = '';
        }
    }

    const onSubmit = async (event: any) => {
        await handleSubmit(event);
        clearFileList(event);
        clearInput(event);
    }

    return (
        <div className="chat-room-message-sender">
            <form
                method="POST"
                onSubmit={onSubmit}
                className="chat-room-message-sender__FormContainer"
            >
                <div className="chat-room-message-sender__Form">
                    <IconButton
                        color="primary"
                        onClick={() => { fileUpload.current.click() }}
                    >
                        <AttachFileIcon />
                    </IconButton>
                    <input
                        name="fileData"
                        type="file"
                        hidden
                        ref={fileUpload}
                        onChange={(event) => { fileInputChanged(event) }}
                    />
                    <div className="chat-room-message-sender__TextArea-container">
                        <TextareaAutosize
                            aria-label="minimum height"
                            name="messageData"
                            minRows={4}
                            maxRows={4}
                            placeholder="Enter your message"
                            className="chat-room-message-sender__TextArea"
                            ref={textArea}
                        />
                        {
                            selectedFiles && selectedFiles.length > 0 &&
                            <div>
                                {
                                    selectedFiles.join(', ')
                                }
                                <IconButton
                                    onClick={clearFileList}
                                >
                                    <ClearIcon />
                                </IconButton>

                            </div>
                        }
                    </div>
                    <Button
                        variant="contained"
                        type="submit"
                        size="medium"
                        className=""
                    >
                        Send
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default function ChatRoom({ chat, closeChat }: { chat: Chat, closeChat?: () => void }) {
    const authContext = useAuthContextData();
    const bus = useBus();
    const [pagingParams, setPagingParams] = useState<PagingParams>(
        {
            chatId: chat.id,
            userId: authContext.user?.id,
            direction: DIRECTION.PAST,
            count: 50,
        });
    const [draft, setDraft] = useState<boolean | null | undefined>(chat.draft);
    const messageListHandleRef = useRef<MessageListHandle | null>(null);
    const stompClient = useStompClient();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [intersected, setIntersected] = useState<number>(0);
    const lastReadMsgRef = useRef<string| null>(chat.lastReadMsg ? chat.lastReadMsg.id : null);
    const messageListRef = useRef<HTMLUListElement>(null);
    const [unreadMsgCount, setUnreadMsgCount] = useState<number>(chat.unreadMsgCount || 0);

    const [editMenuOpen, setEditMenuOpen] = useState(false);

    const fetchMessages = async (params: PagingParams) => {
        const dto = {
            'chatId': params.chatId,
            'userId': params.userId,
            'time': params.time,
            'messageId': params.messageId,
            'direction': params.direction || DIRECTION.PAST,
            'count': params.count || 50
        };
        return await MessengerService.getMessages(dto);
    }

    /**
     * Setting permissions for authenticated user for given chat.
     */
    useEffect(() => {
        const fetchPermissions = async (chatId: ID) => {
            setPermissions([]);
            const permissions = await MessengerService.getChatPermissions(chatId);
            setPermissions(permissions);
        }
        fetchPermissions(chat.id);
    }, [chat.id]);

    const onMessageReceived = useCallback((dto: any) => {
        const data = dto.message;
        const isLastMessageVisible = messageListRef.current?.scrollTop === 0;
        const message = new Message(data.id, data.chatId, data.receiverId, data.type, data.data, data.author, data.time, isLastMessageVisible);
        setMessages((prevMessages: Message[]) =>
            [message, ...prevMessages])
        if (isLastMessageVisible) {
            // Newly added message is fully visible to user, so mark it as last read
            lastReadMsgRef.current = message.id;
        } else {
            // If user is not viewing the last message, increment unreadMsgCount
            setUnreadMsgCount(count => count + 1);
        }
    }, []);

    /**
     * Handles intersection of the next unread message
     * It updates the unreadMsgCount and current lastReadMsg id.
     * It's supposed handler is only fired on unread messages not to move pointer
     * to earlier read messages
     */
    const handleMsgIntersection = useEffectEvent((params?: any) => {
        const lastReadMsgIndex = messages.findIndex(m => m.id === lastReadMsgRef.current);
        const msgIndex = params.position ?? messages.findIndex(m => m.id === params.id);
        if (msgIndex === -1) return;
        if (lastReadMsgIndex === -1) {
            // User has opened chat for the first time and there are brand new messages or
            // current message portion doesn't include any unread messages
            lastReadMsgRef.current = params.id;
            const decrement = messages.length - msgIndex;
            setUnreadMsgCount((prevCount) => prevCount === 0 ? prevCount : Math.max(0, prevCount - decrement));
            setMessages((prevMessages) => prevMessages.map((message) => message.id === params.id ?
                    new Message(message.id, message.chatId, message.receiverId, message.type, message.data,
                        message.author, message.time, true)
                    : message));
            return;
        }
        // If message has already been read, do nothing
        if (msgIndex >= lastReadMsgIndex) return;
        lastReadMsgRef.current = params.id;
        setUnreadMsgCount((prevCount) => prevCount === 0 ? prevCount : prevCount - 1);
        setMessages((prevMessages) => prevMessages.map((message) => message.id === params.id ?
                new Message(message.id, message.chatId, message.receiverId, message.type, message.data,
                    message.author, message.time, true) 
                : message));
    });

    const sendMessage = async (event: any) => {
        const user = authContext.user as User;
        const formData = new FormData(event.currentTarget);
        event.preventDefault();
        const file = formData.get('fileData')
        let messageData = {
            type: MessageDataType.TEXT,
            data: formData.get('messageData')
        };

        if (file instanceof File && file.name) {
            setIsLoading(true);
            const url = await MessengerService.sendAttachment(file as File, chat.id, user.id);
            setIsLoading(false);
            if (url == null) {
                return alert(`Failed to upload "${file.name}" resource to the server`);
            }
            let _type = getType(file);
            messageData = {
                type: _type,
                data: url
            }
            _sendMessage(messageData);
        } else {
            _sendMessage(messageData);
        }
    }

    const _sendMessage = async (messageData: MessageData) => {
        const user = authContext.user as User;
        let type = MessageType.CHAT;
        const author: User = {
            id: user.id,
            name: user.name,
            surname: user.surname,
            avatar: user.avatar
        };
        const receiverId = chat.private && chat.participants ?
            chat.participants[0] === user.id ?
                chat.participants[1]
                : chat.participants[0]
            : null;
        let destination = chat.private ? '/app/chats/private/send-message' : '/app/chats/public/send-message';

        if (draft && chat.private) {
            setDraft(false);
        }

        const message = new Message(
            null,
            chat.id,
            receiverId,
            type,
            messageData,
            author,
        );

        const params: IPublishParams = {
            destination: destination,
            body: JSON.stringify({
                message: message,
                chat: chat
            }),
            headers: {
                [Headers.X_REQUEST_RESOURCE_OBJECT]: chat.id
            } as StompHeaders
        }
        stompClient?.publish(params);
        if (chat.private) {
            // TODO: in private chats we don't get back our messages, so we've to insert it manually
            setMessages((prevMessages: Message[]) =>
                [message, ...prevMessages]);
            // send message to chats component queue
            bus.emit(CHATS_COMPONENT_MESSAGE_QUEUE, {
                message: message,
                chat: chat
            });
        }
    }

    // Subscribe to new messages coming to chat
    useListener(`/chats/${chat.id}/messages`, onMessageReceived);

    /**
     * Starts fetching new chunk of messages on pagingParams change
     */
    useEffect(() => {
        if (!hasMore) return;
        const f = async () => {
            const newMessages = await fetchMessages(pagingParams);
            if (pagingParams.include) {
                setMessages((prevMessages) => [...prevMessages, ...newMessages]);
            } else {
                setMessages((prevMessages) => [...newMessages]);
            }
            setHasMore(newMessages && newMessages.length > 0);
        };
        f();
    }, [pagingParams, hasMore]);

    const pagingObserverRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        pagingObserverRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setIntersected((n) => n + 1); // counter instead of toggle
                }
            });
        });
        return () => {
            pagingObserverRef.current?.disconnect();
            pagingObserverRef.current = null;
        };
    }, []);

    useEffect(() => {
        const observer = pagingObserverRef.current;
        const node = messageListHandleRef.current?.getSentinelNode() ?? null;
        if (!observer || !node) return;

        observer.observe(node);
        return () => {
            observer.unobserve(node);
        };
    }, [messages, chat.id]);


    useEffect(() => {
        bus.emit(CHATS_COMPONENT_MSG_UNREAD_COUNT_QUEUE, {
            chatId: chat.id,
            unreadMsgCount,
        });
    }, [bus, chat.id, unreadMsgCount]);

    useEffect(() => {
        return () => {
            if (chat.id && lastReadMsgRef && authContext.user?.id) {
                if (chat.lastReadMsg?.id === lastReadMsgRef.current || !lastReadMsgRef.current) {
                    return;
                }
                MessengerService.updateLastReadMsg(
                    chat.id,
                    authContext.user.id,
                    lastReadMsgRef.current!
                );
            }
        };
    }, [bus, chat.id, chat.lastReadMsg?.id, authContext?.user?.id]);

    useEffect(() => {
        setMessages([]);
        setHasMore(true);
        setUnreadMsgCount(chat.unreadMsgCount || 0);
        lastReadMsgRef.current = chat.lastReadMsg ? chat.lastReadMsg.id : null;
        setPagingParams({
            chatId: chat.id,
            userId: authContext.user?.id,
            direction: DIRECTION.PAST,
            count: 50,
        });
    }, [chat.id, authContext.user?.id]);

    /**
     * Fires when last message is intersected. Setting new paging params triggers messages fetching
     */
    useEffect(() => {
        if (!messages) return;
        const lastMsg = messages[messages.length - 1];
        if (!lastMsg) return;
        setPagingParams({
            chatId: chat.id,
            time: lastMsg.time,
            messageId: lastMsg.id,
            include: true
        })
    }, [intersected]);

    const scrollToLatestMessage = async () => {
        if (!chat.id || !messages || !messages.length || !authContext.user?.id ||
            !messageListRef.current || !lastReadMsgRef.current) return;
        
        const handleScrollFinished = () => {
            if (! chat.id || !messages || !messages.length || !authContext?.user?.id) return;
            setUnreadMsgCount(0);
            lastReadMsgRef.current = messages[0].id;
            MessengerService.updateLastReadMsg(
                chat.id,
                authContext.user.id,
                messages[0].id!
            );
            // Clean up the listener so it doesn't trigger on normal user scrolling later
            messageListRef.current?.removeEventListener('scrollend', handleScrollFinished);
        };

        messageListRef.current?.addEventListener('scrollend', handleScrollFinished);
        messageListRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    return (
        <div className="chat-room-page">
            <div className="chat-room-page-header">
                <div className="chat-room-page-header__ChatName" role="button"
                    tabIndex={0} onClick={() => {setEditMenuOpen(true)}}
                >
                    {chat.name}
                </div>
                {
                    <ChatRoomEdit isOpen={editMenuOpen} chatId={chat.id} user={authContext.user}
                        permissions={permissions}
                        onResult={() => {setEditMenuOpen(false)}}
                    />
                }
                {
                !!permissions.length &&
                <ChatRoomMenu chat={chat} user={authContext.user}
                    permissions={permissions} closeChat={closeChat}
                />
                }
            </div>
            <div className="chat-room-page__CentralBlock">
                <MessageList
                    chatId={chat.id}
                    messages={messages}
                    lastReadMsgIdOnOpen={chat.lastReadMsg?.id}
                    intersectionHandler={handleMsgIntersection}
                    user={authContext.user}
                    ref={messageListHandleRef}
                    listRef={messageListRef}
                    lastReadMsgRef={lastReadMsgRef}
                />
                {
                    isLoading && <CircularProgress />
                }
                {
                    unreadMsgCount > 0 &&
                    <Circle value={unreadMsgCount} clickHandler={scrollToLatestMessage}/>
                }
                <MessageSender handleSubmit={sendMessage} />
                <IconButton
                    onClick={() => { closeChat?.() }}
                    sx={{
                        position: "absolute",
                        left: "105%",
                        top: "10px",
                        
                    }}
                >
                    <CloseIcon
                        fontSize="large"
                        />
                </IconButton>
            </div>
        </div>
    )
}