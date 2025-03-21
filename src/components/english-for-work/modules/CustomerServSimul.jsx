import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop } from 'react-icons/fa'; // FontAwesome Icons
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db, auth } from '../../../firebase/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Main Customer Service Simulation Component
const CustomerServiceSimul = () => {
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [userResponse, setUserResponse] = useState("");
  const [setCustomerSpeech] = useState("");
  const [responseFeedback, setResponseFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [setAudioURL] = useState(""); // Store the audio URL from Cloudinary
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(null);
  const [showBackModal, setShowBackModal] = useState(false); // Modal state
  const [conversation, setConversation] = useState([]); 

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const [callDuration, setCallDuration] = useState(180); // Call duration in seconds (3 minutes)
  const [isCallActive, setIsCallActive] = useState(false); // Tracks if call is active

  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  const [selectedAccent, setSelectedAccent] = useState("en-US");
  const [selectedInquiry, setSelectedInquiry] = useState("General Inquiry");

  const mediaRecorderRef = useRef(null);  // Store MediaRecorder instance
  const audioChunks = useRef([]);  // Store recorded audio chunks
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  
  

  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`;
  const ASSEMBLY_AI_API_KEY = process.env.REACT_APP_ASSEMBLY_AI_API_KEY;


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Initialize Speech Recognition
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (conversation.length === 0) return;

    const lastMessage = conversation[conversation.length - 1];

    if (lastMessage.sender === "customer" && !isSpeaking) {
        speakText(lastMessage.text);
    }
}, [conversation]);  // Only run when conversation updates



// Timer Effect: Counts down every second
useEffect(() => {
  if (isCallStarted && callDuration > 0) {
      const timer = setInterval(() => {
          setCallDuration(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer); // Cleanup on unmount
  }

  if (callDuration === 0) {
      endCall(); // Automatically end call when timer reaches zero
  }
}, [callDuration, isCallStarted]);


useEffect(() => {
  if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionAPI();

      recognitionInstance.continuous = true;  // Keeps listening without stopping automatically
      recognitionInstance.lang = "en-US";
      recognitionInstance.interimResults = false;

      recognitionInstance.onstart = () => {
          console.log("Speech recognition started");
          setIsRecording(true);
      };

      recognitionInstance.onresult = (event) => {
          let speechText = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
              speechText += event.results[i][0].transcript;
          }
          console.log("Final recognized text:", speechText);

          // Prevent duplicate messages
          if (userResponse !== speechText) {
              setUserResponse(speechText);
          }
      };

      recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error:", event);
          setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        console.log("Speech recognition ended");
    
        if (isRecording) {
            console.log("Restarting speech recognition...");
        }
    };
    

      setRecognition(recognitionInstance);
  } else {
      alert("Your browser does not support speech recognition.");
  }
}, []);


  // **PROCESS AUDIO AFTER USER RESPONSE UPDATES**
  useEffect(() => {
    if (userResponse.trim() !== "") {
        console.log("User response updated:", userResponse);
        
        setConversation(prev => {
            if (prev.some(msg => msg.sender === "user" && msg.text === userResponse)) {
                return prev;
            }

            const updatedConversation = [
                ...prev,
                { sender: "user", text: userResponse }
            ];

            saveMessageToFirestore("user", userResponse); // Save user message
            setIsRecording(false); // Immediately remove "Recording..." when response is processed
            setTimeout(() => processAudio(userResponse), 500); 

            return updatedConversation;
        });

        setUserResponse(""); 
    }
}, [userResponse]);

  // Generate customer speech using OpenAI API
  const generateCustomerSpeech = async () => {
    try {
        let inquiryPrompt = "";

        switch (selectedInquiry) {
            case "Billing Issue":
                inquiryPrompt = "You are a customer calling about a billing issue. Your last payment did not reflect on your account, and you are worried about possible service disconnection.";
                break;
            case "Technical Support":
                inquiryPrompt = "You are a customer experiencing technical issues. Your internet has been slow for the past three days, and rebooting the router did not help.";
                break;
            case "Product Inquiry":
                inquiryPrompt = "You are a customer calling to ask about a specific product. You want to know if the new smartphone model supports wireless charging and has a high refresh rate display.";
                break;
            case "General Inquiry":
            default:
                inquiryPrompt = "You are a customer calling a company with a general inquiry. You would like to ask about their refund policy for recently purchased items.";
                break;
        }

        // ** Prevent AI from using placeholders **
        const prompt = `You are a customer calling a company for support. Your response should be natural, professional, and should **not include placeholders** like "[Your Name]" or "[Company Name]".
        Instead, use a **random realistic first name** and refer to "your company" instead of a placeholder. Keep the response concise.`;    

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a realistic and professional customer engaged in a customer service conversation. Make your speech natural and clear." },
                    { role: "user", content: prompt },
                    { role: "user", content: inquiryPrompt },
                ],
                max_tokens: 150,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        let generatedSpeech = response.data.choices[0].message.content.trim();

        // ** Ensure any lingering placeholders are removed **
        generatedSpeech = generatedSpeech.replace(/\[Your Name\]/g, "Alex") // Replace with a generic name
                                         .replace(/\[Company Name\]/g, "your company") // Generic placeholder fix
                                         .trim();

        console.log("📞 AI-generated customer speech:", generatedSpeech);

        // ✅ Store AI-generated response in conversation
        saveMessageToFirestore("customer", generatedSpeech);
        speakText(generatedSpeech);

    } catch (error) {
        console.error("❌ Error generating customer speech:", error);
        setConversation([{ sender: "customer", text: "Sorry, we encountered an error generating the inquiry." }]);
    }
};

  
  
const generateCustomerFollowUp = async (userResponse) => {
  try {
      console.log("Generating follow-up based on user response:", userResponse);
      setIsGeneratingResponse(true); // Show AI is generating response

      const prompt = `You are a customer speaking to a service agent regarding a "${selectedInquiry}". 
      The agent just responded: "${userResponse}". 
      Continue the conversation naturally and professionally. Avoid repeating the same statements. 
      Do not use "Customer:" as a prefix or quotation marks. Keep it concise and realistic.`;

      const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
              model: "gpt-3.5-turbo",
              messages: [
                  { role: "system", content: "You are a customer engaged in a conversation with a service agent. Your responses should be natural, professional, and fluid in a call center scenario." },
                  { role: "user", content: prompt },
              ],
              max_tokens: 150,
              temperature: 0.7,
          },
          {
              headers: {
                  Authorization: `Bearer ${OPENAI_API_KEY}`,
                  "Content-Type": "application/json",
              },
          }
      );

      let generatedFollowUp = response.data.choices[0].message.content.trim();

      // ✅ Clean unnecessary prefixes and quotes
      generatedFollowUp = generatedFollowUp.replace(/^Customer:/i, "").replace(/"/g, "").trim();

      console.log("🔄 AI Follow-Up:", generatedFollowUp);

      if (generatedFollowUp) {
        setTimeout(() => {
            saveMessageToFirestore("customer", generatedFollowUp);
            speakText(generatedFollowUp);
            setIsWaitingForResponse(true);
            setIsGeneratingResponse(false);
                }, 1000);
            } else {
                console.warn("⚠️ Empty follow-up generated.");
                setIsGeneratingResponse(false);
            }
          } catch (error) {
              console.error('Error generating customer follow-up:', error);
              setIsGeneratingResponse(false);
          }
      };

  // Process Audio After User Response
  const processAudio = async () => {
    try {
      if (!userResponse.trim()) {
        console.warn("User response is empty, skipping AI follow-up.");
        return;
      }
      console.log("Processing user response:", userResponse);
      setTimeout(async () => {
        await generateCustomerFollowUp(userResponse);
        setIsWaitingForResponse(false); // UI updates AFTER AI responds
    }, 1000); // Delay AI response by 1 second for natural flow
    
    } catch (error) {
      console.error("Error processing audio:", error);
    }
    setIsRecording(false); // Ensure UI updates immediately when AI response is shown

  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) {
        console.warn("⚠️ No media recorder found!");
        return;
    }

    console.log("🛑 Stopping recording...");
    setIsRecording(false);

    // ✅ Immediately remove "Transcribing audio, please wait..." from the conversation
    setConversation((prev) => prev.filter(msg => msg.text !== "Transcribing audio, please wait..."));

    mediaRecorderRef.current.onstop = async () => {
        console.log("✅ Recorder stopped, processing audio...");

        if (audioChunks.current.length === 0) {
            console.error("❌ No audio data recorded.");
            return;
        }

        const blob = new Blob(audioChunks.current, { type: "audio/wav" });

        if (blob.size === 0) {
            console.error("❌ Empty audio blob detected, skipping upload.");
            return;
        }

        console.log("🔍 Audio Blob Size:", blob.size, "bytes");
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        // ✅ Upload recorded audio
        await uploadAudioToCloudinary(blob);
    };

    mediaRecorderRef.current.stop();
};





  // Speak Text using Web Speech API
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Track last spoken message
  const [lastSpokenText, setLastSpokenText] = useState("");

const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
        console.error("Text-to-Speech not supported in this browser.");
        return;
    }

    // ✅ Prevent speaking the same message again
    if (text === lastSpokenText) {
        console.warn("⚠️ Skipping duplicate speech: Already spoken");
        return;
    }

    console.log("🗣️ Speaking new message:", text);
    setLastSpokenText(text); // ✅ Update last spoken message

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onend = () => {
        console.log("Speech synthesis completed.");
    };

    utterance.onerror = (err) => {
        console.error("Speech synthesis error:", err.error, err.message);
    };

    speechSynthesis.speak(utterance);
};

  
  
  // Start Call
  const [sessionId, setSessionId] = useState(null); // Store session ID

  const startCall = async () => {
      resetSimulation();
      setIsCallStarted(true);
      setIsCallActive(true);
      setCallDuration(180);  
  
      try {
          // Create a new conversation session in Firestore
          const sessionRef = await addDoc(collection(db, "customer_service_simulations"), {
              inquiryType: selectedInquiry,
              startTime: serverTimestamp(),
              endTime: null
          });
  
          setSessionId(sessionRef.id); // Store session ID in state
          console.log("✅ New session created in Firestore:", sessionRef.id);
  
          generateCustomerSpeech();
          setIsWaitingForResponse(true);
      } catch (error) {
          console.error("❌ Error creating session in Firestore:", error);
      }
  };
  

  const endCall = async () => {
    setIsCallStarted(false);
    setIsCallActive(false);
    alert("📞 Call has ended.");

    let sessionRef;
    let currentSessionId = sessionId;

    try {
        if (!sessionId) {
            // ✅ Create a new Firestore session document
            sessionRef = await addDoc(collection(db, "customer_service_simulations"), {
                inquiryType: selectedInquiry,
                startTime: serverTimestamp(),
                endTime: serverTimestamp(),
                conversation: conversation
            });

            currentSessionId = sessionRef.id;
            setSessionId(currentSessionId);
            console.log("✅ New session stored in Firestore:", currentSessionId);
        } else {
            // ✅ Update existing Firestore session
            await setDoc(doc(db, "customer_service_simulations", sessionId), {
                endTime: serverTimestamp(),
                conversation: conversation
            }, { merge: true });

            console.log("✅ Existing conversation updated in Firestore.");
        }

        // ✅ Extract user responses for vocabulary analysis
        const userResponses = conversation
            .filter(msg => msg.sender === "user")
            .map(msg => msg.text)
            .join(" ");

        if (userResponses.trim()) {
            console.log("📖 Processing transcription-based vocabulary analysis...");

            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "Analyze the vocabulary level of this response based on word variety, complexity, and appropriateness for a professional call center setting. Provide constructive feedback." },
                        { role: "user", content: userResponses },
                    ],
                    max_tokens: 200,
                    temperature: 0.5,
                },
                {
                    headers: {
                        Authorization: `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const feedback = response.data.choices[0].message.content.trim();
            console.log("✅ Vocabulary Analysis Result:", feedback);

            // ✅ Store analysis in Firestore in the correct collection
            await addDoc(collection(db, "customer_serv_vocabulary_analysis"), {
                sessionId: currentSessionId,
                userId: auth?.currentUser?.uid || "anonymous",
                analysis: feedback,
                timestamp: serverTimestamp(),
            });

            console.log("✅ Vocabulary analysis saved.");
        } else {
            console.log("⚠️ No user responses found, skipping vocabulary analysis.");
        }

        // ✅ Ensure that navigation happens AFTER Firestore write is complete
        setTimeout(() => {
            navigate(`/english-for-work/analysis/FeedbackAnalysis/${currentSessionId}`);
        }, 1000); // Short delay to allow Firestore write

    } catch (error) {
        console.error("❌ Error in endCall process:", error);
    }

    resetSimulation(); // Clear conversation state after storing
};


