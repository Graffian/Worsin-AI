import React, { JSX, useState, useRef } from "react";
import nlp from "compromise";
import styles from "./contentPage.module.css";

export default function ContentPage(): JSX.Element {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [open, setOpen] = useState(false);
    const userMsgRef = useRef<HTMLInputElement>(null);

    function normalizeUrl(url: string): string {
        if (!url || url === "noUrl") return url;
        url = url.trim().replace(/\s+/g, "");
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        return `https://www.${url.replace(/^www\./, "")}`;
    }

    const handleSendButton = async () => {
        if (!userMsgRef.current) return;
        const inputValue = userMsgRef.current.value;
        if (!inputValue) return;

        // Add user message to chat history
        setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
        userMsgRef.current.value = "";

        // Always get the current page URL
        const currentUrl = window.location.href;

        // Build conversation context for the AI
        const convoContext = messages.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n');

        // Advanced NLP detection for 'about this page' queries
        const doc = nlp(inputValue);
        const isAboutCurrentPage =
            doc.has('#Question') && doc.has('page|site|website|webpage') ||
            doc.has('this page') ||
            doc.has('current page') ||
            doc.has('about this page') ||
            doc.has('describe this page') ||
            doc.has('summarize this page') ||
            doc.has('info about this page') ||
            doc.has('tell me about this page');
        // Fallback to regex for extra robustness
        const aboutPagePatterns = [
            /about (this|the) (page|site|website|webpage)/i,
            /what (is|can you tell me about) (this|the) (page|site|website|webpage)/i,
            /describe (this|the) (page|site|website|webpage)/i,
            /summarize (this|the) (page|site|website|webpage)/i,
            /info(?:rmation)? (on|about) (this|the) (page|site|website|webpage)/i,
            /current page/i,
            /this page/i,
            /this website/i,
            /this site/i
        ];
        const isAboutPage = isAboutCurrentPage || aboutPagePatterns.some(pattern => pattern.test(inputValue));

        let urlToScrape = null;
        if (isAboutPage) {
            urlToScrape = currentUrl;
        } else {
            // Always use the AI to resolve the URL or decide to use the current page
            const urlResolverPrompt = `${convoContext}\nUser: ${inputValue}\n\nYou are a smart URL resolver.\nGiven the conversation and the latest message, do one of the following:\n- If the latest message is about the current page, reply with exactly: CURRENT_PAGE (all caps, no quotes, no extra text).\n- If the latest message contains a link (complete or incomplete, like \"example.com\" or \"openai.com/docs\"), return the full URL starting with \"https://\".\n- If the latest message implies a well-known site (e.g., \"Wikipedia\", \"GitHub\", \"Google\"), return its official homepage as a URL.\n- If no relevant link can be found or inferred, return \"noUrl\".\n- no other this is the url provided only the link only\n\nDo not include any explanation or extra text. Only return the final resolved URL, \"CURRENT_PAGE\", or \"noUrl\". DO NOT INCLUDE ANY OTHER TEXT.`;

            const response = await fetch("http://localhost:8000/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: urlResolverPrompt })
            });

            const data = await response.json();
            const aiResponse = data?.message?.content || "";
            // Accept variations of 'CURRENT_PAGE' from the AI
            if (aiResponse.trim().toUpperCase() === "CURRENT_PAGE" || aiResponse.toLowerCase().includes("current page")) {
                urlToScrape = currentUrl;
            } else {
                const normalizedUrl = normalizeUrl(aiResponse);
                if (normalizedUrl !== "noUrl") {
                    urlToScrape = normalizedUrl;
                } else {
                    // If no URL, just reply as before
                    setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
                    console.log("AI RESPONSE", aiResponse);
                    return;
                }
            }
        }

        // Scrape the site (either current page or resolved URL)
        const scrapeData = await fetch("http://localhost:8000/scrape", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ link: urlToScrape })
        });

        const scrapeRes = await scrapeData.json();
        console.log(scrapeRes)
        const texts = scrapeRes.data.elements.map((el: any) => {
            return `[${el.tag}]` +
                (el.id ? ` id=\"${el.id}\"` : "") +
                (el.class ? ` class=\"${el.class}\"` : "") +
                (el.role ? ` role=\"${el.role}\"` : "") +
                (el.type ? ` type=\"${el.type}\"` : "") +
                (el.name ? ` name=\"${el.name}\"` : "") +
                (el.ariaLabel ? ` aria-label=\"${el.ariaLabel}\"` : "") +
                (el.placeholder ? ` placeholder=\"${el.placeholder}\"` : "") +
                (el.text ? ` text=\"${el.text.trim()}\"` : "");
        }).join("\n");

        // Now, ask the AI to answer in the context of the detailed scraped content, the URL, and the conversation
        const contextPrompt = `You are an assistant. Here is some detailed content from the page the user is asking about:\nURL: ${urlToScrape}\n\n${texts}\n\nConversation so far:\n${convoContext}\nUser: ${inputValue}\n\nPlease answer the user's question using only the information from the provided content, the page URL, and the conversation. If the answer is not present, say so.`;

        const contextResponse = await fetch("http://localhost:8000/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: contextPrompt })
        });
        const contextData = await contextResponse.json();
        const contextAiResponse = contextData?.message?.content || "";
        setMessages(prev => [...prev, { role: 'ai', content: contextAiResponse }]);
        console.log("AI RESPONSE", contextAiResponse);
    };

    return (
        <>
        {!open && (
            <button
            onClick={() => setOpen(true)}
            className={styles.floatingButton}
            aria-label="Open chatbox"
            >
            💬
            </button>
        )}

        {open && (
            <div className={styles.chatboxOverlay}>
                <header className={styles.header}>
                    <button className={styles.headerButton}>Menu</button>
                    <p className={styles.headerTxt}>Worsin AI</p>
                    <button
                    className={`${styles.headerButton} ${styles.closeButton}`}
                    onClick={() => setOpen(false)}
                    aria-label="Close chatbox"
                    >
                    ✕
                    </button>
                </header>

            <div className={styles.messageArea}>
                {messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`${styles.messageRow} ${msg.role === 'user' ? styles.messageUser : styles.messageAI}`}
                >
                    <div
                    className={`${styles.messageBubble} ${
                        msg.role === 'user' ? styles.userBubble : styles.aiBubble
                    }`}
                    >
                    {msg.content}
                    </div>
                </div>
                ))}
            </div>

            <div className={styles.inputArea}>
                <input
                ref={userMsgRef}
                type="text"
                className={styles.inputField}
                />
                <button
                onClick={handleSendButton}
                className={styles.sendButton}
                >
                Send
                </button>
            </div>
            </div>
      )}
    </>
  );
}