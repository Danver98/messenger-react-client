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
    CREATION = 1,
    INVITATION,
    CHAT,
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

    constructor(
        id: string | null,
        chatId?: number | string | null,
        receiverId?: number | string | null,
        type?: MessageType | null,
        data?: MessageData | null,
        author?: User | null,
        time?: Date | null) {
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

    getDataText(): string {
        if (this.data == null || this.data.data == null) {
            return '';
        }
        return this.data.data;
    }

    getAuthorFullName(): string {
        if (this.author == null || this.author.name == null || this.author.surname == null) {
            return '';
        }
        return this.author.name + ' ' + this.author.surname;
    }

    getAuthorAndDataString(): string {
        return this.getAuthorFullName() + ': ' + this.getDataText();
    }
}

export default Message;