import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaVideo, FaComments, FaBookReader, FaLayerGroup } from "react-icons/fa"; // Icons for UI improvement

const LearningPreference = () => {
  const [selectedPreference, setSelectedPreference] = useState(null);
  const navigate = useNavigate();

  const preferences = [
    { name: "Watching videos", icon: <FaVideo /> },
    { name: "Practicing with conversations", icon: <FaComments /> },
    { name: "Reading and writing exercises", icon: <FaBookReader /> },
    { name: "A mix of all", icon: <FaLayerGroup /> },
  ];

  const handleContinue = () => {
    if (selectedPreference) {
      navigate("/daily-practice-goal");
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-6"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.8 }}
    >
      {/* Animated Card */}
      <motion.div 
        className="bg-white shadow-2xl rounded-xl w-full max-w-lg p-10 text-center flex flex-col items-center"
        initial={{ y: -30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Heading */}
        <motion.h1 
          className="text-3xl font-bold text-indigo-600 mb-4"
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.2 }}
        >
          How do you prefer to learn?
        </motion.h1>

        {/* Animated Progress Bar */}
        <motion.div 
          className="w-full bg-gray-300 h-2 rounded-full mb-6 overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: selectedPreference ? '100%' : '50%' }} 
          transition={{ duration: 1.2 }}
        >
          <motion.div 
            className="h-full bg-indigo-600"
            initial={{ width: 0 }} 
            animate={{ width: selectedPreference ? '100%' : '50%' }} 
            transition={{ duration: 1.2 }}
          />
        </motion.div>

        {/* Preference Selection */}
        <div className="w-full space-y-4">
          {preferences.map((preference, index) => (
            <motion.div
              key={index}
              className={`flex items-center justify-between w-full p-4 rounded-lg cursor-pointer transition-all duration-300 
                  ${selectedPreference === preference.name ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}
              `}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedPreference(preference.name)}
            >
              <div className="flex items-center">
                <span className="text-lg mr-3">{preference.icon}</span>
                <span className="font-semibold">{preference.name}</span>
              </div>
              {selectedPreference === preference.name && <span className="text-2xl">✅</span>}
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        <motion.button
          className={`w-full py-3 px-8 rounded-full text-lg shadow-md transition duration-300 mt-6
              ${selectedPreference ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}
          `}
          disabled={!selectedPreference}
          onClick={handleContinue}
          whileHover={selectedPreference ? { scale: 1.05 } : {}}
          whileTap={selectedPreference ? { scale: 0.95 } : {}}
        >
          Continue 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default LearningPreference;
