import Message from "./Message";

interface IChat {
    id?: number | string | null;
    name?: string | null;
    private?: boolean;
    avatar?: string | null;
    time?: Date | null;
    participants?: (number | string)[];
    lastMessage?: Message | null;
    draft?: boolean | null;
    unreadMsgCount?: number | null;
    lastReadMsg?: Message | null;
}

class Chat implements IChat {
    id?: number | string | null;
    name?: string | null;
    private?: boolean;
    avatar?: string | null;
    time?: Date | null;
    participants?: (number | string)[];
    lastMessage?: Message | null;
    draft?: boolean | null;
    unreadMsgCount?: number | null;
    lastReadMsg?: Message | null;

    constructor(
        id?: number | string | null,
        name?: string | null,
        _private?: boolean,
        avatar?: string | null,
        time?: Date | null,
        participants?: (number | string)[],
        lastMessage?: Message | null,
        draft?: boolean | null,
        unreadMsgCount?: number | null,
        lastReadMsg?: Message | null) {
            this.id = id;
            this.name = name;
            this.private = _private;
            this.avatar = avatar;
            this.time = time instanceof Date ? time : time == null ? null : new Date(time); // from backend it comes often as timestamp
            this.participants = participants;
            this.lastMessage = lastMessage;
            this.draft = draft;
            this.unreadMsgCount = unreadMsgCount;
            this.lastReadMsg = lastReadMsg;
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