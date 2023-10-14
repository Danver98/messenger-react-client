import { useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import AuthContext from "../../../contexts/AuthContext";
import User from "../../../models/User";
import Chat from "../../../models/Chat";
import Message from "../../../models/Message";

const MessageList = ({messages, user}: {messages?: Message[], user?: User}) => {
    const listItems = messages?.map((message, index) => {
        return <>
        </>
    })

    return (
        <ul className="chat-room-message-list">{listItems}</ul>
    )
}

export default function ChatRoom() {
    const location = useLocation();
    const authContext = useContext(AuthContext);
    const chatId = location.state.chatId;
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        
    });
    
    return (
        <div className="chat-room-message-container">
            <MessageList messages={messages} user={authContext.user}/>
        </div>
    )
}