import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useCurrentLoggedUser } from "../../components/hooks/useToken";
import { useStompClient } from "react-stomp-hooks";
import Message, { MessageType } from "../../models/Message";
import MessengerService, { ChatRequestDTO } from "../../services/MessengerService";
import Chat from "../../models/Chat";
import User from "../../models/User";
import { useBus, useListener } from 'react-bus';

interface ChatDataStorage {
  messages: Message[];
}

interface IChatDataContext {
  chatsData?: any;
  setChatsData?: any;
  setCurrentUserId?: any;
  setCurrentLoggedUser?: any;
}

const ChatDataContext = createContext<IChatDataContext>({});

const ChatDataProvider = ({ children }: { children: any }) => {

  const bus = useBus();
  // Memoized value of the authentication context
  const { currentLoggedUser, getCurrentLoggedUser, setCurrentLoggedUser } = useCurrentLoggedUser();
  const initialUserId = useMemo(() => {
    const user = getCurrentLoggedUser();
    return user ? user.id : null;
  }, []);
  const [currentUserId, setCurrentUserId] = useState(initialUserId);
  const [chatsData, setChatsData] = useState<{ [id: string | number]: ChatDataStorage }>(
    {
    }
  );
  const stompClient = useStompClient();

  function OnPublicMessageReceived(payload: any): void {
    const data = JSON.parse(payload.body);
    console.log(`Public payload received: ${data}`);
    const message = new Message(data.id, data.chatId, data.receiverId, data.type, data.data, data.author, data.time);
    bus.emit(`/chats/${data.chatId}/messages`, message);
    // send message to chats component queue
    bus.emit(`/components/chats/messages`, message);
  }

  function OnPrivateMessageReceived(payload: any): void {
    const data = JSON.parse(payload.body);
    console.log(`Private payload received: ${data}`);
    if (data.type === MessageType.INVITATION) {
      // User's invited to public dialog
      console.log(`User's got an invitation to the new chat!`)
      stompClient?.subscribe(`/topic/chats/${data.chatId}/messages`, (payload: any) => {
        OnPublicMessageReceived(payload);
      });
    }
    const message = new Message(data.id, data.chatId, data.receiverId, data.type, data.data, data.author, data.time);
    bus.emit(`/chats/${data.chatId}/messages`, message);
    // send message to chats component queue
    bus.emit(`/components/chats/messages`, message);
  }

  useEffect(() => {
    const subscribe = async (user: User | null) => {
      if (!user) return;
      console.log(`Subscribing to private chat...`);
      stompClient?.subscribe(`/user/${user.id}/queue/chats/messages`, (payload: any) => {
        OnPrivateMessageReceived(payload);
      });
      // Subscribe to public chats
      const dto: ChatRequestDTO = {
        userId: user.id
      };
      const chats = await MessengerService.getChatsByUser(dto);
      console.log(`Subscribing to public chats...`);
      chats?.forEach((chat: Chat) => {
        stompClient?.subscribe(`/topic/chats/${chat.id}/messages`, (payload: any) => {
          OnPublicMessageReceived(payload);
        });
      });
      console.log(`Subscription complete!`);
    }

    subscribe(currentLoggedUser);

    return () => {
      console.log(`Finishing ChatDataProvider useEffect()`);
    }

  }, [currentLoggedUser, stompClient]);


  useEffect(() => {
    console.log(`chatsDataChanged: ${chatsData?.toString()}`);
  }, [chatsData]);

  useEffect(() => {
    console.log(`currentUserIdChanged: ${currentUserId?.toString()}`);
  }, [currentUserId]);

  const contextValue = {
    chatsData,
    setChatsData,
    setCurrentUserId,
    setCurrentLoggedUser
  }

  // Provide the ChatData context to the children components
  return (
    <ChatDataContext.Provider value={contextValue}>{children}</ChatDataContext.Provider>
  );
};

export const useChatData = () => {
  return useContext(ChatDataContext);
};

export default ChatDataProvider;