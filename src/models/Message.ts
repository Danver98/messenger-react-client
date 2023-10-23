import User from "./User";

export enum MessageDataType {
    TEXT = 1,
    IMAGE,
    VIDEO,
    FILE,
}

export interface MessageData {
    type: MessageDataType;
    data?: any;
}


interface Message {
    id: string;
    chatId: number | string;
    time?: Date | null;
    data?: MessageData;
    author?: User;
}

class Message implements Message {
    id: string;
    chatId: number | string;
    time?: Date | null;
    data?: MessageData;
    author?: User;

    constructor(id: string, chatId: number | string, data: MessageData, author: User, time?: Date | null) {
        this.id = id;
        this.chatId = chatId;
        this.time = time;
        this.data = data;
        this.author = author;
    }
}

export default Message;