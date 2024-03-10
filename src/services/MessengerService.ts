import HttpService from "./HttpService";
import Chat from "../models/Chat";
import Message, { MessageDataType } from "../models/Message";
import { Headers, RANDOM_CHAT_AVATAR_URL } from "../util/Constants";
import { ID } from "../util/Types";

export interface ChatRequestDTO {
    userId: number | string | null;
    time?: Date | null;
    chatId?: number | string | null;
    direction?: number | null;
    count?: number | null;
}

export interface MessageRequestDTO {
    chatId?: number | string | null;
    time?: Date | null;
    messageId?: number | string | null;
    direction?: number | null;
    count?: number | null;
}

class MessengerService {
    // TODO: coordinate backend and frontend API

    private static _instance: MessengerService;
    private static readonly CHAT_URL = '/chats';
    // Temp variables
    private readonly TEMP_MAX_CHAT_PAGES_COUNT = 5;
    private readonly TEMP_MAX_MESSAGE_PAGES_COUNT = 10;

    private constructor() {

    }

    static get Instance() {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());
    }

    /**
     * 
     * @param id 
     * @returns header for server authorization purposes.
     * It should be attached to EVERY authorized request
     */
    private getRequestResourceObjectHeader(id: ID): HeadersInit {
        return {
            [Headers.X_REQUEST_RESOURCE_OBJECT]: id
        } as HeadersInit;
    }

    private randomIntFromInterval(min: number, max: number) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    async getChat(id?: string | number | null, userId?: string | number): Promise<Chat> {
        const headers: HeadersInit = this.getRequestResourceObjectHeader(id);
        const data = await HttpService.getJson(MessengerService.CHAT_URL + `/${id}?userId=${userId}`, undefined, headers);
        return new Chat(data.id, data.name, data.private, data.avatar, data.time, data.participants);
    }

    async getChatsByUser(dto: ChatRequestDTO): Promise<any> {
        const headers: HeadersInit = this.getRequestResourceObjectHeader(dto.chatId);
        const rawChats: Chat[] = await HttpService.postJson(MessengerService.CHAT_URL + '/', dto, headers);
        return rawChats?.map((chat, index) => {
            const image = this.randomIntFromInterval(80, 120);
            return new Chat(
                chat.id,
                chat.name,
                chat.private,
                chat.avatar || (RANDOM_CHAT_AVATAR_URL + `${image}/${image}`),
                chat.time,
                chat.participants,
                chat.lastMessage == null ? null :
                new Message(
                    chat.lastMessage.id, 
                    chat.lastMessage.chatId, 
                    chat.lastMessage.receiverId, 
                    chat.lastMessage.type, 
                    chat.lastMessage.data, 
                    chat.lastMessage.author, 
                    chat.lastMessage.time)
                );
        }
        )
    }

    /**
     * Creates new chat or returns existing
     */
    async createChat(chat: Chat): Promise<any> {
        const headers: HeadersInit = this.getRequestResourceObjectHeader(null);
        return await HttpService.postJson(MessengerService.CHAT_URL + '/create', chat, headers);
    }

    async deleteChat(id: string | number): Promise<void> {
        const headers: HeadersInit = this.getRequestResourceObjectHeader(id);
        await HttpService.delete(MessengerService.CHAT_URL + `/${id}`, undefined, headers);
    }

    async updateChat(chat: Chat): Promise<void> {
        const headers: HeadersInit = this.getRequestResourceObjectHeader(chat.id);
        await HttpService.putJson(MessengerService.CHAT_URL + `/${chat.id}`, chat, headers);
    }

    async getMessages(dto: MessageRequestDTO): Promise<Message[]> {
        const headers: HeadersInit = this.getRequestResourceObjectHeader(dto.chatId);
        const messages: Message[] = await HttpService.postJson(MessengerService.CHAT_URL + `/${dto.chatId}` + '/messages', dto, headers);
        return messages.map((message: Message, index) => {
            return new Message(
                message.id,
                message.chatId,
                message.receiverId,
                message.type,
                message.data,
                message.author,
                message.time

                );
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
        const headers: HeadersInit = this.getRequestResourceObjectHeader(message.chatId);
        return HttpService.postJson(MessengerService.CHAT_URL + `/${message.chatId}` + '/messages/create', message, headers);
    }

    async addUsersToChat(chatId?: number | string | null, users?: (number | string)[] | null): Promise<any> {
        const headers: HeadersInit = this.getRequestResourceObjectHeader(chatId);
        const dto = {
            chatId: chatId,
            users: users
        } 
        return HttpService.postJson(MessengerService.CHAT_URL + `/add`, dto, headers);
    }

    async sendAttachment(attachment: File, chatId?: ID, userId?: ID): Promise<any> {
        const headers: HeadersInit = this.getRequestResourceObjectHeader(chatId);
        const dto = {
            file: attachment,
            chatId,
            userId
        }
        return HttpService.postFile(MessengerService.CHAT_URL + '/attachment', dto, headers);
    }
}
export default MessengerService.Instance;