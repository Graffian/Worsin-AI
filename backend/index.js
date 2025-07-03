const axios = require("axios");
const express = require("express");
const cors = require("cors");

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

app.listen(8000, () => {
    console.log("Server running at http://localhost:8000");
});