const analyzeVocabulary = async (transcriptionText) => {
  try {
      const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
              model: "gpt-3.5-turbo",
              messages: [
                  { role: "system", content: "Analyze the vocabulary level of this response based on word variety, complexity, and appropriateness for a professional call center setting." },
                  { role: "user", content: transcriptionText },
              ],
              max_tokens: 200,
              temperature: 0.5,
          },
          {
              headers: {
                  Authorization: `Bearer ${OPENAI_API_KEY}`,
                  "Content-Type": "application/json",
              },
          }
      );

      const feedback = response.data.choices[0].message.content.trim();
      console.log("✅ Vocabulary Analysis:", feedback);

      // Save feedback to Firestore
      await addDoc(collection(db, "customer_serv_vocabulary_analysis"), {
          sessionId: sessionId, // Link to conversation session
          userId: auth?.currentUser?.uid || "anonymous",
          analysis: feedback,
          timestamp: serverTimestamp(),
      });
      console.log("✅ Vocabulary analysis saved in Firestore.");


  } catch (error) {
      console.error("❌ Error in vocabulary analysis:", error);
  }
};




  const handleRetry = () => {
    setConversation(prev => {
        // Remove the last two messages (user + AI response)
        if (prev.length >= 2) {
            return prev.slice(0, -2);
        }
        return prev;
    });

    setResponseFeedback("");  // Reset feedback
    setUserResponse("");  // Clear user input
    setIsWaitingForResponse(true);  // Allow user to record again
};


  // Function to handle back navigation (Show confirmation modal)
  const handleBack = () => {
    console.log("Back button clicked, stopping speech synthesis...");
    window.speechSynthesis.cancel(); // Stops any ongoing speech immediately

    if (isCallStarted) {
        setShowBackModal(true); // Show confirmation modal
    } else {
        resetSimulation();  // Reset state before navigating
        navigate("/english-for-work");
    }
};


  const resetSimulation = () => {
    setConversation([]);  // 🔥 Clears previous inquiries/messages
    setUserResponse("");  // Clears user input
    setResponseFeedback(""); // Clears AI feedback
    setPerformanceScore(null);  // Resets any scoring
    setIsRecording(false); // Ensures recording is stopped
    setIsWaitingForResponse(false); // Reset button visibility
};


  // Function to confirm going back
  const confirmBack = () => {
    console.log("Confirming exit, stopping speech synthesis...");
    window.speechSynthesis.cancel(); // Ensure speech stops when exiting
    setIsCallStarted(false);
    setShowBackModal(false);
    navigate("/english-for-work/modules/CustomerServSimul"); // Redirect user
};


  // Function to cancel going back
  const cancelBack = () => {
    setShowBackModal(false);
  };
  
  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!stream) {
            console.error("❌ No audio stream available!");
            return;
        }

        console.log("✅ Audio stream obtained.");
        
        mediaRecorderRef.current = new MediaRecorder(stream);  // Use ref instead of state
        audioChunks.current = [];  // Reset audio chunks before starting

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.current.push(event.data);
                console.log("🎙️ Audio chunk received, size:", event.data.size);
            }
        };

        mediaRecorderRef.current.onstart = () => {
            console.log("🎤 Recording started...");
            setIsRecording(true);
        };

        mediaRecorderRef.current.onerror = (error) => console.error("❌ MediaRecorder error:", error);

        mediaRecorderRef.current.start();
    } catch (error) {
        console.error("❌ Error starting audio recording:", error);
    }
};



