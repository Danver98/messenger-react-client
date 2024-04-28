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
  setCurrentLoggedUser?: any;
}

const ChatDataContext = createContext<IChatDataContext>({});

const ChatDataProvider = ({ children }: { children: any }) => {

  const bus = useBus();
  // Memoized value of the authentication context
  const { currentLoggedUser, getCurrentLoggedUser, setCurrentLoggedUser } = useCurrentLoggedUser();
  const stompClient = useStompClient();

  function OnPublicMessageReceived(payload: any): void {
    const dto = JSON.parse(payload.body);
    const data = dto.message;
    const chat = dto.chat;
    console.log(`Public payload received: ${dto}`);
    const message = new Message(data.id, data.chatId, data.receiverId, data.type, data.data, data.author, data.time);
    bus.emit(`/chats/${data.chatId}/messages`, {
      message: message,
      chat: chat
    });
    // send message to chats component queue
    bus.emit(`/components/chats/messages`, {
      message: message,
      chat: chat
    });
  }

  function OnPrivateMessageReceived(payload: any): void {
    const dto = JSON.parse(payload.body);
    const data = dto.message;
    const chat = dto.chat;
    console.log(`Private payload received: ${dto}`);
    if (data.type === MessageType.CREATION) {
      console.log(`User's got an invitation to the new chat!`)
      if (chat != null && !chat.private) {
        // If given public chat, subscribe
        stompClient?.subscribe(`/topic/chats/${data.chatId}/messages`, (payload: any) => {
          OnPublicMessageReceived(payload);
        });
      }
    }
    const message = new Message(data.id, data.chatId, data.receiverId, data.type, data.data, data.author, data.time);
    bus.emit(`/chats/${data.chatId}/messages`, {
      message: message,
      chat: chat
    });
    // send message to chats component queue
    bus.emit(`/components/chats/messages`, {
      message: message,
      chat: chat
    });
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
      const chats = await MessengerService.getChatsByUserLight(dto);
      console.log(`Subscribing to public chats...`);
      chats?.forEach((chat: Chat) => {
        if (chat.private) return;
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

  const contextValue = {
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