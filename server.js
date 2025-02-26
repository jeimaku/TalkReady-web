// const express = require("express");
// const multer = require("multer");
// const cors = require("cors");
// const axios = require("axios");
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Configure Multer for handling file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY;

// // ✅ Route to Analyze Pronunciation Using Deepgram (direct audio file upload)
// app.post("/analyze-pronunciation-deepgram", upload.single("audio"), async (req, res) => {
//   try {
//     const { file } = req;
//     if (!file) {
//       return res.status(400).json({ error: "No audio file uploaded." });
//     }

//     const audioBuffer = file.buffer;  // Buffer containing the audio file
//     const audioType = file.mimetype;  // MIME type of the audio file

//     // Send the audio file directly to Deepgram API for analysis
//     const response = await axios.post(
//       "https://api.deepgram.com/v1/analyze",
//       audioBuffer,
//       {
//         headers: {
//           Authorization: `Bearer ${DEEPGRAM_API_KEY}`,
//           "Content-Type": audioType,
//         },
//       }
//     );

//     if (response.data) {
//       const transcription = response.data.results.channels[0].alternatives[0].transcript;
//       res.json({
//         message: transcription ? 'Your pronunciation is correct!' : 'Oops! Try again.',
//         transcription: transcription || 'No transcription available.',
//       });
//     } else {
//       res.status(500).json({ error: "Failed to analyze pronunciation with Deepgram." });
//     }
//   } catch (error) {
//     console.error("❌ Deepgram Pronunciation Analysis Error:", error.response?.data || error.message);
//     res.status(500).json({ error: "Error analyzing pronunciation with Deepgram." });
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// const express = require('express');
// const { OpenAI } = require('openai');
// require('dotenv').config();
// const cors = require('cors');  // Import cors package

// const app = express();
// const port = process.env.PORT || 5000;

// // Enable CORS for all routes
// app.use(cors());

// // Initialize OpenAI API
// const openai = new OpenAI({
//   apiKey: process.env.REACT_APP_OPENAI_API_KEY,  // Use your API key from the .env file
// });

// // Route to fetch random customer inquiry
// app.get('/api/random-customer-inquiry', async (req, res) => {
//   try {
//     const response = await openai.chat.completions.create({
//       model: 'gpt-4',  // Using gpt-4 for random inquiries
//       messages: [
//         { role: 'system', content: 'You are a helpful assistant.' },
//         { role: 'user', content: 'Generate a random customer inquiry related to a delayed order in a professional tone.' },
//       ],
//       max_tokens: 60,  // Adjust the token limit as necessary
//       temperature: 0.7,  // Adjust temperature for randomness
//     });

//     const inquiry = response.choices[0].message.content.trim();
//     res.json({ inquiry });
//   } catch (error) {
//     console.error('Error generating inquiry:', error);
//     res.status(500).json({ error: 'Failed to generate customer inquiry.' });
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


