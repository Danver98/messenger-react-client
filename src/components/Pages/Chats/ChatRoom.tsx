import { useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import MessageList from "./MessagesList";
import { FetchMessages } from "./FetchData";
import { DIRECTION, ServiceUrl } from "../../../util/Constants";
import Chat from "../../../models/Chat";
import Message, { MessageDataType, MessageType } from "../../../models/Message";
import User from "../../../models/User";
import UserSelectionDialog from "./UserSelectionDialog";
import { useAuthContextData } from "../../../middleware/AuthProvider";
import { Button, TextareaAutosize } from "@mui/material";
import { Client, IPublishParams } from '@stomp/stompjs';
import { useStompClient } from "react-stomp-hooks";
import { useBus, useListener } from 'react-bus';

function MessageSender({ handleSubmit }: { handleSubmit: (event: any) => any }) {
    return (
        <div className="chat-room-message-sender">
            <form
                method="POST"
                onSubmit={handleSubmit}
                className="chat-room-message-sender__FormContainer"
            >
                <div className="chat-room-message-sender__Form">
                    <TextareaAutosize
                        aria-label="minimum height"
                        name="messageData"
                        minRows={4}
                        maxRows={4}
                        placeholder="Enter your message"
                        className="chat-room-message-sender__TextArea"
                    />
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

export default function ChatRoom({ chat }: { chat: Chat}) {
    const location = useLocation();
    const authContext = useAuthContextData();
    const [{ time, messageId }, setThreshold] = useState<{ time?: Date | null, messageId: number | string | null }>({ time: null, messageId: null });
    const [lastElementRef, setLastElementRef] = useState(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const stompClient = useStompClient();

    const {
        messages,
        setMessages,
        loading,
        hasMore,
        error
    } = FetchMessages(chat.id, time, messageId, DIRECTION.PAST, 50);

    const onMessageReceived = (data: any) => {
        const message = new Message(data.id, data.chatId, data.receiverId, data.type, data.data, data.author, data.time);
        setMessages((prevMessages: Message[]) =>
            [message, ...prevMessages])
    }

    const sendMessage = async (event: any) => {
        const user = authContext.user as User;
        const formData = new FormData(event.currentTarget);
        event.preventDefault();
        // Are id, time and so on created on the server side?
        const messageData = {
            type: MessageDataType.TEXT,
            data: formData.get('messageData')
        };
        const type = MessageType.CHAT;
        const author: User = {
            id: user.id,
            name: user.name,
            surname: user.surname,
            avatar: user.avatar
        };
        const receiverId = chat.private && chat.participants?
                        chat.participants[0] === user.id ?
                                        chat.participants[1]
                                        : chat.participants[0]
                        : null;
        const message = new Message(
            null,
            chat.id,
            receiverId,
            type,
            messageData,
            author);
        const params: IPublishParams = {
            destination: chat.private ? '/app/chats/private/send-message' : '/app/chats/public/send-message',
            body: JSON.stringify({
                message: message,

            })
        }
        stompClient?.publish(params);
        if (chat.private) {
            // TODO: in private chats we don'r get back our messages, so we've to insert it manually
            setMessages((prevMessages: Message[]) =>
            [message, ...prevMessages])
        }
    }

    // Subscribe to new messages coming to chat
    useListener(`/chats/${chat.id}/messages`, onMessageReceived);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    console.log(`MESSAGE ELEMENT'S INTERSECTED`);
                    if (messages) {
                        const lastMsg = messages[messages.length - 1];
                        setThreshold({time: lastMsg.time, messageId: lastMsg.id});
                    }
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
        //setMessages((prevMessages) => []);
    }, [chat.id]);

    return (
        <div className="chat-room-page">
            <div className="chat-room-page__CentralBlock">
                <div className="chat-room-page-header">
                    <div className="chat-room-page-header__ChatName">{chat.name}</div>
                    <UserSelectionDialog chat={chat} />
                </div>
                <MessageList messages={messages} user={authContext.user} ref={setLastElementRef} />
                <MessageSender handleSubmit={ sendMessage }/>
            </div>
        </div>
    )
}