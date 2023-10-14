import User from "./User";

enum MessageDataType {
    TEXT = 1,
    IMAGE,
    VIDEO,
    FILE,
}

interface MessageData {
    type: MessageDataType;
    data?: any;
}


interface Message {
    id: string;
    time?: Date | null;
    data?: MessageData;
    author?: User;
}

class Message implements Message {
    id: string;
    time?: Date | null;
    data?: MessageData;
    author?: User;

    constructor(id: string, time?: Date | null, data?: MessageData, author?: User) {
        this.id = id;
        this.time = time;
        this.data = data;
        this.author = author;
    }
}

export default Message;