const uploadAudioToCloudinary = async (blob) => {
  if (!blob || blob.size === 0) {
      console.warn("❌ No valid audio recorded. Skipping upload.");
      return;
  }

  console.log("🔍 Uploading Audio Blob Size:", blob.size, "bytes");

  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
  formData.append("resource_type", "video");  // ✅ Cloudinary treats audio as video

  try {
      // ✅ Ensure "Transcribing audio" is not displayed multiple times
      setConversation((prev) => prev.filter(msg => msg.text !== "Transcribing audio, please wait..."));

      // ✅ Show temporary local audio playback before upload completes
      const tempAudioUrl = URL.createObjectURL(blob);
      setAudioUrl(tempAudioUrl);

      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
      const audioUrl = response.data.secure_url;
      console.log("✅ Audio uploaded to Cloudinary:", audioUrl);
      setAudioUrl(audioUrl); // Update state with uploaded URL

      // ✅ Save audio URL to Firestore
      const userId = auth?.currentUser?.uid || "anonymous";
      await addDoc(collection(db, "customer_service_simulations"), {
          userId: userId,
          audioUrl: audioUrl,
          sender: "user",
          timestamp: serverTimestamp(),
      });

      console.log("✅ Audio URL stored in Firestore.");

      // ✅ Remove "Transcribing audio, please wait..." before transcription
      setConversation((prev) => prev.filter(msg => msg.text !== "Transcribing audio, please wait..."));

      // ✅ Start transcription process
      await transcribeAudio(audioUrl);

  } catch (error) {
      console.error("❌ Error uploading audio:", error);
  }
};


