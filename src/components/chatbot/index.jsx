import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import axios from "axios";
import { db, auth } from "../../firebase/firebase";
import { onSnapshot, collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { FaMicrophone, FaRobot } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { motion } from "framer-motion";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const ASSEMBLY_AI_API_KEY = process.env.REACT_APP_ASSEMBLY_AI_API_KEY;


const predefinedPrompts = [
  "Call Center Hiring - Mock Interview",
  "Handling a Customer Complaint - Roleplay",
  "Improving Pronunciation & Fluency",
  "Technical Support - Troubleshooting a Device",
  "Sales & Upselling - Convincing a Customer",
  "Handling Difficult Customers - QA Scenario",
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
    const sendWelcomeMessage = async () => {
      const user = auth.currentUser;
      let userName = "there"; // Default value if the name is not found
  
      if (user) {
        try {
          console.log("Fetching Firestore data for UID:", user.uid); // Debugging log
  
          // Reference to Firestore user document
          const userDocRef = doc(db, "users", user.uid); 
          const userDocSnap = await getDoc(userDocRef);
  
          if (userDocSnap.exists()) {
            userName = userDocSnap.data().firstName || "there"; 
            console.log("Fetched first name from Firestore:", userName); // Debugging log
          } else {
            console.warn("User document does not exist in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
        }
      }
  
      // Get the current hour for dynamic greeting
      const currentHour = new Date().getHours();
      let greeting = "Hello";
  
      if (currentHour >= 5 && currentHour < 12) {
        greeting = "Good morning";
      } else if (currentHour >= 12 && currentHour < 18) {
        greeting = "Good afternoon";
      } else {
        greeting = "Good evening";
      }
  
      const welcomeText = `${greeting}, ${userName}! Welcome to TalkReady Bot. How can I help you practice today? 😊`;
  
      const welcomeMessage = {
        text: welcomeText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
  
      setMessages((prev) => [...prev, welcomeMessage]);
  
      // ✅ Remove emojis before voice-over
      const cleanText = welcomeText.replace(/[\u{1F600}-\u{1F64F}]/gu, ""); 
  
      // ✅ Speak the message using ResponsiveVoice
      if (window.responsiveVoice) {
        window.responsiveVoice.speak(cleanText, "UK English Female", { 
          pitch: 1.2, 
          rate: 1.0,  
          volume: 1   
        });
      } else {
        console.warn("ResponsiveVoice is not loaded.");
      }
  
      // ✅ Save to Firestore (optional)
      await addDoc(collection(db, "chats"), {
        userId: user?.uid,
        message: welcomeText,
        sender: "bot",
        timestamp: serverTimestamp(),
      });
    };
  
    sendWelcomeMessage();
  }, []); // Runs once when the chatbot page loads
  
  
  

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePromptSelection = async (prompt) => {
    setIsTyping(true);
    let systemPrompt = "";
  
    switch (prompt) {
      case "Call Center Hiring - Mock Interview":
        systemPrompt = 
          "Let's practice a **mock interview for a call center job**. " +
          "I will ask common interview questions, and you should answer professionally. " +
          "For example:\n" +
          "**Interviewer:** 'Can you walk me through your call center hiring process experience?'\n" +
          "**You:** [Your answer here]\n\n" +
          "Try responding with confidence!";
        break;
  
      case "Handling a Customer Complaint - Roleplay":
        systemPrompt = 
          "Let's practice **handling an angry customer**. " +
          "Imagine you're a call center agent, and the customer is upset about a billing issue.\n\n" +
          "**Customer:** 'I was overcharged this month! This is unacceptable!'\n" +
          "**You:** [Your response here]\n\n" +
          "Stay calm and professional while resolving the issue.";
        break;
  
      case "Improving Pronunciation & Fluency":
        systemPrompt = 
          "This exercise will **help improve your pronunciation and fluency**. " +
          "I'll give you a sentence, and you should repeat it clearly.\n\n" +
          "**Example:** 'The quick brown fox jumps over the lazy dog.'\n\n" +
          "Try saying it now, and I'll give you feedback!";
        break;
  
      case "Technical Support - Troubleshooting a Device":
        systemPrompt = 
          "A customer is facing **technical issues with their device**. " +
          "Help them troubleshoot step-by-step.\n\n" +
          "**Customer:** 'My Wi-Fi router isn’t working. What should I do?'\n" +
          "**You:** [Provide troubleshooting steps]\n\n" +
          "Be clear and patient!";
        break;
  
      case "Sales & Upselling - Convincing a Customer":
        systemPrompt = 
          "Let's practice **upselling a product**. Your goal is to **convince a customer to upgrade**.\n\n" +
          "**Customer:** 'I just want the basic plan.'\n" +
          "**You:** 'I understand! But our premium plan offers [benefits]. Would you like to hear more?'\n\n" +
          "Focus on benefits and persuasion!";
        break;
  
      case "Handling Difficult Customers - QA Scenario":
        systemPrompt = 
          "You're being evaluated on **how well you handle difficult customers**. " +
          "A QA (Quality Analyst) is listening to your call.\n\n" +
          "**Customer:** 'This is the worst service ever! I want a refund!'\n" +
          "**You:** [Your response]\n\n" +
          "Stay professional, empathetic, and follow company policies.";
        break;
  
      default:
        systemPrompt = "Choose a scenario to practice!";
    }
  
    // ✅ Display the selected prompt in chat before the bot responds
    const userMessage = {
      text: prompt,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };
  
    setMessages((prev) => [...prev, userMessage]);
  
    // ✅ Send the bot response
    await sendMessage(prompt, systemPrompt, false);
  };  
  

  const sendMessage = async (messageText, systemResponse = "", displayUserMessage = true) => {
    if (!messageText.trim()) return; // Prevent empty messages

    if (displayUserMessage) {
        const userMessage = {
            text: messageText,
            sender: "user",
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, userMessage]);
    }

    setInput(""); // Reset input

    // ✅ Show typing indicator before the bot responds
    setMessages((prev) => [...prev, { text: "💬 Chatbot is typing...", sender: "bot", typing: true }]);

    await addDoc(collection(db, "chats"), {
        userId: auth.currentUser?.uid,
        message: messageText,
        sender: "user",
        timestamp: serverTimestamp(),
    });

    // ✅ If systemResponse exists (prompt scenario), send a bot response immediately
    if (systemResponse) {
        setTimeout(() => {
            // Remove typing indicator before sending bot's actual response
            setMessages((prev) => prev.filter((msg) => !msg.typing).concat({
                text: systemResponse,
                sender: "bot",
                timestamp: new Date().toLocaleTimeString(),
            }));

            // ✅ Speak the bot response
            if (window.responsiveVoice) {
                const cleanText = systemResponse.replace(/[\p{Emoji}]/gu, "").trim(); // Remove emojis before speaking
                window.responsiveVoice.speak(cleanText, "UK English Female", { pitch: 1.2, rate: 1.0, volume: 1 });
            } else {
                console.warn("ResponsiveVoice is not loaded.");
            }

        }, 1500); // Simulated bot thinking delay
        return;
    }

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are an AI assistant helping users who are aspiring call center professionals improve call center speaking and communication skills." },
                    { role: "user", content: messageText },
                ],
                max_tokens: 500,
            },
            { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
        );

        const botMessageText = response.data.choices[0].message.content;

        if (botMessageText.trim()) {
            setTimeout(() => {
                // ✅ Remove typing indicator and add bot's response
                setMessages((prev) => prev.filter((msg) => !msg.typing).concat({
                    text: botMessageText,
                    sender: "bot",
                    timestamp: new Date().toLocaleTimeString(),
                }));

                // ✅ Speak the bot response
                if (window.responsiveVoice) {
                    const cleanText = botMessageText.replace(/[\p{Emoji}]/gu, "").trim();
                    window.responsiveVoice.speak(cleanText, "UK English Female", { pitch: 1.2, rate: 1.0, volume: 1 });
                } else {
                    console.warn("ResponsiveVoice is not loaded.");
                }

            }, 1500); // Simulated delay for natural response
        }
    } catch (error) {
        console.error("Error sending message:", error);
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

  // ✅ Remove all emojis from chatbot's text before voice-over
  const cleanText = text.replace(/[\p{Emoji}]/gu, "").trim(); 

  // ✅ Speak the cleaned message using ResponsiveVoice
  if (window.responsiveVoice) {
    window.responsiveVoice.speak(cleanText, "UK English Female", { 
      pitch: 1.2, 
      rate: 1.0,  
      volume: 1   
    });
  } else {
    console.warn("ResponsiveVoice is not loaded.");
  }

  // ✅ Save to Firestore (optional)
  await addDoc(collection(db, "chats"), {
    userId: auth.currentUser?.uid,
    message: text,  // Store original message with emojis
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
          { text: "Chatbot is analysing your audio, please wait...", sender: "bot", timestamp: new Date().toLocaleTimeString() }
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
                        // ✅ Remove "Chatbot is analyzing your audio" message
                        setMessages((prev) => prev.filter(msg => msg.text !== "Chatbot is analysing your audio, please wait..."));
                        return;
                    }

                    // ✅ Remove "Chatbot is analyzing" before sending AI response
                    setMessages((prev) => prev.filter(msg => msg.text !== "Chatbot is analysing your audio, please wait..."));

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
                } else if (result.data.status === "failed") {
                    console.error("Transcription failed:", result.data.error);
                    setMessages((prev) => prev.filter(msg => msg.text !== "Chatbot is analysing your audio, please wait..."));
                } else {
                    setTimeout(checkTranscriptionStatus, 2000);
                }
            } catch (error) {
                console.error("Error checking transcription status:", error);
                setMessages((prev) => prev.filter(msg => msg.text !== "Chatbot is analysing your audio, please wait..."));
            }
        };

        setTimeout(checkTranscriptionStatus, 2000);

    } catch (error) {
        console.error("Error sending audio for transcription:", error);
        setMessages((prev) => prev.filter(msg => msg.text !== "Chatbot is analysing your audio, please wait..."));
    }
};



