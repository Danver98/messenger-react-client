import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useCurrentLoggedUser } from "../../components/hooks/useToken";
import { useStompClient } from "react-stomp-hooks";
import Message, { MessageType } from "../../models/Message";
import MessengerService, { ChatRequestDTO } from "../../services/MessengerService";
import Chat from "../../models/Chat";
import User from "../../models/User";

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

  // Memoized value of the authentication context
  const { currentLoggedUser, getCurrentLoggedUser, setCurrentLoggedUser } = useCurrentLoggedUser();
  const initialUserId = useMemo(() => {
    const user = getCurrentLoggedUser();
    return user ? user.id : null;
  }, []);
  const [ currentUserId, setCurrentUserId ] = useState(initialUserId);
  const [chatsData, setChatsData] = useState<{ [id: string | number]: ChatDataStorage }>({});
  const stompClient = useStompClient();

  const onPublicMessageReceived = (payload: any) => {
    const data = JSON.parse(payload.body);
    console.log(`Public payload received: ${data}`);
    const newMessages = [
      new Message(data.id, data.chatId, data.receiverId, data.type, data.data, data.author, data.time),
      ...chatsData[data.chatId].messages
    ];

    setChatsData({ ...chatsData, chatId: { ...chatsData[data.chatId], messages: newMessages } });
  }

  const onPrivateMessageReceived = (payload: any) => {
    const data = JSON.parse(payload.body);
    console.log(`Private payload received: ${data}`);
    if (data.type === MessageType.INVITATION) {
      // User's invited to public dialog
      console.log(`User's got an invitation to the new chat!`)
      stompClient?.subscribe(`/topic/chats/${data.chatId}/messages`, onPublicMessageReceived);
    }
    const newMessages = [
      new Message(data.id, data.chatId, data.receiverId, data.type, data.data, data.author, data.time),
      ...chatsData[data.chatId].messages
    ];

    setChatsData({ ...chatsData, chatId: { ...chatsData[data.chatId], messages: newMessages } });
  }

  useEffect(() => {
    const subscribe = async (user: User | null) => {
      if (!user) return;
      console.log(`Subscribing to private chat...`)
      stompClient?.subscribe(`/user/${user.id}/queue/chats/messages`, (payload: any) => {
        onPrivateMessageReceived(payload);
      });
      // Subscribe to public chats
      const dto: ChatRequestDTO = {
        userId: user.id
      };
      const chats = await MessengerService.getChatsByUser(dto);
      console.log(`Subscribing to public chats...`);
      //stompClient?.subscribe(`/topic/chats/${chat.id}/messages`, onPublicMessageReceived);
      const newChatsData: { [id: string | number]: ChatDataStorage } = {};
      chats?.forEach((chat: Chat) => {
        stompClient?.subscribe(`/topic/chats/${chat.id}/messages`, (payload: any) => {
          onPublicMessageReceived(payload);
        });
        newChatsData[chat.id] = {messages: []}
      });
      setChatsData({...newChatsData});
      console.log(`Subscribtion complete!`);
    }
  
    subscribe(currentLoggedUser);

    return () => {
      console.log(`Finishing ChatDataProvider useEffect()`);
    }

  }, [currentLoggedUser, stompClient]);


  useEffect(() => {
    console.log(`chatsDataChanged: ${chatsData.toString()}`);
  }, [chatsData]);

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