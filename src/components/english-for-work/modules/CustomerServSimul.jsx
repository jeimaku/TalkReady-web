import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop } from 'react-icons/fa'; // FontAwesome Icons
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Main Customer Service Simulation Component
const CustomerServiceSimul = () => {
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [userResponse, setUserResponse] = useState("");
  const [customerSpeech, setCustomerSpeech] = useState("");
  const [responseFeedback, setResponseFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(""); // Store the audio URL from Cloudinary
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(null);
  const [showBackModal, setShowBackModal] = useState(false); // Modal state
  const [conversation, setConversation] = useState([]); 

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);


  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Initialize Speech Recognition
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (conversation.length > 0) {
        const lastMessage = conversation[conversation.length - 1];
        if (lastMessage.sender === "customer") {
            speakText(lastMessage.text);
        }
    }
}, [conversation]);


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
            setTimeout(() => {
                if (!isRecording) return; // Ensure it only restarts when needed
                recognitionInstance.start();
            }, 500);
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
      const prompt = "Generate a random customer inquiry for a call center. Example: 'Hello, I recently made a purchase on your website and I’m wondering if you can provide me with an update on the delivery status of my order.'";

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',  // Use the desired model
        messages: [
          { role: 'system', content: 'You are a helpful customer service representative.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      // Get the generated response
      let generatedSpeech = response.data.choices[0].message.content.trim();

      // Remove the quotation marks from the response
      generatedSpeech = generatedSpeech.replace(/"/g, '').trim();

      setConversation([{ sender: "customer", text: generatedSpeech }]); 
      speakText(generatedSpeech);
       // Set the AI-generated inquiry as customer speech

      // Use Web Speech API to speak the customer speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(generatedSpeech);
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => voice.name.toLowerCase().includes('female'));

        if (femaleVoice) {
          utterance.voice = femaleVoice; // Select the female voice
        } else {
          utterance.voice = voices[0]; // If no female voice is found, use the first available voice
        }

        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error generating customer speech:', error);
      setCustomerSpeech('Sorry, we encountered an error generating the inquiry.');
    }
  };

  const generateCustomerFollowUp = async (userResponse) => {
    try {
        console.log("Generating follow-up based on user response:", userResponse);
        setIsGeneratingResponse(true); // Show AI is generating response
        
        const prompt = `The customer service agent responded: "${userResponse}". Provide a professional, polite follow-up as a customer in a call.`;        

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a customer continuing a conversation in a call center scenario.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: 100,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        let generatedFollowUp = response.data.choices[0].message.content.trim();
        console.log("Generated Follow-Up:", generatedFollowUp);

        if (generatedFollowUp) {
            setTimeout(() => {
                setConversation(prev => [
                    ...prev,
                    { sender: "customer", text: generatedFollowUp }
                ]);
                
                speakText(generatedFollowUp);
                setIsWaitingForResponse(true); 
                setIsGeneratingResponse(false); // Hide indicator after response
            }, 1000);
        } else {
            console.warn("Generated follow-up is empty");
            setIsGeneratingResponse(false); // Hide indicator if error
        }
    } catch (error) {
        console.error('Error generating customer follow-up:', error);
        setCustomerSpeech('Sorry, we encountered an error generating the follow-up response.');
        setIsGeneratingResponse(false); // Hide indicator on error
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
    if (recognition) {
        console.log("Manually stopping recording...");
        setIsRecording(false);  
        recognition.stop();
        recognition.abort();  // Force stop recognition
    }
};


  // Speak Text using Web Speech API
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  // Start Call
  const startCall = () => {
    resetSimulation();  // 🔥 Ensure previous data is cleared
    setIsCallStarted(true);
    generateCustomerSpeech();
    setIsWaitingForResponse(true);
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
    if (isCallStarted) {
      setShowBackModal(true); // Show the modal instead of navigating directly
    } else {
      resetSimulation();  // 🔥 Reset before navigating
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
    setIsCallStarted(false); 
    setShowBackModal(false);
  };

  // Function to cancel going back
  const cancelBack = () => {
    setShowBackModal(false);
  };
  
  const startRecording = () => {
    if (!recognition) {
        console.warn("Speech recognition instance not initialized.");
        return;
    }

    if (isRecording) {
        console.log("Speech recognition is already running.");
        return; // Prevent multiple starts
    }

    try {
        console.log("Stopping previous recognition before starting a new one...");
        recognition.stop(); // Stop previous recognition
        recognition.abort(); // Ensure it fully stops

        setTimeout(() => { // Add a small delay before restarting
            console.log("Starting speech recognition...");
            recognition.start();
            setIsRecording(true);
        }, 500);  // Small delay to prevent immediate conflict
    } catch (error) {
        console.error("Error starting speech recognition:", error);
    }
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
  
          {/* Instructions Section */}
          {!isCallStarted && (
            <div className="mb-6 bg-blue-100 p-6 rounded-lg">
              <p className="text-xl text-gray-700 font-semibold">Instructions:</p>
              <p className="text-base text-gray-600">
                1. Greet the customer politely and introduce yourself.<br />
                2. Listen to the customer's concern and address it with empathy.<br />
                3. Provide a professional response to the customer’s query.<br />
                4. After providing your response, you’ll receive feedback on your language and professionalism.<br />
                5. Retry and improve with each interaction.
              </p>
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