return (
  <div className="flex flex-col items-center w-full h-screen bg-gray-100 pt-20 p-4">
    {/* Header with Animation */}
    <motion.div 
      initial={{ opacity: 0, y: -30 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center mb-4 text-center"
    >
      <FaRobot className="text-blue-500 text-4xl" />
      <h2 className="text-3xl font-bold text-gray-800">TalkReady Bot</h2>
      <p className="text-gray-600 text-sm mt-1">
        Practice your speaking skills with AI-powered feedback.
      </p>
    </motion.div>

    {/* Chat Messages */}
    <div className="w-full max-w-3xl flex flex-col bg-white shadow-md rounded-lg overflow-hidden flex-1 h-full">
      <div 
        className="p-4 flex-1 overflow-y-auto" 
        style={{ maxHeight: "calc(100vh - 250px)", minHeight: "400px" }} // Adjust min-height to avoid whitespace
      >
        {messages.map((msg, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, x: msg.sender === "user" ? 50 : -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex items-center mb-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {/* Bot Profile Picture (Left) */}
            {msg.sender === "bot" && (
              <motion.img 
                src="https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg"  
                alt="Bot Avatar"
                className="w-8 h-8 rounded-full mr-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Chat Bubble */}
            <motion.div 
              className={`max-w-[75%] min-w-[150px] p-3 rounded-lg shadow-md ${
                msg.sender === "user" ? "bg-blue-500 text-white text-right" : "bg-gray-200 text-gray-800 text-left"
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>

            {/* User Profile Picture (Right) */}
            {msg.sender === "user" && (
              <motion.img 
                src="https://img.freepik.com/free-psd/3d-render-businessman-wearing-glasses-suit-orange-tie-business-person-avatar-profile-picture_632498-31497.jpg"  
                alt="User Avatar"
                className="w-8 h-8 rounded-full ml-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>


    {/* Scenario Selection with Bounce Effect */}
    <motion.div 
      className="w-full max-w-3xl flex justify-center mt-3"
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.select
        onChange={(e) => handlePromptSelection(e.target.value)}
        className="p-3 bg-[#0077B3] text-white rounded-lg shadow-md cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <option value="">📋 Select a Scenario</option>
        {predefinedPrompts.map((prompt, index) => (
          <option key={index} value={prompt}>
            {prompt}
          </option>
        ))}
      </motion.select>
    </motion.div>

    {/* Input Section with Animations */}
    <motion.div 
      className="w-full max-w-3xl flex items-center gap-2 p-3 bg-white rounded-lg shadow-md mt-3"
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.button 
        onClick={() => isRecording ? stopRecording() : startRecording()} 
        className={`p-3 rounded-lg shadow-md ${isRecording ? "bg-red-500 text-white" : "bg-gray-200"}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaMicrophone size={20} />
      </motion.button>
      <motion.input 
        type="text" 
        className="flex-1 p-2 border rounded-lg" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        onKeyDown={(e) => e.key === "Enter" && sendMessage(input)} // ✅ Press Enter to send
        whileFocus={{ scale: 1.02 }}
      />
      <motion.button 
        onClick={() => sendMessage(input)} 
        className="p-3 bg-[#0077B3] text-white rounded-lg shadow-md hover:bg-blue-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiSend size={20} />
      </motion.button>
    </motion.div>
  </div>
);


};

export default Chatbot;
