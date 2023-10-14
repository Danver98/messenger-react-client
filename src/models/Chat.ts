import User from "./User";
import Message from "./Message";

interface Chat {
    id: number | string;
    name: string;
    isPrivate?: boolean;
    avatar?: string;
    lastChanged?: Date;
    participants?: User[];
    messages?: Message[];
}

class Chat implements Chat {
    id: number | string;
    name: string;
    isPrivate?: boolean;
    avatar?: string;
    lastChanged?: Date;
    participants?: User[];
    messages?: Message[];

    constructor(id: number | string, name: string, isPrivate?: boolean, avatar?: string,
        lastChanged?: Date, participants?: User[], messages?: Message[]) {
            this.id = id;
            this.name = name;
            this.isPrivate = isPrivate;
            this.avatar = avatar;
            this.lastChanged = lastChanged;
            this.participants = participants;
            this.messages = messages;
    }

    toString(): string {
        return `id: ${this.id}, name: ${this.name}, isPrivate: ${this.isPrivate}, avatar: ${this.avatar}, lastChanged: ${this.lastChanged}`;
    }
}

export default Chat;