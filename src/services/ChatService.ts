import HttpService from "./HttpService";
import Chat from "../models/Chat";
import Message from "../models/Message";
import { RANDOM_CHAT_AVATAR_URL } from "../util/Constants";

class ChatService {
    // TODO: coordinate backend and frontend API

    private static _instance: ChatService;
    private static readonly URL = '/chats';

    private constructor() {

    }

    static get Instance() {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());      
    }

    async getChat(id: string | number): Promise<Chat> {
        const data = (await HttpService.get(ChatService.URL + `/${id}`)) as Chat;
        return new Chat(data.id, data.name, data.isPrivate, data.avatar, data.participants, data.messages);
    }

    // TODO
    async getChatsByUser(userId?: number | string): Promise<any[]> {
        //return await HttpService.get(`/users/${userId}/chats`) as Chat[];
        // Return without await?
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const size =Math.floor(Math.random() * (10));
                const arr = new Array(size);
                for (let i=0; i< size; i++) {
                    arr[i] = i + 1;
                }
                const data = Array.from(arr, (index: number) => new Chat(index +1, `Name ${index}`, false, RANDOM_CHAT_AVATAR_URL + '100/100'));
                resolve(data);
            }, 1000);
        });
        // return await HttpService.get(`/chats`, {
        //     'userId': userId,
        // }) as Chat[];
    }

    async createChat(chat: Chat): Promise<void> {
        await HttpService.post(ChatService.URL, chat);
    }

    async deleteChat(id: string | number): Promise<void> {
        await HttpService.delete(ChatService.URL + `/${id}`);
    }

    async updateChat(chat: Chat): Promise<void> {
        await HttpService.put(ChatService.URL + `/${chat.id}`, chat);
    }

    async getMessages(): Promise<Message[]> {
        return [new Message()];
    }
}
export default ChatService.Instance;