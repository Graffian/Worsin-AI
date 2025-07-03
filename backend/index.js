const axios = require("axios");
const express = require("express");
const cors = require("cors");
const {ScrapePage} = require("./scraping")
const app = express();

app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        const ollamaPayload = {
            model: "mistral",
            stream : false,
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        };

        const response = await axios.post("http://localhost:11434/api/chat", ollamaPayload);
        res.json(response.data);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});
app.post("/scrape" , async(req,res)=>{
    const {link} = await req.body
    if(!link)return res.json({error:"missing link"})
    const data = await ScrapePage(link)
    res.json({data})
})
app.listen(8000, () => {
    console.log("Server running at http://localhost:8000");
});
