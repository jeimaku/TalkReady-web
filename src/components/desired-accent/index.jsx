import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from '../../contexts/authContext';

// Import flag images
import USFlag from "../../assets/us.png";
import UKFlag from "../../assets/uk.png";
import AUFlag from "../../assets/au.png";

const DesiredAccent = () => {
  const [selectedAccent, setSelectedAccent] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const accents = [
    { name: "Neutral Accent", icon: "🌍" },
    { name: "American English", flag: USFlag },
    { name: "British English", flag: UKFlag },
    { name: "Australian English", flag: AUFlag },
  ];

  const handleContinue = async () => {
    if (!selectedAccent) {
      console.warn("⚠️ Please select a desired accent before continuing.");
      return;
    }

    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { "onboarding.desiredAccent": selectedAccent });
        console.log("✅ Desired accent stored successfully in Firestore:", selectedAccent);
        navigate("/personalizing-plan");
      } catch (error) {
        console.error("❌ Error storing desired accent:", error);
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
          className="text-3xl font-bold text-indigo-600 mb-4"
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.2 }}
        >
          Choose Your Desired Accent 🌍
        </motion.h1>

        {/* Animated Progress Bar */}
        <motion.div 
          className="w-full bg-gray-300 h-2 rounded-full mb-6 overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: selectedAccent ? '100%' : '50%' }} 
          transition={{ duration: 1.2 }}
        >
          <motion.div 
            className="h-full bg-indigo-600"
            initial={{ width: 0 }} 
            animate={{ width: selectedAccent ? '100%' : '50%' }} 
            transition={{ duration: 1.2 }}
          />
        </motion.div>

        {/* Accent Selection */}
        <div className="w-full space-y-4">
          {accents.map((accent, index) => (
            <motion.div
              key={index}
              className={`flex items-center justify-between w-full p-4 rounded-lg cursor-pointer transition-all duration-300 
                ${selectedAccent === accent.name ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}
              `}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedAccent(accent.name)}
            >
              <div className="flex items-center">
                {accent.flag ? (
                  <img 
                  src={accent.flag} 
                  alt={accent.name} 
                  className="h-5 w-auto mr-3 rounded-md shadow-sm object-contain"
              />
              
                ) : (
                  <span className="text-lg mr-3">{accent.icon}</span>
                )}
                <span className="font-semibold">{accent.name}</span>
              </div>
              {selectedAccent === accent.name && <span className="text-2xl">✅</span>}
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        <motion.button
          className={`w-full py-3 px-8 rounded-full text-lg shadow-md transition duration-300 mt-6
            ${selectedAccent ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}
          `}
          disabled={!selectedAccent}
          onClick={handleContinue}
          whileHover={selectedAccent ? { scale: 1.05 } : {}}
          whileTap={selectedAccent ? { scale: 0.95 } : {}}
        >
          Continue 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default DesiredAccent;
