import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { db, auth } from "../../firebase/firebase";
import { onSnapshot, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaMicrophone, FaRobot } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { motion } from "framer-motion";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const ASSEMBLY_AI_API_KEY = process.env.REACT_APP_ASSEMBLY_AI_API_KEY;
const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY;


const predefinedPrompts = [
  "Practice Speaking Fluently with Real-time Feedback",
  "Simulate a Mock Call Center Interview with AI-driven Support",
  "Improve My Pronunciation with AI Suggestions",
  "Role-play a Live Customer Service Call",
];

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePromptSelection = async (prompt) => {
    setIsTyping(true);
    let systemPrompt = "";

    switch (prompt) {
      case "Practice Speaking Fluently with Real-time Feedback":
        const fluencyResponses = [
         
        ];
        systemPrompt = fluencyResponses[Math.floor(Math.random() * fluencyResponses.length)];
        break;
  
      case "Simulate a Mock Call Center Interview with AI-driven Support":
        const interviewResponses = [
         
        ];
        systemPrompt = interviewResponses[Math.floor(Math.random() * interviewResponses.length)];
        break;
  
      case "Improve My Pronunciation with AI Suggestions":
        const pronunciationResponses = [
        
        ];
        systemPrompt = pronunciationResponses[Math.floor(Math.random() * pronunciationResponses.length)];
        break;
  
      case "Role-play a Live Customer Service Call":
        const rolePlayResponses = [
         
        ];
        systemPrompt = rolePlayResponses[Math.floor(Math.random() * rolePlayResponses.length)];
        break;
  
      default:
        systemPrompt = "How can I assist you today? I'm here to help you practice and improve your skills! 💬";
        break;
    }
    

    // ✅ Send the system prompt as a message
    await sendMessage(prompt, systemPrompt, false);
};

const sendMessage = async (messageText, systemResponse = "", displayUserMessage = true) => {
  if (!messageText.trim()) return; // Prevent empty messages

  const greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"];
  const isGreeting = greetings.includes(messageText.toLowerCase());

  if (displayUserMessage) {
      const userMessage = {
          text: messageText,
          sender: "user",
          timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, userMessage]); // ✅ Only add if `displayUserMessage` is true
  }

  setInput(""); // Reset input
  if (!isTyping) setIsTyping(true); // The bot starts typing

  await addDoc(collection(db, "chats"), {
      userId: auth.currentUser?.uid,
      message: messageText,
      sender: "user",
      timestamp: serverTimestamp(),
  });

  // Handle greetings first
  if (isGreeting) {
      sendBotMessage("Hello! How can I assist you today?");
      return;
  }

  try {
      const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
              model: "gpt-4o-mini",
              messages: [
                  { role: "system", content: `You are a friendly, supportive English proficiency assistant.  
                  Always greet the user with enthusiasm and help them practice their English skills in a positive and encouraging way.  
                  For call center scenarios, use real-world language that aligns with customer service interactions.  
                  Provide feedback in a friendly, actionable manner and motivate users to continue practicing.
                  Always encourage questions and interaction by asking the user to try again or clarify anything they're unsure about.
                  Example: "Great job! Want to try another scenario?" 
                  Tailor your responses to be clear and empathetic, guiding users to success.` },
                  { role: "user", content: messageText },
              ],
              max_tokens: 500,
          },
          { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
      );

      const botMessageText = response.data.choices[0].message.content;
      if (botMessageText.trim()) sendBotMessage(botMessageText);
  } catch (error) {
      console.error("Error sending message:", error);
  } finally {
      setIsTyping(false); // Ensure the bot stops typing after the response is sent
  }
};


