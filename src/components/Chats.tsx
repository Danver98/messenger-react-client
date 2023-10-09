import { useEffect, useState } from "react";
import Chat from "../models/Chat";
import ChatService from "../services/ChatService";

function ChatsList({chats} : {chats: Chat[]}) {
    const listItems = chats.map((chat, index) =>
        <li 
            key={chat.id}
            style={{backgroundColor: "lightblue"}}
        >
            <img
                src={chat.avatar}
                alt={chat.name}
                width="200"
                height="200"
                style={{borderRadius: "30%"}}
            />
            <p>
                <b>{chat.name}</b>
            </p>
        </li>)
    return (
        <ul>{listItems}</ul>
    )
}

export default function Chats({userId} : {userId?: number | string}) {
    const [user, setUser] = useState(userId);
    const [chats, setChats] = useState<Chat[]>([]);
    useEffect(() => {
        let isSubscribed = true;
        const fetchChats = async () => {
            const newChats = await ChatService.getChatsByUser(user);
            if (isSubscribed) {
                setChats(newChats);
            }
        };
        fetchChats();
        return () => {isSubscribed = false};
        
      }, [user]); // how to pass id here?
    return (
        <>
        <div>
            This is 'Chats' page!
        </div>
        <ChatsList chats={chats}/>
        </>
    )
}