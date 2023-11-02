import HttpService from "./HttpService";
import Chat from "../models/Chat";
import Message, { MessageDataType } from "../models/Message";
import { RANDOM_CHAT_AVATAR_URL } from "../util/Constants";

export interface ChatRequestDTO {
    userId: number | string | null;
    time?: Date | null;
    chatId?: number | string | null;
    direction?: number | null;
    count?: number | null;
}

export interface MessageRequestDTO {
    chatId: number | string;
    time?: Date | null;
    messageId?: number | string | null;
    direction?: number | null;
    count?: number | null;
}

class MessengerService {
    // TODO: coordinate backend and frontend API

    private static _instance: MessengerService;
    private static readonly CHAT_URL = '/chats';
    private static readonly MESSAGE_URL = '/messages';
    // Temp variables
    private readonly TEMP_MAX_CHAT_PAGES_COUNT = 5;
    private readonly TEMP_MAX_MESSAGE_PAGES_COUNT = 10;

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
        const data = (await HttpService.get(MessengerService.CHAT_URL + `/${id}`)) as Chat;
        return new Chat(data.id, data.name, data.private, data.avatar, data.time, data.participants, data.messages);
    }

    async getChatsByUser(dto: ChatRequestDTO): Promise<any> {
        const rawChats: Chat[] = await HttpService.postJson(MessengerService.CHAT_URL + '/', dto);
        return rawChats?.map((chat, index) => {
            const image = this.randomIntFromInterval(80, 120);
            return new Chat(chat.id, chat.name, chat.private, chat.avatar || (RANDOM_CHAT_AVATAR_URL + `${image}/${image}`),
                chat.time, chat.participants, chat.messages);
        }
        )
    }

    async createChat(chat: Chat): Promise<void> {
        await HttpService.postJson(MessengerService.CHAT_URL, chat);
    }

    async deleteChat(id: string | number): Promise<void> {
        await HttpService.delete(MessengerService.CHAT_URL + `/${id}`);
    }

    async updateChat(chat: Chat): Promise<void> {
        await HttpService.putJson(MessengerService.CHAT_URL + `/${chat.id}`, chat);
    }

    async getMessages(dto: MessageRequestDTO): Promise<Message[]> {
        const messages: Message[] = await HttpService.postJson(MessengerService.MESSAGE_URL + '/', dto);
        return messages.map((message: Message, index) => {
            return new Message(message.id, message.chatId, message.receiverId, message.type, message.data, message.author, message.time);
        })
        // return new Promise((resolve, reject) => {
        //     setTimeout(() => {
        //         const data = Array.from({ length: 50 }).map((element, index) => {
        //             const date = new Date();
        //             const id = crypto.randomUUID();
        //             const userId = this.randomIntFromInterval(1, 1000);
        //             const size = this.randomIntFromInterval(80, 120);
        //             const longText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Porttitor massa id neque aliquam vestibulum morbi blandit. Eu feugiat pretium nibh ipsum consequat nisl. In eu mi bibendum neque egestas congue quisque egestas. Tempus iaculis urna id volutpat. Vitae aliquet nec ullamcorper sit amet risus. Nec sagittis aliquam malesuada bibendum arcu. Fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis. Pellentesque massa placerat duis ultricies lacus sed turpis tincidunt. Nisi lacus sed viverra tellus in hac habitasse platea."
        //             const shortText = `TODO: generate text with lorem ipsum. Message number: ${index + 1}, info: ${userId % 4 === 0}`;
        //             return new Message(
        //                 id,
        //                 dto.chatId,
        //                 {
        //                     type: MessageDataType.TEXT,
        //                     data: (userId % 4 === 0) ? longText : shortText
        //                 },
        //                 {
        //                     id: userId,
        //                     name: `Name ${userId}`,
        //                     surname: `Surname ${userId}`,
        //                     avatar: RANDOM_CHAT_AVATAR_URL + `${size}/${size}`
        //                 },
        //                 date
        //             );
        //         });
        //         resolve(data);
        //     }, 1000);
        // });
    }

    async sendMessage(message: Message): Promise<any> {
        return HttpService.postJson(MessengerService.MESSAGE_URL + '/create', message);
    }

    async addUsersToChat(chatId: number | string, users: (number | string)[]): Promise<any> {
        const dto = {
            chatId: chatId,
            users: users
        }
        return HttpService.postJson(MessengerService.CHAT_URL + `/add`, dto);
    }
}
export default MessengerService.Instance;