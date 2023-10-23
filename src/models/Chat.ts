import User from "./User";
import Message from "./Message";

interface Chat {
    id: number | string;
    name: string;
    isPrivate?: boolean;
    avatar?: string;
    time?: Date;
    participants?: User[];
    messages?: Message[];
}

class Chat implements Chat {
    id: number | string;
    name: string;
    isPrivate?: boolean;
    avatar?: string;
    time?: Date;
    participants?: User[];
    messages?: Message[];

    constructor(id: number | string, name: string, isPrivate?: boolean, avatar?: string,
        time?: Date, participants?: User[], messages?: Message[]) {
            this.id = id;
            this.name = name;
            this.isPrivate = isPrivate;
            this.avatar = avatar;
            this.time = time;
            this.participants = participants;
            this.messages = messages;
    }

    toString(): string {
        return `id: ${this.id}, name: ${this.name}, isPrivate: ${this.isPrivate}, avatar: ${this.avatar}, time: ${this.time}`;
    }

    dateToString(): string | undefined {
        return this.time?.getTime().toString();
    }
}

export default Chat;