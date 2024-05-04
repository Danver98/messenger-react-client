import { useEffect, useState, useRef } from "react";
import { FetchChats } from "./FetchData";
import "./Chats.css"
import ChatsList from "./ChatsList";
import { CHATS_COMPONENT_MESSAGE_QUEUE, DIRECTION } from "../../../util/Constants";
import { useAuthContextData } from "../../../middleware/AuthProvider";
import ChatRoom from "./ChatRoom";
import Chat from "../../../models/Chat";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { useListener } from 'react-bus';
import Message, { MessageDataType, MessageType } from "../../../models/Message";
import MessengerService from "../../../services/MessengerService";
import ChatCreation from "../../Lists/UserList";
import { useStompClient } from "react-stomp-hooks";
import { IPublishParams } from "@stomp/stompjs";
import User from "../../../models/User";

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
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const stompClient = useStompClient();
    // TODO: direction

    const {
        chats,
        setChats,
        loading,
        hasMore,
        error
    } = FetchChats(userId ? userId : 0, time, chatId, DIRECTION.PAST);

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
                chat.draft
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
                    element.draft);
            } else {
                filteredChats.push(element);
            }
        })
        // TODO: check if it is a first message from a cetaion user to private chat
        if (chat == null) {
            return;
        }
        setChats([chat, ...filteredChats ]);
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
        if (params?.multiSelect) {
            const user = authContext.user as User;
            fetchedChat.name = params?.chatName;
            fetchedChat.participants = [authContext.user?.id, ...users];
            const messageData = {
                type: MessageDataType.TEXT,
                data: `${user.name + ' ' + user.surname} created chat "${params?.chatName}"`
            };
            const type = MessageType.CREATION;
            const author: User = {
                id: user.id,
                name: user.name,
                surname: user.surname,
                avatar: user.avatar
            };
            const receiverId = null;
            const message = new Message(
                null,
                fetchedChat.id,
                receiverId,
                type,
                messageData,
                author);
            const publishParams: IPublishParams = {
                destination: '/app/chats/create-invite',
                body: JSON.stringify({
                    message: message,
                    chat: fetchedChat,
                })
            }
            stompClient?.publish(publishParams);
        }
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