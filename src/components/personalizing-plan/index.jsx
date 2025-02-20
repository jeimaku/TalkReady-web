import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; 
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa"; 
import { useAuth } from "../../contexts/authContext"; 
import Loader from "./../ui/loader";  // ✅ Import your custom loader

const PersonalizingPlan = () => {
  const { markOnboardingComplete } = useAuth(); 
  const [loadingStep, setLoadingStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const navigate = useNavigate();

  const planSteps = [
    "Creating diverse topics",
    "Preparing interactive dialogues",
    "Optimizing your learning path",
    "Finalizing your plan",
  ];

  useEffect(() => {
    if (loadingStep < planSteps.length) {
      const timer = setTimeout(() => {
        setLoadingStep((prev) => prev + 1);
      }, 3000); // ✅ Each step appears every 3 seconds

      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => {
          setShowButton(true);
        }, 2000);
      }, 2000);
    }
  }, [loadingStep]);

  const handleButtonClick = async () => {
    setShowLoader(true); // ✅ Show the custom loader
    await markOnboardingComplete();
    
    setTimeout(() => {
      navigate("/homepage"); // ✅ Redirect to HomePage after loader
    }, 3000); // ✅ Show loader for 3 seconds before navigation
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-6"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.8 }}
    >
      {showLoader ? (
        // ✅ Show your custom loader before navigating
        <Loader />
      ) : (
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
            Personalizing your learning plan...
          </motion.h1>

          {/* Loading Circle */}
          <div className="w-full flex justify-center items-center mb-6">
            {!isComplete ? (
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin"></div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="text-green-600 font-bold"
              >
                Learning plan complete!
              </motion.div>
            )}
          </div>

          {/* Animated Steps */}
          <div className="space-y-4">
            {planSteps.slice(0, loadingStep).map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 1.5,
                  delay: index * 1.5,
                }}
              >
                <div className="flex items-center gap-x-2">
                  <FaCheckCircle className="text-green-600 text-lg" />
                  <span>{step}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="w-full text-center mt-6">
            {showButton && (
              <motion.button
                className="bg-blue-600 text-white py-2 px-8 rounded-full hover:bg-blue-700 transition duration-300"
                onClick={handleButtonClick} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get my plan
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PersonalizingPlan;
