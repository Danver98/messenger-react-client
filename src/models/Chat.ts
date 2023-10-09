import User from "./User";
import Message from "./Message";

interface Chat {
    id: number | string;
    name: string;
    isPrivate?: boolean;
    avatar?: string;
    participants?: User[];
    messages?: Message[];
}

class Chat implements Chat {
    id: number | string;
    name: string;
    isPrivate?: boolean;
    avatar?:string;
    participants?: User[];
    messages?: Message[];

    constructor(id: number | string, name: string, isPrivate?: boolean, avatar?: string,
        participants?: User[], messages?: Message[]) {
            this.id = id;
            this.name = name;
            this.isPrivate = isPrivate;
            this.avatar = avatar
            this.participants = participants;
            this.messages = messages;
    }
}

export default Chat;