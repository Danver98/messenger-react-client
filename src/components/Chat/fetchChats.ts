import { useCallback, useEffect, useState } from "react";
import Chat from "../../models/Chat";
import ChatService from "../../services/ChatService";

export default function FetchChats(userId: number | string, time?:  Date | null, chatId?: number | string | null,
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
                'threshold': time,
                'chatIdThreshold': chatId,
                'direction': direction,
                'count': count
            };
            const newChats = await ChatService.getChatsByUser(dto);
            setChats([...chats, ...newChats]);
            setIsLoading(false);
            setHasMore(newChats && newChats.length > 0);
        };
        fetchChats();
    }, []); // once {time, chatId}

    return { chats, loading: isLoading, hasMore, error };
}