const transcribeAudio = async (audioUrl) => {
  if (!audioUrl) {
      console.warn("❌ No valid audio URL for transcription.");
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
      console.log("📝 Transcription started. ID:", transcriptionId);

      checkTranscriptionStatus(transcriptionId); // ✅ Start polling for completion

  } catch (error) {
      console.error("❌ Error sending audio for transcription:", error);
      setConversation((prev) => prev.filter(msg => msg.text !== "Transcribing audio, please wait..."));
  }
};

const checkTranscriptionStatus = async (transcriptionId, audioUrl) => {
  try {
      const result = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptionId}`,
          { headers: { Authorization: ASSEMBLY_AI_API_KEY } }
      );

      if (result.data.status === "completed") {
          console.log("✅ Transcription completed:", result.data.text);

          if (!result.data.text.trim()) {
              console.warn("⚠️ Empty transcription received. Skipping AI response.");
              return;
          }

          // ✅ Store transcribed text in conversation
          saveMessageToFirestore("user", result.data.text, audioUrl);

          // ✅ Generate AI follow-up after transcription
          generateCustomerFollowUp(result.data.text);

      } else if (result.data.status === "failed") {
          console.error("❌ Transcription failed:", result.data.error);
      } else {
          setTimeout(() => checkTranscriptionStatus(transcriptionId, audioUrl), 2000); // Poll every 2 seconds
      }
  } catch (error) {
      console.error("❌ Error checking transcription status:", error);
  }
};




const saveMessageToFirestore = async (sender, text, audioUrl = null) => {
  // ✅ Update conversation state with a new message
  setConversation(prev => [
      ...prev,
      {
          sender: sender,
          text: text || "(No text provided)",
          audioUrl: audioUrl || null, // Optional Cloudinary audio URL
          timestamp: new Date().toISOString() // Store readable timestamps
      }
  ]);

  console.log(`✅ Message from ${sender} added to conversation.`);
};


  return (
    <motion.div 
      className="min-h-screen bg-gray-100 flex justify-center items-center relative"
      initial={{ opacity: 0, scale: 0.95 }}  // Animation starts with lower opacity & smaller scale
      animate={{ opacity: 1, scale: 1 }}  // Ends with full opacity & normal scale
      transition={{ duration: 0.5 }}  // Smooth transition
      >
      
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={handleBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300"
        >
          ← Back
        </button>
      </div>


      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 md:w-2/3 lg:w-1/2 flex flex-col items-center justify-center">
        {/* Customer Profile Column */}
        <div className="flex flex-col items-center mb-6 md:mb-0 md:w-1/3">
          <img
            src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2JlcnhqZG81a2Z1ZWs2Zml6aHZkc2ZpcnBzcXh2bTB4Z2gybDI1bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/U3DcUscGKLEkzekLdb/giphy.gif"
            alt="Customer"
            className="w-32 h-32 rounded-full mb-6 transition-transform transform hover:scale-110 duration-300"
          />
          <h2 className="text-3xl font-semibold text-blue-600">Samantha Lee</h2>
          <p className="text-base text-gray-500">Potential Client</p>
        </div>
  
        {/* User Response Column */}
        <div className="md:w-2/3 flex flex-col space-y-6">
          <h1 className="text-3xl font-semibold text-center mb-6">Customer Service Simulation</h1>

           {/* Display Timer & End Call Button */}
      {isCallStarted && (
        <div className="flex justify-between w-full mt-4 px-6">
          <p className="text-lg text-gray-600">
            Time Remaining: <strong>{Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}</strong>
          </p>
          <button
            onClick={endCall}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
          >
            End Call
          </button>
        </div>
      )}
  
          {/* Accent & Inquiry Selection Before Start */}
        {!isCallStarted && (
          <div className="mb-6 bg-blue-100 p-6 rounded-lg">
            <p className="text-xl text-gray-700 font-semibold">Instructions:</p>
            <p className="text-base text-gray-600">
              1. Select an **accent** and **customer inquiry type**.<br />
              2. Greet the customer politely and introduce yourself.<br />
              3. Listen to the customer's concern and address it with empathy.<br />
              4. Provide a professional response to the customer’s query.<br />
              5. Receive feedback on your response and improve your interactions.<br />
            </p>

            {/* Accent Selection Dropdown */}
            <div className="mt-4">
              <label className="text-lg font-semibold">Select AI Accent:</label>
              <select
                className="p-2 border rounded-lg w-full"
                value={selectedAccent}
                onChange={(e) => setSelectedAccent(e.target.value)}
              >
                <option value="en-US">American</option>
                <option value="en-GB">British</option>
                <option value="en-AU">Australian</option>
              </select>
            </div>

            {/* Inquiry Selection Dropdown */}
            <div className="mt-4">
              <label className="text-lg font-semibold">Select Customer Inquiry Type:</label>
              <select
                className="p-2 border rounded-lg w-full"
                value={selectedInquiry}
                onChange={(e) => setSelectedInquiry(e.target.value)}
              >
                <option value="Billing Issue">Billing Issue</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Product Inquiry">Product Inquiry</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>
          </div>
        )}
  
          {!isCallStarted ? (
            <div className="mb-6 text-center">
              <motion.button
                 whileHover={{ scale: 1.1 }} 
                 whileTap={{ scale: 0.9 }} 
                 onClick={startCall}
                className="w-full p-4 bg-blue-500 text-white text-xl rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Start Call Simulation
              </motion.button>
            </div>
          ) : (
            <>
            <div ref={messagesEndRef} />
            
            <div className="w-full h-[450px] overflow-y-auto overflow-x-hidden px-3 pb-3 bg-white rounded-lg shadow-lg">
              {conversation.map((msg, index) => (
                <motion.div 
                  key={index} className={`mb-6 flex ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                  initial={{ opacity: 0, x: msg.sender === "user" ? 50 : -50 }}  
                  animate={{ opacity: 1, x: 0 }}  
                  transition={{ duration: 0.3 }}
                  >
                  <div className={`w-12 h-12 rounded-full ${msg.sender === "user" ? "bg-green-400" : "bg-gray-400"} flex items-center justify-center text-white ml-4 mr-4`}>
                    <span className="text-xl">{msg.sender === "user" ? "M" : "S"}</span>
                  </div>
                  <div className={`p-4 rounded-lg max-w-[65%] shadow-lg ${msg.sender === "user" ? "bg-green-100" : "bg-blue-100"}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </motion.div>
              ))}

            {isGeneratingResponse && (
                <motion.div 
                className="flex items-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                >
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white ml-4 mr-4">
                        <span className="text-xl">S</span> {/* Customer avatar placeholder */}
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg max-w-[70%] shadow-lg">
                        <p className="text-gray-500 italic">Customer is typing...</p>
                    </div>
                </motion.div>
            )}

            </div>

              {/* User's Message in a Chat Bubble */}
              {userResponse && (
                <div className="mb-6 flex items-start flex-row-reverse">
                  <div className="w-12 h-12 rounded-full bg-green-400 flex items-center justify-center text-white ml-4 mr-4">
                    <span className="text-xl">M</span>
                  </div>
                  <div className="bg-green-100 p-6 rounded-lg max-w-[70%] shadow-lg">
                    <p className="text-lg">{userResponse}</p>
                  </div>
                </div>
              )}
  
              {/* Speech Recording and Retry Buttons */}
              {isWaitingForResponse && (
                <div className="mb-6 flex justify-between items-center space-x-16">
                  <button
                    onClick={startRecording}  // ✅ Calls the function with safety checks
                    className="w-1/4 p-3 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center"
                  >
                    <FaMicrophone size={24} />
                  </button>
                  <button
                    onClick={stopRecording}
                    className="w-1/4 p-3 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center"
                  >
                    <FaStop size={24} />
                  </button>
                  <button
                    onClick={handleRetry}
                    className="w-1/4 p-3 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-all duration-300 flex items-center justify-center"
                  >
                    Retry Response
                  </button>
                </div>
              )}
  
              {isRecording && <p className="text-red-500 text-lg">Recording...</p>}
  
              {/* Response Feedback */}
              {responseFeedback && (
                <div className="mt-6 p-6 bg-green-100 rounded-lg text-green-700 shadow-lg">
                  <p><strong className="text-lg">Feedback:</strong></p>
                  <p><strong>Grammar:</strong> {responseFeedback.grammar}</p>
                  <p><strong>Vocabulary:</strong> {responseFeedback.vocabulary}</p>
                  <p><strong>Tone:</strong> {responseFeedback.tone}</p>
                </div>
              )}
  
              {/* Performance Score */}
              {performanceScore && (
                <div className="mt-6 p-6 bg-blue-100 rounded-lg text-blue-700 shadow-lg">
                  <p><strong className="text-lg">Performance Score:</strong></p>
                  <p><strong>Grammar:</strong> {performanceScore.grammar}%</p>
                  <p><strong>Vocabulary:</strong> {performanceScore.vocabulary}%</p>
                  <p><strong>Tone:</strong> {performanceScore.tone}%</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
        
      {/* Confirmation Modal for Back Button */}
      {showBackModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-700">Exit Simulation?</h2>
            <p className="text-gray-600 mt-2">Are you sure you want to exit? Your progress will be lost.</p>

            {/* Buttons */}
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={cancelBack}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmBack}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CustomerServiceSimul;