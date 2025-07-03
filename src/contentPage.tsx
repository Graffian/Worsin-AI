import React, { JSX, useState , useRef } from "react";
import "./contentPage.css";

export default function ContentPage():JSX.Element{
    const [userMsg, setUserMsg] = useState<string>("");
    const [aiMsg, setAiMsg] = useState<string>("this is an ai message");
    const [open, setOpen] = useState(false);
    const userMsgRef = useRef <HTMLInputElement>(null)
    function normalizeUrl(url: string): string {
        if (!url || url === 'noUrl') return url;
        url = url.trim().replace(/\s+/g, ''); // Remove spaces

        // Fix common AI mistakes
        if (url.startsWith('https//')) url = url.replace('https//', 'https://');
        if (url.startsWith('http//')) url = url.replace('http//', 'http://');
        if (url.startsWith('https:///')) url = url.replace('https:///', 'https://');
        if (url.startsWith('http:///')) url = url.replace('http:///', 'http://');

        // If it already starts with http or https, return as is
        if (url.startsWith('http://') || url.startsWith('https://')) return url;

        // Otherwise, prepend https://www.
        return `https://www.${url.replace(/^www\./, '')}`;
    }
    const handleSendButton = async () => {
        if (!userMsgRef.current) return
        const inputValue = userMsgRef.current?.value;
        if (inputValue) {
            setUserMsg(inputValue);
            userMsgRef.current.value = ""; // Clear input after sending
            const userMessage = {
                message: `${inputValue}  : You are a smart URL resolver.

                                            Given the message below, do one of the following:
                                        - If the message contains a link (complete or incomplete, like "example.com" or "openai.com/docs"), return the full URL starting with "https://".
                                        - If the message implies a well-known site (e.g., "Wikipedia", "GitHub", "Google"), return its official homepage as a URL.
                                        - If no relevant link can be found or inferred, return "noUrl".

                                        Do not include any explanation or extra text. Only return the final resolved URL or "noUrl".`
            };
            const data = await fetch("http://localhost:8000/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userMessage)
            });
            const response = await data.json();
            setAiMsg(response.message.content)
            const normalizedUrl = normalizeUrl(response.message.content)
            if (normalizedUrl && normalizedUrl!=="noUrl"){
                const scrapeData = await fetch ("http://localhost:8000/scrape" , {
                    method : "POST",
                    headers:{
                        "Content-Type" : "application/json"
                    },
                    body : JSON.stringify({link:normalizedUrl})
                })
                const scrapeRes = await scrapeData.json()
                console.log(scrapeRes)
            }
            console.log("AI RESPONSE", response.message.content);
        }
    };
    return (
    <>
        {/* Floating toggle button */}
        {!open && (
            <button
                onClick={() => setOpen(true)}
                style={{zIndex: 2147483647}}
                className="fixed right-6 bottom-6 bg-blue-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl cursor-pointer hover:bg-blue-700 transition-all"
                aria-label="Open chatbox"
            >
                💬
            </button>
        )}

        {/* Chatbox overlay */}
        {open && (
            <div
                className="w-[360px] h-[420px] fixed right-6 bottom-6 bg-[#333333ee] backdrop-blur-[6px] text-white rounded-t-2xl flex flex-col shadow-2xl"
                style={{zIndex: 2147483647}}
            >
                <header className="w-full h-[40px] bg-white text-black text-[1.1rem] font-semibold flex justify-between items-center px-4 rounded-t-2xl">
                    <button className="bg-gray-700 text-white px-4 cursor-pointer rounded-full">Menu</button>
                    <p>Worsin AI</p>
                    <button
                        className="bg-gray-700 text-white px-4 cursor-pointer rounded-full"
                        onClick={() => setOpen(false)}
                        aria-label="Close chatbox"
                    >✕</button>
                </header>

                {/* Message area always fills available space and scrolls if needed */}
                <div className="py-4 px-2 flex flex-col gap-2 flex-1 overflow-y-auto">
                    <div className="flex justify-end">
                        {userMsg ? (<div className="px-4 py-2 bg-blue-300 text-black rounded-full max-w-[70%]">{userMsg}</div>) : null}
                    </div>
                    <div className="flex justify-start">
                        {aiMsg?(<div className="px-4 py-2 bg-gray-200 text-black rounded-full max-w-[70%]">{aiMsg}</div>) : null}
                    </div>
                </div>

                {/* Input bar always at the bottom */}
                <div className="w-full h-[40px] px-4 py-2 text-[1.1rem] bg-white text-black font-stretch-semi-bold flex justify-between items-center ">
                    <input ref = {userMsgRef} type="text" className="border-2 border-[#333] outline-0 rounded-full px-6 text-[1rem]"/>
                    <button onClick={handleSendButton} className="bg-gray-700 text-white px-4 cursor-pointer rounded-full">send</button>
                </div>
            </div>
        )}
    </>
    );
}