import { useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import AuthContext from "../../../contexts/AuthContext";
import MessageList from "./MessagesList";
import { FetchMessages } from "./FetchData";
import { DIRECTION } from "../../../util/Constants";
import Chat from "../../../models/Chat";
import Message, { MessageDataType } from "../../../models/Message";
import MessengerService from "../../../services/MessengerService";
import User from "../../../models/User";
import UserSelectionDialog from "./UserSelectionDialog";
import { useAuthContextData } from "../../../middleware/AuthProvider";

function MessageSender({ chat, user }: { chat: Chat, user: User }) {
    const handleSubmit = async (event: any) => {
        const formData = new FormData(event.currentTarget);
        event.preventDefault();
        // Are id, time and so on created on the server side?
        const messageData = {
            type: MessageDataType.TEXT,
            data: formData.get('messageData')
        }
        const author: User = {
            id: user.id,
            name: user.name,
            surname: user.surname
        };
        const message = new Message(crypto.randomUUID(), chat.id, messageData, author);
        MessengerService.sendMessage(message);
    }
    return (
        <div className="chat-room-message-sender">
            <form
                method="POST"
                onSubmit={handleSubmit}
                className="chat-room-message-sender__FormContainer"
            >
                <div className="chat-room-message-sender__Form">
                    <textarea name="messageData" rows={3} className="chat-room-message-sender__TextArea"></textarea>
                    <button type="submit" onClick={() => { }} className="chat-room-message-sender__SendButton">Send</button>
                </div>
            </form>
        </div>
    )
}

export default function ChatRoom() {
    const location = useLocation();
    const authContext = useAuthContextData();
    const chat: Chat = location.state.chat; // Or better fetch new info?
    const [{ time, messageId }, setThreshold] = useState<{ time?: Date | null, messageId: number | string | null }>({ time: null, messageId: null });
    const [lastElementRef, setLastElementRef] = useState(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const {
        messages,
        loading,
        hasMore,
        error
    } = FetchMessages(chat.id, time, messageId, DIRECTION.PAST);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    console.log(`MESSAGE ELEMENT'S INTERSECTED`);
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

    return (
        <div className="chat-room-page">
            <div className="chat-room-page-header">
                <div className="chat-room-page-header__ChatName">{chat.name}</div>
                <UserSelectionDialog chat={chat}/>
            </div>
            <MessageList messages={messages} user={authContext.user} ref={setLastElementRef} />
            <MessageSender chat={chat} user={authContext.user as User} />
        </div>
    )
}