import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop } from 'react-icons/fa'; // FontAwesome Icons

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

  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  // Initialize Speech Recognition
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Set up SpeechRecognition if the browser supports it
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionAPI();

      recognitionInstance.continuous = false;  // We only want to capture the speech when the stop button is pressed
      recognitionInstance.lang = 'en-US';  // Set language to English
      recognitionInstance.interimResults = false;  // Do not show results in real-time, only after stopping

      recognitionInstance.onstart = () => {
        console.log("Speech recognition started");
        setIsRecording(true); // Show recording status
      };

      recognitionInstance.onresult = (event) => {
        let speechText = "";
        // Collect the result after the stop button is pressed
        for (let i = event.resultIndex; i < event.results.length; i++) {
          speechText += event.results[i][0].transcript;
        }
        console.log("Final recognized text: ", speechText);
        setUserResponse(speechText);  // Set the transcribed text after stopping the recording
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error: ", event);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        console.log("Speech recognition ended");
        setIsRecording(false); // Stop recording when recognition ends
      };

      setRecognition(recognitionInstance);  // Set the recognition instance

    } else {
      alert("Your browser does not support speech recognition.");
    }
  }, []);

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

      setCustomerSpeech(generatedSpeech); // Set the AI-generated inquiry as customer speech

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

  // Generate customer follow-up based on user response
const generateCustomerFollowUp = async (userResponse) => {
    try {
      const prompt = `Generate a customer follow-up based on the following user response in a customer service call: "${userResponse}"`;
  
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
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
  
      let generatedFollowUp = response.data.choices[0].message.content.trim();
      if (generatedFollowUp) {
        generatedFollowUp = generatedFollowUp.replace(/"/g, '').trim();
        setCustomerSpeech(generatedFollowUp);  // Ensure this updates the UI correctly
  
        // Use Web Speech API to speak the customer follow-up
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(generatedFollowUp);
          const voices = speechSynthesis.getVoices();
          const femaleVoice = voices.find(voice => voice.name.toLowerCase().includes('female'));
  
          if (femaleVoice) {
            utterance.voice = femaleVoice; // Select the female voice
          } else {
            utterance.voice = voices[0]; // If no female voice is found, use the first available voice
          }
  
          speechSynthesis.speak(utterance);
        }
      } else {
        console.error('Generated follow-up is empty');
      }
    } catch (error) {
      console.error('Error generating customer follow-up:', error);
      setCustomerSpeech('Sorry, we encountered an error generating the follow-up response.');
    }
  };
  

  const startCall = () => {
    setIsCallStarted(true);
    generateCustomerSpeech();  // Generate initial customer speech when the call starts
    setIsWaitingForResponse(true);
  };

  const stopRecording = () => {
    recognition.stop(); // Stop the recognition when the user presses the stop button
    setIsRecording(false);
  };

  const processAudio = async () => {
    try {
      const transcription = userResponse;  // Use the transcribed user response
      const feedback = await analyzeWithOpenAI(transcription);  // Replace with your OpenAI logic for feedback
      setResponseFeedback(feedback);
      setPerformanceScore({
        grammar: 90,
        tone: 75,
        vocabulary: 80,
      });

      // Generate customer follow-up based on the user's response
      generateCustomerFollowUp(transcription);
      
      // Make the next customer speech after AI response
      setIsWaitingForResponse(false);  // Allow the AI to proceed without waiting
    } catch (error) {
      console.error('Error processing audio:', error);
    }
};


  const handleRetry = () => {
    setResponseFeedback("");
    setIsWaitingForResponse(true);
    setUserResponse("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 md:w-2/3 lg:w-1/2 flex flex-col items-center justify-center">
  
        {/* Customer Profile Column */}
        <div className="flex flex-col items-center mb-6 md:mb-0 md:w-1/3">
          <img
            src="https://storage.googleapis.com/coldcalr-imgs/Chad%20Rivers.webp"
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
              <button
                onClick={startCall}
                className="w-full p-4 bg-blue-500 text-white text-xl rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Start Call Simulation
              </button>
            </div>
          ) : (
            <>
              {/* Customer's Message in a Chat Bubble */}
              <div className="mb-6 flex items-start">
                <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white mr-4">
                  <span className="text-xl">S</span> {/* Initials or Icon for Customer */}
                </div>
                <div className="bg-blue-100 p-6 rounded-lg max-w-[70%] shadow-lg">
                  <p className="text-lg">{customerSpeech}</p>
                </div>
              </div>
  
              {/* User's Message in a Chat Bubble */}
              {userResponse && (
                <div className="mb-6 flex items-start flex-row-reverse">
                  <div className="w-12 h-12 rounded-full bg-green-400 flex items-center justify-center text-white ml-4 mr-4">
                    <span className="text-xl">M</span> {/* Initials or Icon for User */}
                  </div>
                  <div className="bg-green-100 p-6 rounded-lg max-w-[70%] shadow-lg">
                    <p className="text-lg">{userResponse}</p>
                  </div>
                </div>
              )}
  
              {/* Speech Recording and Retry Buttons in a Single Row */}
              {isWaitingForResponse && (
                <div className="mb-6 flex justify-between items-center space-x-16">
                  <button
                    onClick={() => recognition.start()}
                    className="w-1/3 p-4 bg-green-500 text-white text-lg rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center"
                  >
                    <FaMicrophone size={24} /> {/* Microphone Icon */}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="w-1/3 p-4 bg-red-500 text-white text-lg rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center"
                  >
                    <FaStop size={24} /> {/* Stop Icon */}
                  </button>
                  <button
                    onClick={handleRetry}
                    className="w-1/3 p-4 bg-yellow-500 text-white text-lg rounded-lg hover:bg-yellow-600 transition-all duration-300 flex items-center justify-center"
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
    </div>
  );
};

export default CustomerServiceSimul;