// Send the bot's message to the chat
const sendBotMessage = async (text) => {
  const botMessage = {
    text,
    sender: "bot",
    timestamp: new Date().toLocaleTimeString(),
  };

  setMessages((prev) => [...prev, botMessage]);

  await addDoc(collection(db, "chats"), {
    userId: auth.currentUser?.uid,
    message: text,
    sender: "bot",
    timestamp: serverTimestamp(),
  });
};


  // ------------------------ SPEECH RECORDING ------------------------

  const startRecording = async () => {
    try {
        setIsRecording(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunks.current = []; // ✅ Reset before starting

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.current.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = async () => {
            if (audioChunks.current.length === 0) {
                console.warn("No audio data recorded.");
                setIsRecording(false);
                return;
            }

            const blob = new Blob(audioChunks.current, { type: "audio/wav" });
            setAudioBlob(blob);
            setAudioUrl(URL.createObjectURL(blob));

            // Start the upload and transcription process without sending a placeholder message first
            console.log("Audio recorded successfully.");
            await uploadAudioToCloudinary(blob); // Pass the blob explicitly
        };

        mediaRecorderRef.current.start();
    } catch (error) {
        console.error("Error accessing microphone:", error);
        setIsRecording(false);
    }
};


// 🔹 Modify `uploadAudioToCloudinary` to call `transcribeAudio` after upload
const uploadAudioToCloudinary = async (blob) => {
  if (!blob || blob.size === 0) {
      console.warn("No valid audio recorded. Skipping upload.");
      return;
  }

  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
      // ✅ First, display the user's audio message before transcription starts
      const tempAudioUrl = URL.createObjectURL(blob);
      setMessages((prev) => [
          ...prev,
          {
              sender: "user",
              timestamp: new Date().toLocaleTimeString(),
              audioUrl: tempAudioUrl, // Show recorded audio immediately
          }
      ]);

      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
      const audioUrl = response.data.secure_url;
      console.log("Audio uploaded to Cloudinary:", audioUrl);

      // ✅ Now, add "Analyzing audio" message AFTER upload completes
      setMessages((prev) => [
          ...prev,
          { text: "Chatbot is analyzing your audio, please wait...", sender: "bot", timestamp: new Date().toLocaleTimeString() }
      ]);

      // ✅ Start the transcription after upload
      await transcribeAudio(audioUrl);

  } catch (error) {
      console.error("Error uploading audio:", error);
  }
};




  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) {
      alert("No audio recorded");
      return;
    }

    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
      alert("Audio uploaded successfully: " + response.data.secure_url);
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };



  const transcribeAudio = async (audioUrl) => {
    if (!audioUrl) {
        console.warn("No valid audio URL for transcription.");
        return;
    }

    try {
        const response = await axios.post(
            "https://api.assemblyai.com/v2/transcript",
            {
                audio_url: audioUrl,
                speaker_labels: false,
                dual_channel: false,
                format_text: true
            },
            { headers: { Authorization: ASSEMBLY_AI_API_KEY } }
        );

        const transcriptionId = response.data.id;
        console.log("Transcription started. ID:", transcriptionId);

        const checkTranscriptionStatus = async () => {
            try {
                const result = await axios.get(
                    `https://api.assemblyai.com/v2/transcript/${transcriptionId}`,
                    { headers: { Authorization: ASSEMBLY_AI_API_KEY } }
                );

                if (result.data.status === "completed") {
                    console.log("Transcription completed:", result.data.text);

                    if (!result.data.text || result.data.text.trim() === "") {
                        console.warn("Empty transcription received. Skipping AI response.");
                        return;
                    }

                    // ✅ Send transcribed text to OpenAI for response
                    sendMessage(result.data.text, "", false); 

                    // ✅ Store only audio URL in Firestore (not transcription)
                    await addDoc(collection(db, "chats"), {
                        userId: auth.currentUser?.uid,
                        sender: "user",
                        audioUrl: audioUrl,
                        timestamp: serverTimestamp(),
                    });

                    console.log("Audio URL stored in Firestore.");

                    // ✅ Remove "Analyzing audio" message when transcription is done
                    setMessages((prev) => prev.filter(msg => msg.text !== "Chatbot is analyzing your audio, please wait..."));
                } else if (result.data.status === "failed") {
                    console.error("Transcription failed:", result.data.error);
                } else {
                    setTimeout(checkTranscriptionStatus, 2000);
                }
            } catch (error) {
                console.error("Error checking transcription status:", error);
            }
        };

        setTimeout(checkTranscriptionStatus, 2000);

    } catch (error) {
        console.error("Error sending audio for transcription:", error);
    }
};




return (
      <div className="flex flex-col items-center w-full h-screen bg-gray-100 pt-20 p-4">
        <div className="flex flex-col items-center mb-4 text-center">
          <FaRobot className="text-blue-500 text-4xl" />
          <h2 className="text-3xl font-bold text-gray-800">TalkReady Bot</h2>
          <p className="text-gray-600 text-sm mt-1">
            Practice your speaking skills with AI-powered feedback.
          </p>
        </div>

        <div className="w-full max-w-3xl flex flex-col bg-white shadow-md rounded-lg overflow-hidden flex-1">
          <div className="p-4 overflow-y-auto flex-1" style={{ maxHeight: "500px" }}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.sender === "user" ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-2`}
              >
                <div className={`max-w-[75%] min-w-[150px] p-3 rounded-lg shadow-md ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
                  {msg.audioUrl ? (
                    <div>
                      <audio controls>
                        <source src={msg.audioUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>


        <div className="w-full max-w-3xl flex flex-wrap justify-center gap-2 mt-3">
          {predefinedPrompts.map((prompt, index) => (
            <motion.button
              key={index}
              onClick={() => handlePromptSelection(prompt)}
              className="p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition text-sm"
            >
              {prompt}
            </motion.button>
          ))}
        </div>

        <div className="w-full max-w-3xl flex items-center gap-2 p-3 bg-white rounded-lg shadow-md mt-3">
        <motion.button 
        onClick={() => isRecording ? stopRecording() : startRecording()} 
        className={`p-3 rounded-lg shadow-md ${isRecording ? "bg-red-500 text-white" : "bg-gray-200"}`}
    >
        <FaMicrophone size={20} />
    </motion.button>
      <input type="text" className="flex-1 p-2 border rounded-lg" value={input} onChange={(e) => setInput(e.target.value)} />
      <motion.button onClick={() => sendMessage(input)} className="p-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
        <FiSend size={20} />
      </motion.button>
    </div>
  </div>
);
};

export default Chatbot;
