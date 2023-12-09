import { useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import MessageList from "./MessagesList";
import { FetchMessages } from "./FetchData";
import { DIRECTION, ServiceUrl } from "../../../util/Constants";
import Chat from "../../../models/Chat";
import Message, { MessageData, MessageDataType, MessageType } from "../../../models/Message";
import User from "../../../models/User";
import UserSelectionDialog from "./UserSelectionDialog";
import { useAuthContextData } from "../../../middleware/AuthProvider";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Button, IconButton, TextareaAutosize } from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import { Client, IPublishParams } from '@stomp/stompjs';
import { useStompClient } from "react-stomp-hooks";
import { useBus, useListener } from 'react-bus';
import MessengerService from "../../../services/MessengerService";
import { useFilePicker } from "use-file-picker";

export interface PagingParams {
    chatId?: number | string | null;
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
    return (
        <div className="chat-room-message-sender">
            <form
                method="POST"
                onSubmit={handleSubmit}
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

export default function ChatRoom({ chat }: { chat: Chat }) {
    const authContext = useAuthContextData();
    const bus = useBus();
    const [pagingParams, setPagingParams] = useState<PagingParams>({ chatId: chat.id, direction: DIRECTION.PAST, count: 50 });
    const [draft, setDraft] = useState<boolean | null | undefined>(chat.draft);
    const [lastElementRef, setLastElementRef] = useState(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const stompClient = useStompClient();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState();
    const [intersected, setIntersected] = useState(false);

    const fetchMessages = async (params: PagingParams) => {
        const dto = {
            'chatId': params.chatId,
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
            const url = await MessengerService.sendAttachment(file as File, chat.id, user.id);
            let _type = MessageDataType.FILE;
            if (file.name.endsWith('.jpeg') || file.name.endsWith('.jpg') || file.name.endsWith('.png') ||
                file.name.endsWith('.gif')) {
                    _type = MessageDataType.IMAGE;
                }
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
            author);

        const params: IPublishParams = {
            destination: destination,
            body: JSON.stringify({
                message: message,
                chat: chat
            })
        }
        stompClient?.publish(params);
        if (chat.private) {
            // TODO: in private chats we don'r get back our messages, so we've to insert it manually
            setMessages((prevMessages: Message[]) =>
                [message, ...prevMessages]);
            // send message to chats component queue
            bus.emit(`/components/chats/messages`, {
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
                    console.log(`MESSAGE ELEMENT'S INTERSECTED`);
                    setIntersected((prev) => !prev);
                }
            }
        );
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
        console.log(`Chat id changed!`)
        setHasMore(true);
        setPagingParams({ chatId: chat.id });
    }, [chat.id]);

    useEffect(() => {
        console.log(`Intersected!`);
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
                <MessageList messages={messages} user={authContext.user} ref={setLastElementRef} />
                <MessageSender handleSubmit={sendMessage} />
            </div>
        </div>
    )
}