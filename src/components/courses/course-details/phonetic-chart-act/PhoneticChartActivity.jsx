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
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentTask, setCurrentTask] = useState(0);
  const [redLineVisible, setRedLineVisible] = useState(false);
  const timerRef = useRef(null);
  const recorderRef = useRef(null);
  const audioChunks = useRef([]);

  const tasks = [
    { prompt: 'What sound do you hear in the word "Cat"?', options: ['æ', 'ʌ', 'iː', 'ɑː'], correctAnswer: 'æ' },
    { prompt: 'What sound do you hear in the word "Tree"?', options: ['ʌ', 'iː', 'ɑː', 'ɪ'], correctAnswer: 'iː' },
    { prompt: 'What sound do you hear in the word "Job"?', options: ['ʊ', 'ɪ', 'ɔː', 'ɑː'], correctAnswer: 'ɪ' },
    { prompt: 'What sound do you hear in the word "Phone"?', options: ['oʊ', 'eɪ', 'æ', 'ɪ'], correctAnswer: 'oʊ' },

    // Call Center Scenarios
    { prompt: 'A customer says: "Can you confirm my order number 13456?"', options: ['Sure, let me check that.', 'Sorry, I can’t help.', 'Can you repeat that?', 'I don’t understand.'], correctAnswer: 'Sure, let me check that.' },
    { prompt: 'A customer asks: "I need to update my billing address."', options: ['I will update it now.', 'I can’t do that.', 'Please provide your new address.', 'Call back later.'], correctAnswer: 'Please provide your new address.' },
    { prompt: 'A customer asks: "When will my package arrive?"', options: ['It will arrive in 2-3 days.', 'I don’t know.', 'Why are you asking?', 'You should wait.'], correctAnswer: 'It will arrive in 2-3 days.' }
  ];

  const handleClick = (symbol) => {
    setSelectedSymbol(symbol);
    if (symbol === tasks[currentTask].correctAnswer) {
      setFeedback('✅ Correct! Well done.');
      setRedLineVisible(true);
      setTimeout(() => nextTask(), 1500);
    } else {
      setFeedback(`❌ Incorrect. Try again! Hint: The correct sound is more ${generateHint(tasks[currentTask].correctAnswer)}.`);
      setRedLineVisible(true);
    }
  };

  const generateHint = (correctSymbol) => {
    const hints = {
      'æ': 'open and forward in the mouth.',
      'ʌ': 'short and central.',
      'iː': 'long and in the front.',
      'ɑː': 'low and in the back.',
      'oʊ': 'rounded like in "go".'
    };
    return hints[correctSymbol] || 'distinct from others.';
  };

  const handleStartRecording = async () => {
    setIsRecording(true);
    setRecordingTime(0);
    setIsRecordingComplete(false);
    timerRef.current = setInterval(() => setRecordingTime((prevTime) => prevTime + 1), 1000);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    audioChunks.current = [];
    recorder.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: "audio/wav" });
      setAudioUrl(URL.createObjectURL(blob));
      setIsRecording(false);
      clearInterval(timerRef.current);
      setIsRecordingComplete(true);
    };

    recorder.start();
  };

  const handleStopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const nextTask = () => {
    if (currentTask < tasks.length - 1) {
      setCurrentTask(currentTask + 1);
      setSelectedSymbol(null);
      setRedLineVisible(false);
    } else {
      setFeedback('🎉 You have completed all tasks!');
    }
  };

  return (
    <motion.div className="activity-page">
      <button onClick={() => navigate(-1)} className="back-button">
        <FaArrowLeft /> Back
      </button>

      <h2 className="title">Phonetic Chart Practice - Assessment</h2>
      <p className="description">Practice phonetic sounds and customer interaction skills.</p>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${((currentTask + 1) / tasks.length) * 100}%` }}>
          Task {currentTask + 1} of {tasks.length}
        </div>
      </div>

      <h3 className="task-prompt">{tasks[currentTask].prompt}</h3>

      <button onClick={() => handleClick(tasks[currentTask].correctAnswer)} className="play-sound-btn">
        Play Sound
      </button>

      <div className="phonetic-symbols">
        {tasks[currentTask].options.map((symbol, index) => (
          <button key={index} className={`phonetic-button ${selectedSymbol === symbol ? 'selected' : ''}`} onClick={() => handleClick(symbol)}>
            {symbol}
          </button>
        ))}
      </div>

      {/* Recording Section */}
      {currentTask >= 4 && (
        <div className="call-center-response">
          <p>🎙️ Try speaking your response before selecting an answer.</p>
          <button onClick={handleStartRecording} className="record-button">🎤 Start Speaking</button>
          {isRecording && <div className="waveform"></div>}
          {isRecordingComplete && (
            <button onClick={() => handleClick(tasks[currentTask].correctAnswer)} className="submit-response-btn">
              Submit Answer
            </button>
          )}
        </div>
      )}

      {redLineVisible && (
        <div className="feedback" style={{ borderColor: selectedSymbol === tasks[currentTask].correctAnswer ? 'green' : 'red' }}>
          {feedback}
        </div>
      )}

      {audioUrl && (
        <div className="audio-feedback">
          <p>🎙️ Listen to your recorded response:</p>
          <audio controls>
            <source src={audioUrl} type="audio/wav" />
          </audio>
        </div>
      )}
    </motion.div>
  );
}

export default PhoneticChartActivity;
