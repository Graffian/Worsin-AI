import { JSX, useState } from "react";
import "./contentPage.css";

export default function ContentPage():JSX.Element{

    const[userMsg, setUserMsg] = useState(" this is a user message")
    const [aiMsg , setAiMsg] = useState("this is an ai message")

    
    return (
    <>
        <div className="w-[360px] max-h-[420px] fixed right-0 bottom-0 bg-[#33333399] backdrop-blur-[6px] text-white overflow-y-auto
                        rounded-t-2xl">
            <header className="sticky top-0 left-0 w-full h-[40px]
                            bg-white text-black text-[1.1rem] font-semibold 
                            flex justify-between items-center px-4">
                <button className=" bg-gray-700 text-white px-4 cursor-pointer rounded-full">Menu</button>
                <p className="">Worsin AI</p>
                <button className="bg-gray-700 text-white px-4 cursor-pointer rounded-full">User</button>
            </header>

            <div className="py-4 px-2">
                <div className="px-4 bg-blue-300 text-black rounded-full w-[50%] right-0">{userMsg}</div>
            </div>

            <div className="sticky bottom-0 left-0
                            w-full h-[40px] px-4 py-2 text-[1.1rem] 
                            bg-white text-black font-stretch-semi-bold
                            flex justify-between items-center ">
                <input type="text" className="border-2 border-[#333] outline-0 rounded-full px-6
                                              text-[1rem]"/>
                <button className="bg-gray-700 text-white px-4 cursor-pointer rounded-full">send</button>
            </div>
        </div>
    </>
    );}