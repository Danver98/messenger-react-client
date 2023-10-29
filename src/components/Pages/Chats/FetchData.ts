import { useCallback, useEffect, useState } from "react";
import Chat from "../../../models/Chat";
import MessengerService from "../../../services/MessengerService";
import Message from "../../../models/Message";

export function FetchChats(userId: number | string, time?: Date | null, chatId?: number | string | null,
    direction?: number | null, count?: number | null) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState();
    console.log(`FetchChats() called!`);

    useEffect(() => {
        const fetchChats = async () => {
            console.log(`useEffect() called! Fetching with params: userId: ${userId}, threshold: ${time}, thresholdChatId: ${chatId},
            direction: ${direction}, count: ${count}, isLoading: ${isLoading}`)
            if (isLoading) return;
            setIsLoading(true);
            const dto = {
                'userId': userId,
                'time': time,
                'chatId': chatId,
                'direction': direction,
                'count': count
            };
            const newChats = await MessengerService.getChatsByUser(dto) || [];
            setChats([...chats, ...newChats]);
            setIsLoading(false);
            setHasMore(newChats && newChats.length > 0);
        };
        fetchChats();
    }, []); // once {time, chatId}

    return { chats, loading: isLoading, hasMore, error };
}

export function FetchMessages(chatId: number | string, time?: Date | null, messageId?: number | string | null,
    direction?: number | null, count?: number | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState();
    useEffect(() => {
        const fetchMessages = async () => {
            console.log(`useEffect() with fetchMessages() called! isLoading: ${isLoading}, hasMore: ${hasMore}, chatId: ${chatId},
            time: ${time}, messageId: ${messageId}, direction: ${direction}, count: ${count}`)
            if (isLoading) return;
            setIsLoading(true);
            const dto = {
                'chatId': chatId,
                'time': time,
                'messageId': messageId,
                'direction': direction,
                'count': count
            };
            const newMessages = await MessengerService.getMessages(dto);
            setMessages([...messages, ...newMessages]);
            setIsLoading(false);
            setHasMore(newMessages && newMessages.length > 0);
        };
        fetchMessages();
    }, []); // once {time, messageId}

    return { messages, loading: isLoading, hasMore, error };
}