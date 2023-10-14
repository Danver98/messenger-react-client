import { useEffect, useState, useRef, forwardRef, } from "react";
import Chat from "../../models/Chat";
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
            >
                <img
                    src={chat.avatar}
                    alt={chat.name}
                    width="200"
                    height="200"
                    style={{ borderRadius: "30%" }}
                />
                <p>
                    <b>{chat.name}</b>
                </p>
            </li>
        } else return <li
            key={chat.id}
            style={{ backgroundColor: "lightblue" }}
        >
            <img
                src={chat.avatar}
                alt={chat.name}
                width="200"
                height="200"
                style={{ borderRadius: "30%" }}
            />
            <p>
                <b>{chat.name}</b>
            </p>
        </li>
    }
    )
    return (
        <ul>{listItems}</ul>
    )
})

export default function Chats({ userId }: { userId: number | string }) {
    const [{ time, chatId }, setThreshold] = useState<{ time?: Date | null, chatId: number | string | null }>({ time: null, chatId: null });
    const [lastElementRef, setLastElementRef] = useState(null);
    const [counter, setCounter] = useState(0);
    // TODO: direction

    const {
        chats,
        loading,
        hasMore,
        error
    } = fetchChats(userId, time, chatId, DIRECTION.PAST);

    const observer = useRef(new IntersectionObserver(
        entries => {
            //setIntersecting(entries[0].isIntersecting);
            console.log(`Inside observer callback`);
            if (entries[0].isIntersecting) {
                console.log(`Caught intercepted element!`);
                if (chats && chats.length) {
                    console.log(`Last chat: ` + chats[chats.length - 1].toString());
                }
                setThreshold({time: null, chatId: counter});
                //setCounter((counter) => counter + 1);
            }
        },
        { threshold: 0.5 }
    ));

    useEffect(() => {
        console.log(`Running useEffect() with observer`);
        const observerCurrent = observer.current; 

        if (lastElementRef) {
            observerCurrent.observe(lastElementRef);
        }

        return () => {
            if (lastElementRef) {
                observerCurrent.unobserve(lastElementRef);
            }
        };
    }, [lastElementRef]);

    return (
        <>
            <div>This is a Chats page</div>
            <ChatsList chats={chats} ref={setLastElementRef} />
        </>
    )
}