import User from "./User";

export enum MessageDataType {
    DEFAULT = 1,
    TEXT,
    IMAGE,
    VIDEO,
    FILE,
}

export interface MessageData {
    type: MessageDataType;
    data?: any;
}

export enum MessageType {
    CHAT = 1,
    JOIN,
    LEAVE
}


interface Message {
    id: string | null;
    chatId?: number | string | null;
    receiverId?: number | string | null;
    type?: MessageType | null;
    time?: Date | null;
    data?: MessageData | null;
    author?: User | null;
}

class Message implements Message {
    id: string | null;
    chatId?: number | string | null;
    receiverId?: number | string | null;
    type?: MessageType | null;
    time?: Date | null;
    data?: MessageData | null;
    author?: User | null;

    constructor(id: string | null, chatId?: number | string | null, receiverId?: number | string | null,
        type?: MessageType | null, data?: MessageData | null, author?: User | null, time?: Date | null) {
        this.id = id;
        this.chatId = chatId;
        this.receiverId = receiverId;
        this.type = type;
        this.time = time instanceof Date ? time : time == null ? null : new Date(time); // from backend it comes often as timestamp
        this.data = data;
        this.author = author;
    }

    getTime(): Date | null {
        return this.time instanceof Date ? this.time : this.time == null ? null : new Date(this.time);
    }
}

export default Message;