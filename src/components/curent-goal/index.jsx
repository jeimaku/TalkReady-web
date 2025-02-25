import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaBullseye } from "react-icons/fa"; // Icons for UI improvement

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from '../../contexts/authContext';

const CurrentGoal = () => {
  const [selectedGoal, setSelectedGoal] = useState([]);
  const { currentUser } = useAuth(); // Get the current user
  const navigate = useNavigate();

  const goals = [
    "Get ready for a job interview",
    "Test my English level",
    "Improve my conversational English",
    "Improve my English for work",
  ];

  const handleContinue = async () => {
    if (selectedGoal.length === 0) {
      console.warn("⚠️ Please select at least one goal before continuing.");
      return;
    }

    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { "onboarding.currentGoal": selectedGoal });
        console.log("✅ Current goal stored successfully in Firestore:", selectedGoal);
        navigate("/learning-preference");
      } catch (error) {
        console.error("❌ Error storing current goal:", error);
      }
    } else {
      console.error("❌ No authenticated user found.");
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
          className="text-3xl font-bold text-indigo-600 mb-2"
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.2 }}
        >
          What is your current goal?
        </motion.h1>
        <p className="text-sm text-gray-600 mb-4">You can select two or more options</p>

        {/* Animated Progress Bar */}
        <motion.div 
          className="w-full bg-gray-300 h-2 rounded-full mb-6 overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: selectedGoal.length > 0 ? '100%' : '30%' }} 
          transition={{ duration: 1.2 }}
        >
          <motion.div 
            className="h-full bg-indigo-600"
            initial={{ width: 0 }} 
            animate={{ width: selectedGoal.length > 0 ? '100%' : '30%' }} 
            transition={{ duration: 1.2 }}
          />
        </motion.div>

        {/* Goal Selection */}
        <div className="w-full space-y-4">
          {goals.map((goal, index) => (
            <motion.div
              key={index}
              className={`flex items-center justify-between w-full p-4 rounded-lg cursor-pointer transition-all duration-300 
                  ${selectedGoal.includes(goal) ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}
              `}
              whileHover={{ scale: 1.05 }}
              onClick={() =>
                setSelectedGoal((prev) =>
                  prev.includes(goal) ? prev.filter((item) => item !== goal) : [...prev, goal]
                )
              }
            >
              <div className="flex items-center">
                <FaBullseye className="text-lg mr-3" />
                <span className="font-semibold">{goal}</span>
              </div>
              {selectedGoal.includes(goal) && <FaCheckCircle className="text-2xl" />}
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        <motion.button
          className={`w-full py-3 px-8 rounded-full text-lg shadow-md transition duration-300 mt-6
              ${selectedGoal.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}
          `}
          disabled={selectedGoal.length === 0}
          onClick={handleContinue}
          whileHover={selectedGoal.length > 0 ? { scale: 1.05 } : {}}
          whileTap={selectedGoal.length > 0 ? { scale: 0.95 } : {}}
        >
          Continue 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default CurrentGoal;
