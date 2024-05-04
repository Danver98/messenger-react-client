import { useState, useEffect, useRef } from "react";
import MessageList from "./MessagesList";
import { CHATS_COMPONENT_MESSAGE_QUEUE, DIRECTION } from "../../../util/Constants";
import Chat from "../../../models/Chat";
import Message, { MessageData, MessageDataType, MessageType } from "../../../models/Message";
import User from "../../../models/User";
import UserSelectionDialog from "./UserSelectionDialog";
import { useAuthContextData } from "../../../middleware/AuthProvider";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Button, IconButton, TextareaAutosize } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import ClearIcon from '@mui/icons-material/Clear';
import { IPublishParams, StompHeaders } from '@stomp/stompjs';
import { useStompClient } from "react-stomp-hooks";
import { useBus, useListener } from 'react-bus';
import MessengerService from "../../../services/MessengerService";
import { getType } from "../../../util/FileUtils";
import { Headers } from "../../../util/Constants";
import CloseIcon from '@mui/icons-material/Close';

const Circle = ({value}: {value?: string | number | null}) => (
    <Button
        type="submit"
        variant="contained"
        color="secondary"
        sx={{
            position: "absolute",
            bottom: 80,
            right: 5,

            aspectRatio:"1/1",
            borderRadius: '50%',
        }}
    >
        {value}
    </Button>
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
    const fileUpload = useRef<any>();
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    
    const fileInputChanged = (event: any) => {
        setSelectedFiles((prev) => [...prev, event.target.value])
    }

    const clearFileList = (event: any) => {
        fileUpload.current.value = null;
        setSelectedFiles([]);
    }

    const onSubmit = async (event: any) => {
        await handleSubmit(event);
        clearFileList(event);
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
    const [lastElementRef, setLastElementRef] = useState(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const stompClient = useStompClient();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [intersected, setIntersected] = useState(false);
    const lastReadMsgRef = useRef<Message| null>(chat.lastReadMsg ? chat.lastReadMsg : null);
    const [unreadMsgCount, setUnreadMsgCount] = useState<number>(chat.unreadMsgCount || 0);

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

    const onMessageReceived = (dto: any) => {
        const data = dto.message;
        const message = new Message(data.id, data.chatId, data.receiverId, data.type, data.data, data.author, data.time);
        setMessages((prevMessages: Message[]) =>
            [message, ...prevMessages])
    };

    const handleMsgIntersection = (message: Message, params?: any) => {
        if (message.read) return;
        if (!message.id || message.id === lastReadMsgRef.current?.id) return;
        if (!lastReadMsgRef.current) {
            lastReadMsgRef.current = message;
            setUnreadMsgCount(params.position - 1);
        }
        if (lastReadMsgRef.current?.time && message.time &&
            (lastReadMsgRef.current.time < message.time ||
                (lastReadMsgRef.current.time === message.time &&
                lastReadMsgRef.current?.id &&
                lastReadMsgRef.current.id < message.id)) 
        ) {
            lastReadMsgRef.current = message;
            setUnreadMsgCount(params.position - 1);
        }
    }

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
            type = MessageType.CREATION;
            destination = '/app/chats/create-invite';
            setDraft(false);
        }

        const message = new Message(
            null,
            chat.id,
            receiverId,
            type,
            messageData,
            author,
            // TODO: try to get private msgs sent from current user from server too
            chat.private ? new Date() : null);

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
    }, [pagingParams]);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIntersected((prev) => !prev);
                }
            }
        );
        return () => {
            // Shoud be run when user closes current chat or switches to another one
            if (chat.id && lastReadMsgRef && authContext.user?.id) {
                if ( chat.lastReadMsg?.id === lastReadMsgRef.current?.id || !lastReadMsgRef.current) {
                    return;
                }
                MessengerService.updateLastReadMsg(chat.id, authContext.user.id, lastReadMsgRef.current.id!);
            }
        }
    }, []); // Runs on start only

    useEffect(() => {
        const observerCurrent = observerRef.current;

        if (lastElementRef) {
            observerCurrent?.observe(lastElementRef);
        }

        return () => {
            if (lastElementRef) {
                observerCurrent?.disconnect();
            }
        };
    }, [lastElementRef]);


    useEffect(() => {
        setHasMore(true);
        setPagingParams({ chatId: chat.id, userId: authContext.user?.id });
    }, [chat.id]);

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

    return (
        <div className="chat-room-page">
            <div className="chat-room-page__CentralBlock">
                <div className="chat-room-page-header">
                    <div className="chat-room-page-header__ChatName">{chat.name}</div>
                    <UserSelectionDialog chat={chat} />
                </div>
                <MessageList
                    messages={messages}
                    lastReadMsgId={chat.lastReadMsg?.id}
                    intersectionHandler={handleMsgIntersection}
                    user={authContext.user}
                    ref={setLastElementRef}
                />
                {
                    isLoading && <CircularProgress />
                }
                {
                    unreadMsgCount > 0 &&
                    <Circle value={unreadMsgCount}/>
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