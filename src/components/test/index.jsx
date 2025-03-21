import React, { useState, useRef } from "react";
import { db, auth } from "./../../firebase/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import axios from "axios";
import { motion } from "framer-motion";

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/dchj7fhyn/upload`;
const ASSEMBLYAI_API_KEY = "c278f48a04614fdda18826febb599a07";
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

function Test() {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState("");
    const [uploading, setUploading] = useState(false);
    const [difficulty, setDifficulty] = useState("easy");
    const [randomPhrase, setRandomPhrase] = useState("");
    const [transcription, setTranscription] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [mispronouncedWords, setMispronouncedWords] = useState([]);

    const mediaRecorderRef = useRef(null);
    const audioChunks = useRef([]);

    // 🎯 Fetch AI-generated BPO-related phrases
    const generateRandomPhrase = async () => {
        try {
            const openaiResponse = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "You are an AI specializing in BPO training. Generate a short sentence that simulates a realistic customer interaction based on the given difficulty level." },
                        { role: "user", content: `Generate a BPO-relevant sentence for a ${difficulty} level role-play scenario in a call center.` }
                    ]
                },
                {
                    headers: {
                        Authorization: `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const aiPhrase = openaiResponse.data.choices[0].message.content;
            setRandomPhrase(aiPhrase);
        } catch (error) {
            console.error("Error generating AI phrase:", error);
            setRandomPhrase("I'm sorry, I couldn't generate a phrase. Please try again.");
        }
    };

    const startRecording = async () => {
        await generateRandomPhrase();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunks.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunks.current, { type: "audio/ogg" });
            setAudioBlob(audioBlob);
            setAudioURL(URL.createObjectURL(audioBlob));
            audioChunks.current = [];
        };

        mediaRecorderRef.current.start();
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setRecording(false);
    };

    const uploadToCloudinary = async () => {
        if (!audioBlob) return alert("Please record audio first!");
        setUploading(true);

        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to upload.");
            setUploading(false);
            return;
        }
        const userId = user.uid;

        const formData = new FormData();
        formData.append("file", audioBlob);
        formData.append("upload_preset", "audio_upload");
        formData.append("resource_type", "auto");

        try {
            const response = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData });
            const data = await response.json();
            if (!data.secure_url) throw new Error("No secure URL returned");

            alert("Upload successful! Audio stored in Cloudinary.");
            setAudioURL(data.secure_url);

            const docRef = await addDoc(collection(db, "speaking_tests"), {
                audioUrl: data.secure_url,
                userId,
                phrase: randomPhrase,
                difficulty,
                timestamp: serverTimestamp(),
                feedback: "",
                transcription: ""
            });

            if (docRef.id) {
                await transcribeAudioWithAssemblyAI(data.secure_url, docRef.id);
            }

        } catch (error) {
            console.error("Upload Error:", error);
            alert("Error uploading file.");
        } finally {
            setUploading(false);
        }
    };

    const transcribeAudioWithAssemblyAI = async (audioURL, docId) => {
        try {
            const response = await axios.post("https://api.assemblyai.com/v2/transcript", {
                audio_url: audioURL
            }, {
                headers: { "Authorization": ASSEMBLYAI_API_KEY, "Content-Type": "application/json" }
            });

            if (!response.data.id) throw new Error("Failed to request transcription.");

            await checkTranscriptionStatus(response.data.id, docId);

        } catch (error) {
            console.error("Error sending audio to AssemblyAI:", error);
        }
    };

    const checkTranscriptionStatus = async (transcriptionId, docId) => {
        try {
            let status = "queued";
            while (status === "queued" || status === "processing") {
                await new Promise(res => setTimeout(res, 5000));

                const response = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptionId}`, {
                    headers: { "Authorization": ASSEMBLYAI_API_KEY }
                });

                status = response.data.status;

                if (status === "completed") {
                    setTranscription(response.data.text);
                    await updateDoc(doc(db, "speaking_tests", docId), { transcription: response.data.text });

                    await analyzeSpeechFeedback(response.data.text, randomPhrase, docId);
                    return;
                }
            }
        } catch (error) {
            console.error("Error checking transcription status:", error);
        }
    };

    const analyzeSpeechFeedback = async (userSpeech, referenceText, docId) => {
        try {
            const openaiResponse = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "You are an expert BPO team leader evaluating a voice recording based on professional customer service standards. Analyze the user's voice in the following categories: Clarity, Tone, Volume, Pace, Intonation, Confidence, Accent, Grammar, Friendliness, and Script Adherence." },
                        { role: "user", content: `Analyze the following speech:\n\nReference: "${referenceText}"\nUser Speech: "${userSpeech}"\n\nProvide detailed feedback on:\n1. **Clarity of Speech**\n2. **Tone and Warmth**\n3. **Volume and Projection**\n4. **Pace and Rhythm**\n5. **Tone Modulation and Intonation**\n6. **Confidence and Professionalism**\n7. **Accent and Neutrality**\n8. **Grammar and Fluency**\n9. **Friendliness and Approachability**\n10. **Ability to Adhere to Script/Guidelines**` }
                    ]
                },
                {
                    headers: {
                        Authorization: `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setFeedback(openaiResponse.data.choices[0].message.content);
            await updateDoc(doc(db, "speaking_tests", docId), { feedback: openaiResponse.data.choices[0].message.content });

        } catch (error) {
            console.error("Error getting feedback from OpenAI:", error);
        }
    };

    const playCorrectPronunciation = () => {
        const textToSpeak = mispronouncedWords.length > 0 ? mispronouncedWords.join(", ") : randomPhrase;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = "en-US"; 
        speechSynthesis.speak(utterance);
    };

    return (
        <motion.div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 pt-24"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
    
            {/* Two-column Layout */}
            <div className="flex w-full max-w-6xl mt-24 gap-8">
    
                {/* Left Column: Speech Recording */}
                <div className="w-1/2 bg-white p-6 rounded-lg shadow-lg h-fit">
                    <h1 className="text-3xl font-bold text-blue-600 mb-4">Test Your Speaking Skills</h1>
                    <p className="text-gray-600 mb-6">Select a difficulty level, read the phrase aloud, and record your voice.</p>
    
                    <div className="mb-4">
                        <label className="font-semibold">Choose Difficulty: </label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                            className="ml-2 border rounded px-4 py-2 bg-white shadow-md">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
    
                    {randomPhrase && (
                        <motion.div className="mb-4 p-4 bg-gray-200 rounded-lg text-lg font-medium text-blue-800">
                            <h3 className="text-lg font-semibold">Your Phrase:</h3>
                            <p>{randomPhrase}</p>
                        </motion.div>
                    )}
    
                    {!recording ? (
                        <motion.button onClick={startRecording} className="bg-green-500 text-white py-3 px-6 rounded-full hover:bg-green-600 transition duration-300 text-lg"
                            whileTap={{ scale: 0.95 }}>
                            🎤 Start Recording
                        </motion.button>
                    ) : (
                        <motion.button onClick={stopRecording} className="bg-red-500 text-white py-3 px-6 rounded-full hover:bg-red-600 transition duration-300 text-lg"
                            whileTap={{ scale: 0.95 }}>
                            🛑 Stop Recording
                        </motion.button>
                    )}
    
                    {audioURL && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold">Your Recording:</h3>
                            <audio controls className="mt-2 border rounded-lg w-full">
                                <source src={audioURL} type="audio/ogg" />
                            </audio>
                        </div>
                    )}
    
                    {audioBlob && (
                        <motion.button onClick={uploadToCloudinary} disabled={uploading} className="mt-6 bg-blue-500 text-white py-3 px-6 rounded-full hover:bg-blue-600 transition duration-300 text-lg"
                            whileTap={{ scale: 0.95 }}>
                            {uploading ? "Uploading..." : "⬆️ Upload to Cloudinary"}
                        </motion.button>
                    )}
    
                    {transcription && (
                        <motion.div className="mt-6 bg-gray-200 p-4 rounded-lg text-left"
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                            <h3 className="text-lg font-bold">Transcription:</h3>
                            <p>{transcription}</p>
                        </motion.div>
                    )}
                </div>
    
                {/* Right Column: Feedback */}
                {feedback && (
                    <div className="w-1/2 p-6 bg-gray-50 border shadow-md rounded-lg h-[500px] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-700">Feedback</h3>
    
                        {/* Scrollable Feedback */}
                        <div className="mt-2 overflow-y-auto whitespace-pre-wrap text-gray-600 leading-relaxed">
                            {feedback}
                        </div>
    
                        {/* Correct Pronunciation Button */}
                        <button onClick={playCorrectPronunciation} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 w-full">
                            🔊 Listen to Correct Pronunciation
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
    
}

export default Test;
