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

const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY;

// ✅ Route to Analyze Pronunciation Using Deepgram (direct audio file upload)
app.post("/analyze-pronunciation-deepgram", upload.single("audio"), async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ error: "No audio file uploaded." });
    }

    const audioBuffer = file.buffer;  // Buffer containing the audio file
    const audioType = file.mimetype;  // MIME type of the audio file

    // Send the audio file directly to Deepgram API for analysis
    const response = await axios.post(
      "https://api.deepgram.com/v1/analyze",
      audioBuffer,
      {
        headers: {
          Authorization: `Bearer ${DEEPGRAM_API_KEY}`,
          "Content-Type": audioType,
        },
      }
    );

    if (response.data) {
      const transcription = response.data.results.channels[0].alternatives[0].transcript;
      res.json({
        message: transcription ? 'Your pronunciation is correct!' : 'Oops! Try again.',
        transcription: transcription || 'No transcription available.',
      });
    } else {
      res.status(500).json({ error: "Failed to analyze pronunciation with Deepgram." });
    }
  } catch (error) {
    console.error("❌ Deepgram Pronunciation Analysis Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error analyzing pronunciation with Deepgram." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
