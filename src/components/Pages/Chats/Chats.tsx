import { useEffect, useState, useRef, forwardRef, } from "react";
import Chat from "../../../models/Chat";
import "./Chats.css"
import fetchChats from "./fetchChats";

const DIRECTION = {
    FUTURE: 1,
    PAST: 2
}

function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const ChatsList = forwardRef(({ chats }: { chats: Chat[] }, ref: any) => {
    const listItems = chats.map((chat, index) => {
        if (chats.length === index + 1) {
            return <li
                key={chat.id}
                ref={ref}
                style={{ backgroundColor: "green" }}
                className="chat-list-item"
            >
                <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="chat-list-item__image"
                />
                <p>
                    <b>{chat.name}</b>
                </p>
            </li>
        } else return <li
            key={chat.id}
            style={{ backgroundColor: "lightblue" }}
            className="chat-list-item"
        >
            <img
                src={chat.avatar}
                alt={chat.name}
                className="chat-list-item__image"
            />
            <p>
                <b>{chat.name}</b>
            </p>
        </li>
    }
    )
    return (
        <ul className="chats-list">{listItems}</ul>
    )
})

export default function Chats({ userId }: { userId: number | string }) {
    const [{ time, chatId }, setThreshold] = useState<{ time?: Date | null, chatId: number | string | null }>({ time: null, chatId: null });
    const [lastElementRef, setLastElementRef] = useState(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [counter, setCounter] = useState(0);
    // TODO: direction

    const {
        chats,
        loading,
        hasMore,
        error
    } = fetchChats(userId, time, chatId, DIRECTION.PAST);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    console.log(`ELEMENT'S INTERSECTED`);
                    setCounter(prev => prev + 1);
                }
            }
        );
    }, []); // Runs on start only

    useEffect(() => {
        console.log(`Running useEffect() with observer`);
        const observerCurrent = observerRef.current;

        if (lastElementRef) {
            observerCurrent?.observe(lastElementRef);
        }

        return () => {
            console.log(`Purging observer resources...`);
            if (lastElementRef) {
                observerCurrent?.disconnect();
            }
        };
    }, [lastElementRef]);

    return (
        <div className="chats-page">
            <div>This is a Chats page</div>
            <div>Counter: {counter}</div>
            <div> Last chat info: {chats && chats.length ? chats[chats.length - 1].toString() : null}</div>
            <ChatsList chats={chats} ref={setLastElementRef} />
        </div>
    )
}