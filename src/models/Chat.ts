import User from "./User";
import Message from "./Message";

interface Chat {
    id: number | string;
    name: string;
    private?: boolean;
    avatar?: string;
    time?: Date | null;
    participants?: (number | string)[];
    messages?: Message[];
    lastMessage?: Message | null;
}

class Chat implements Chat {
    id: number | string;
    name: string;
    private?: boolean;
    avatar?: string;
    time?: Date | null;
    participants?: (number | string)[];
    messages?: Message[];
    lastMessage?: Message | null;

    constructor(id: number | string, name: string, _private?: boolean, avatar?: string,
        time?: Date | null, participants?: (number | string)[], messages?: Message[], lastMessage?: Message | null) {
            this.id = id;
            this.name = name;
            this.private = _private;
            this.avatar = avatar;
            this.time = time instanceof Date ? time : time == null ? null : new Date(time); // from backend it comes often as timestamp
            this.participants = participants;
            this.messages = messages;
            this.lastMessage = lastMessage;
    }

    toString(): string {
        return `id: ${this.id}, name: ${this.name}, private: ${this.private}, avatar: ${this.avatar}, time: ${this.time}`;
    }

    dateToString(): string | undefined {
        return this.time?.getTime().toString();
    }

    getTime(): Date | null {
        return this.time instanceof Date ? this.time : this.time == null ? null : new Date(this.time);
    }
}

export default Chat;