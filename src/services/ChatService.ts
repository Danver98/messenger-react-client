import HttpService from "./HttpService";
import Chat from "../models/Chat";
import Message from "../models/Message";
import { RANDOM_CHAT_AVATAR_URL } from "../util/Constants";
import { LoremIpsum, Avatar } from 'react-lorem-ipsum';
import { loremIpsum, name, surname, fullname, username } from 'react-lorem-ipsum';

export interface ChatRequestDTO {
    userId: number | string | null;
    threshold?: Date | null;
    chatIdThreshold?: number | string | null;
    direction?: number | null;
    count?: number | null;
}

class ChatService {
    // TODO: coordinate backend and frontend API

    private static _instance: ChatService;
    private static readonly URL = '/chats';
    private readonly MAX_PAGES_COUNT = 5;

    private constructor() {

    }

    static get Instance() {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());      
    }

    private randomIntFromInterval(min: number, max: number) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
      }

    async getChat(id: string | number): Promise<Chat> {
        const data = (await HttpService.get(ChatService.URL + `/${id}`)) as Chat;
        return new Chat(data.id, data.name, data.isPrivate, data.avatar, data.lastChanged, data.participants, data.messages);
    }

    // TODO
    async getChatsByUser(dto: ChatRequestDTO): Promise<Chat[]> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if ((typeof dto.chatIdThreshold === 'number') && dto.chatIdThreshold > this.MAX_PAGES_COUNT) {
                    resolve([]);
                }
                const data = Array.from({length: 30}).map((element, index) => {
                    const date = new Date();
                    const id = this.randomIntFromInterval(1, 1000000);
                    const image = this.randomIntFromInterval(80, 120)
                    return new Chat(id, `Chat with id: ${id}, number: ${index + 1}`, false, RANDOM_CHAT_AVATAR_URL + `${image}/${image}`, date);
                });
                resolve(data);
            }, 1000);
        });
        //return HttpService.get(ChatService.URL, dto);
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