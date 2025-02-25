import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './phonetic.css';

function PhoneticChartActivity() {
  const navigate = useNavigate();
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null); // State for audioBlob
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlayed, setIsAudioPlayed] = useState(false);
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentTask, setCurrentTask] = useState(0); // Track the current task
  const [redLineVisible, setRedLineVisible] = useState(false); // State for red line visibility
  const timerRef = useRef(null);
  const recorderRef = useRef(null); // Ref for recorder
  const audioChunks = useRef([]); // Use useRef to persist audio chunks between re-renders

  const tasks = [
    { prompt: 'What sound do you hear in the audio? Click the corresponding phonetic symbol.', options: ['æ', 'ʌ', 'iː', 'ɑː'], correctAnswer: 'æ' },
    { prompt: 'What sound do you hear in the audio? Click the corresponding phonetic symbol.', options: ['ʌ', 'iː', 'ɑː', 'ɪ'], correctAnswer: 'ʌ' },
    { prompt: 'What sound do you hear in the audio? Click the corresponding phonetic symbol.', options: ['iː', 'eɪ', 'ʌ', 'ɛ'], correctAnswer: 'iː' },
    { prompt: 'What sound do you hear in the audio? Click the corresponding phonetic symbol.', options: ['ɔː', 'eɪ', 'æ', 'ɪ'], correctAnswer: 'ɔː' },
    { prompt: 'What sound do you hear in the audio? Click the corresponding phonetic symbol.', options: ['ɪ', 'ɔː', 'ʌ', 'æ'], correctAnswer: 'ɪ' },
    { prompt: 'What sound do you hear in the audio? Click the corresponding phonetic symbol.', options: ['ʌ', 'ɪ', 'ə', 'æ'], correctAnswer: 'ə' },
    { prompt: 'What sound do you hear in the audio? Click the corresponding phonetic symbol.', options: ['iː', 'ʌ', 'ə', 'aɪ'], correctAnswer: 'aɪ' },
    { prompt: 'What sound do you hear in the audio? Click the corresponding phonetic symbol.', options: ['aʊ', 'ɔː', 'ɪ', 'ə'], correctAnswer: 'aʊ' },
    { prompt: 'What sound do you hear in the audio? Click the corresponding phonetic symbol.', options: ['uː', 'ɪ', 'eɪ', 'ʌ'], correctAnswer: 'uː' },
    { prompt: 'What sound do you hear in the audio? Click the corresponding phonetic symbol.', options: ['æ', 'ɛ', 'ʌ', 'eɪ'], correctAnswer: 'ɛ' },
  ];

  // Handle phonetic symbol selection
  const handleClick = (symbol) => {
    setSelectedSymbol(symbol);
    if (symbol === tasks[currentTask].correctAnswer) {
      setFeedback('Correct! Your symbol choice is correct!');
      setRedLineVisible(true); // Show red line when correct answer is selected
      setTimeout(() => nextTask(), 1500); // Move to next task after feedback
    } else {
      setFeedback('Oops! That’s incorrect. Try again!');
      setRedLineVisible(true); // Show red line for incorrect answer
    }
  };

  // Start recording and show the timer
  const handleStartRecording = async () => {
    setIsRecording(true);
    setRecordingTime(0);
    setIsRecordingComplete(false);
    timerRef.current = setInterval(() => setRecordingTime((prevTime) => prevTime + 1), 1000);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;  // Store the reference

    audioChunks.current = []; // Reset audio chunks before starting recording
    recorder.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: "audio/wav" });
      setAudioBlob(blob); // Set the audio blob state
      setAudioUrl(URL.createObjectURL(blob));
      setIsRecording(false);
      clearInterval(timerRef.current);
      setIsRecordingComplete(true); // Mark recording as complete
    };

    recorder.start();
  };

  const handleStopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();  // Stop the recording
      setIsRecording(false); // Reset recording state
    }
  };

  // Move to the next task
  const nextTask = () => {
    if (currentTask < tasks.length - 1) {
      setCurrentTask(currentTask + 1);
      setSelectedSymbol(null); // Reset the symbol selection for the next task
      setRedLineVisible(false); // Reset the red line visibility for the next task
    } else {
      setFeedback('You have completed all tasks!');
    }
  };

  // Play sound for the given phonetic sound
  const handlePlayAudio = (sound) => {
    const availableVoices = window.responsiveVoice.getVoices();
    const selectedVoice = availableVoices.find(voice => voice.name.includes("Female")); // Choose a voice type that works well for your needs
  
    if (window.responsiveVoice) {
      window.responsiveVoice.speak(sound, selectedVoice.name); // Use selected voice
      setIsAudioPlayed(true);
    } else {
      console.error('ResponsiveVoice is not loaded');
    }
  };

  const preloadAudio = (sound) => {
    const audio = new Audio(); 
    audio.src = `https://code.responsivevoice.org/getvoice.php?t=${sound}&tl=en&sv=fil&vn=Filipino%20Female`; // Ensure the URL matches the correct format
    audio.load();  // Preload the audio before calling play
  };

  preloadAudio(tasks[currentTask].correctAnswer); // Preload the current task's correct answer audio

  return (
    <motion.div
      className="activity-page"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-blue-600 font-semibold hover:underline">
        <FaArrowLeft /> Back
      </button>

      <motion.h2
        className="text-3xl font-bold text-blue-800 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Phonetic Chart Practice - Assessment
      </motion.h2>

      <motion.p
        className="text-lg mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Here, you will engage in tasks that assess your knowledge of phonetic sounds. Let's get started!
      </motion.p>

      <div className="task">
        <motion.h3
          className="text-xl font-semibold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          Task {currentTask + 1}: {tasks[currentTask].prompt}
        </motion.h3>

        {/* Play the sound when clicked */}
        <motion.button
          onClick={() => handlePlayAudio(tasks[currentTask].correctAnswer)}
          className="play-sound-btn mb-6"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Play Sound
        </motion.button>

        {/* Show the symbols after playing audio */}
        {isAudioPlayed && (
          <div className="phonetic-symbols">
            {tasks[currentTask].options.map((symbol, index) => (
              <motion.button
                key={index}
                className={`phonetic-button ${selectedSymbol === symbol ? 'selected' : ''}`}
                onClick={() => handleClick(symbol)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {symbol}
              </motion.button>
            ))}
          </div>
        )}

        <motion.div
          className="recording-section mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <button onClick={handleStartRecording} disabled={isRecording} className="record-button">
            {isRecording ? 'Recording...' : 'Start Recording'}
          </button>
          {isRecording && (
            <button onClick={handleStopRecording} className="stop-button">
              Stop Recording
            </button>
          )}

          {/* Show the recording progress */}
          {isRecording && (
            <div className="recording-progress mt-4">
              <p>Recording in progress... {recordingTime}s</p>
            </div>
          )}

          {/* Show a completed recording status */}
          {isRecordingComplete && (
            <div className="recording-complete mt-4">
              <p>Recording complete! Analyzing pronunciation...</p>
            </div>
          )}
        </motion.div>

        {audioUrl && (
          <div className="audio-feedback mt-4">
            <p>Audio recorded! Here's the feedback:</p>
            <p>{feedback}</p>
          </div>
        )}

        {/* Red line visibility logic */}
        {redLineVisible && (
          <div className="feedback" style={{ borderColor: selectedSymbol === tasks[currentTask].correctAnswer ? 'green' : 'red', backgroundColor: selectedSymbol === tasks[currentTask].correctAnswer ? '#d4edda' : '#f8d7da' }}>
            {feedback}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default PhoneticChartActivity;
