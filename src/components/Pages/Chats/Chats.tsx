import { useEffect, useState, useRef } from "react";
import { FetchChats } from "./FetchData";
import "./Chats.css"
import ChatsList from "./ChatsList";
import { CHATS_COMPONENT_MESSAGE_QUEUE, CHATS_COMPONENT_MSG_UNREAD_COUNT_QUEUE, DIRECTION } from "../../../util/Constants";
import { useAuthContextData } from "../../../middleware/AuthProvider";
import ChatRoom from "./ChatRoom";
import Chat from "../../../models/Chat";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { useListener } from 'react-bus';
import Message, { MessageType } from "../../../models/Message";
import MessengerService from "../../../services/MessengerService";
import ChatCreation from "../../Lists/UserList";

export interface ChatCreationParams {
    chatName: string | null;
    multiSelect: boolean | null;
}

const SearchBar = ({ onChange }: { onChange: (value: string) => any }) => {
    return (
        <TextField
            id="standard-basic"
            label="Search"
            variant="standard"
            fullWidth
            margin="none"
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }
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
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    // TODO: direction

    const {
        chats,
        setChats,
        loading,
        hasMore,
        error
    } = FetchChats(userId ? userId : 0, time, chatId, DIRECTION.PAST);

    // New message's been sent
    useListener(CHATS_COMPONENT_MESSAGE_QUEUE, (dto: any) => {
        const msg = dto.message;
        let chat = dto.chat;
        const message = new Message(msg.id, msg.chatId, msg.receiverId, msg.type, msg.data, msg.author, msg.time);
        if (msg.type === MessageType.CREATION && chat != null) {
            const newChat = new Chat(
                chat.id,
                chat.name,
                chat.private,
                chat.avatar,
                chat.time,
                chat.participants,
                message,
                chat.draft,
                dto.unreadMsgCount != null ? dto.unreadMsgCount + 1 :
                chat.unreadMsgCount != null ? chat.unreadMsgCount + 1 : null,
            );
            setChats((prevChats) => [newChat, ...prevChats]);
            return;
        }
        const filteredChats: Chat[] = [];
        chats.forEach((element: Chat) => {
            if (element.id === msg.chatId) {
                chat = new Chat(
                    element.id,
                    element.name,
                    element.private,
                    element.avatar,
                    element.time,
                    element.participants,
                    message,
                    element.draft,
                    dto.unreadMsgCount != null ? dto.unreadMsgCount + 1 :
                        element.unreadMsgCount != null ? element.unreadMsgCount + 1 : null
                );
            } else {
                filteredChats.push(element);
            }
        })
        // TODO: check if it is a first message from a certain user to private chat
        if (chat == null) {
            return;
        }
        if ((chat instanceof Chat)) {
            chat = chat = new Chat(chat.id, chat.name, chat.private, chat.avatar, chat.time, chat.participants, message, chat.draft, chat.unreadMsgCount);
        }
        setChats([chat, ...filteredChats ]);
    });


    // Update chat list unread messages counter when chat room is open
    useListener(CHATS_COMPONENT_MSG_UNREAD_COUNT_QUEUE, (dto: any) => {
        if (!dto.chat) {
            return;
        }
        //setChats((prevChats) => [newChat, ...prevChats]);
        const newChats: Chat[] = [];
        chats.forEach((element: Chat) => {
            if (element.id === dto.chat?.id) {
                const chat = new Chat(
                    element.id,
                    element.name,
                    element.private,
                    element.avatar,
                    element.time,
                    element.participants,
                    element.lastMessage,
                    element.draft,
                    dto.unreadMsgCount === 0 ? null : dto.unreadMsgCount);
                    newChats.push(chat);
            } else {
                newChats.push(element);
            }
        });

        setChats(newChats);     
    });

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
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
        setActiveChat(fetchedChat);
    }

    const handleChatCreation = async(users: any[], params?: ChatCreationParams | null) => {
        // Create private chat if doesn't exist or redirect to it
        const newChat = new Chat(
            null,
            params?.chatName || null,
            !params?.multiSelect , //private
            null,
            null,
            [authContext.user?.id, ...users], // participants
            null,
            true //draft
        );
        const fetchedChat = await MessengerService.createChat(newChat);
        setActiveChat(fetchedChat);
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
                        <ChatsList
                            chats={chats}
                            ref={setLastElementRef}
                            itemClickHandler={handleClick} 
                        />
                        <ChatCreation 
                            user={authContext.user}
                            onResult={(elements: any[], params?: ChatCreationParams | null) => {handleChatCreation(elements, params)}}
                        />
                    </div>
                    <div className="chat-dashboard__right">
                        {
                            activeChat &&
                            <ChatRoom chat={activeChat} closeChat={() => {setActiveChat(null)}}/>
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