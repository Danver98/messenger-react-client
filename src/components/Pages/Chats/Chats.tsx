import { useEffect, useState, useRef, forwardRef, } from "react";
import { FetchChats } from "./FetchData";
import "./Chats.css"
import ChatsList from "./ChatsList";
import { DIRECTION } from "../../../util/Constants";
import { useAuthContextData } from "../../../middleware/AuthProvider";
import ChatRoom from "./ChatRoom";
import Chat from "../../../models/Chat";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { useBus, useListener } from 'react-bus';
import Message from "../../../models/Message";
import MessengerService from "../../../services/MessengerService";

const SearchBar = ({ onChange }: { onChange: (value: string) => any }) => {
    return (
        <TextField
            id="standard-basic"
            label="Search"
            variant="standard"
            fullWidth
            margin="none"
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
            onChange={(e: any) => {
                onChange(e.target.value)
            }}
        />
    )
}


export default function Chats() {
    const [{ time, chatId }, setThreshold] = useState<{ time?: Date | null, chatId: number | string | null }>({ time: null, chatId: null });
    const [lastElementRef, setLastElementRef] = useState(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [counter, setCounter] = useState(0);
    const authContext = useAuthContextData()
    const userId = authContext.user?.id;
    const [activeChat, setActveChat] = useState<Chat | null>(null);
    // TODO: direction

    const {
        chats,
        setChats,
        loading,
        hasMore,
        error
    } = FetchChats(userId ? userId : 0, time, chatId, DIRECTION.PAST);

    useListener(`/components/chats/messages`, (data: any) => {
        console.log(`Received message for '/components/chats/messages' channel `);
        const message = new Message(data.id, data.chatId, data.receiverId, data.type, data.data, data.author, data.time);
        const changedChat = chats.find((chat: Chat) => chat.id === data.chatId);
        if (changedChat == null) return;
        const changedChatCopy = new Chat(
            changedChat.id,
            changedChat.name,
            changedChat.private,
            changedChat.avatar,
            changedChat.time,
            changedChat.participants,
            data.messages,
            message);
        const filteredChats = chats.filter((chat: Chat) => chat.id !== data.chatId) || [];
        setChats([changedChatCopy, ...filteredChats ]);
    });

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    console.log(`CHAT ELEMENT'S INTERSECTED`);
                    setCounter(prev => prev + 1);
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

    const handleClick = async (chat: Chat) => {
        // make a fetch
        const fetchedChat = await MessengerService.getChat(chat.id, userId);
        // This is a chat with participants
        setActveChat(fetchedChat);
    }

    return (
        <>
            <div className="chat-page">
                {/* <div> Last chat info: {chats && chats.length ? chats[chats.length - 1].toString() : null}</div> */}
                <div className="chat-dashboard">
                    <div className="chat-dashboard__left">
                        <SearchBar
                            onChange={() => {}}
                        />
                        <ChatsList chats={chats} ref={setLastElementRef} itemClickHandler={handleClick} />
                    </div>
                    <div className="chat-dashboard__right">
                        {
                            activeChat &&
                            <ChatRoom chat={activeChat} />
                        }
                        {
                            activeChat == null &&
                            <div className="chat-room__empty">
                                    Select chat to start messaging
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}