const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/transcribe", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file received." });
        }

        console.log("File received:", req.file);

        // Send the audio file to OpenAI Whisper API
        const response = await axios.post(
            "https://api.openai.com/v1/audio/transcriptions",
            {
                file: req.file.buffer, // Send audio buffer
                model: "whisper-1",
                language: "en",
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        res.json({ transcription: response.data.text });
    } catch (error) {
        console.error("Transcription Error:", error);
        res.status(500).json({ error: "Failed to transcribe audio" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
