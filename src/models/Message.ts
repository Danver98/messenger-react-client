import User from "./User";

export enum MessageDataType {
    DEFAULT = 1,
    TEXT,
    IMAGE,
    VIDEO,
    FILE,
    AUDIO,
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
    read?: boolean | null;
}

class Message implements Message {
    id: string | null;
    chatId?: number | string | null;
    receiverId?: number | string | null;
    type?: MessageType | null;
    time?: Date | null;
    data?: MessageData | null;
    author?: User | null;
    read?: boolean | null;

    constructor(
        id: string | null,
        chatId?: number | string | null,
        receiverId?: number | string | null,
        type?: MessageType | null,
        data?: MessageData | null,
        author?: User | null,
        time?: Date | null,
        read?: boolean | null) {
        this.id = id;
        this.chatId = chatId;
        this.receiverId = receiverId;
        this.type = type;
        this.time = time instanceof Date ? time : time == null ? null : new Date(time); // from backend it comes often as timestamp
        this.data = data;
        this.author = author;
        this.read = read;
    }

    getTime(): Date | null {
        return this.time instanceof Date ? this.time : this.time == null ? null : new Date(this.time);
    }

    getDataText(): string {
        if (this.data == null || this.data.data == null) {
            return '';
        }
        if (this.data.type === MessageDataType.IMAGE) {
            return '[IMAGE]';
        }
        if (this.data.type === MessageDataType.AUDIO) {
            return '[AUDIO]';
        }
        if (this.data.type === MessageDataType.VIDEO) {
            return '[VIDEO]';
        }
        if (this.data.type === MessageDataType.FILE) {
            return '[FILE]';
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