import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaBookOpen } from 'react-icons/fa'; // Icons for UI improvement

const EnglishLevel = () => {
    const [selectedLevel, setSelectedLevel] = useState(null);
    const navigate = useNavigate();

    const levels = [
        { name: 'Beginner A1', description: 'I can say hello, my name, and talk about what I do.' },
        { name: 'Lower Intermediate A2', description: 'I can understand basic conversations and talk about my daily life.' },
        { name: 'Intermediate B1', description: 'I can talk freely about everyday topics and my profession.' },
        { name: 'Upper Intermediate B2', description: 'I can talk about a broad range of topics with confidence.' },
        { name: 'Advanced C', description: 'I can understand TV shows and discuss complex topics.' },
    ];

    const handleContinue = () => {
        if (selectedLevel) {
            navigate("/current-goal");
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
                    What is your level of English?
                </motion.h1>

                {/* Animated Progress Bar */}
                <motion.div 
                    className="w-full bg-gray-300 h-2 rounded-full mb-6 overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: selectedLevel ? '100%' : '30%' }} 
                    transition={{ duration: 1.2 }}
                >
                    <motion.div 
                        className="h-full bg-indigo-600"
                        initial={{ width: 0 }} 
                        animate={{ width: selectedLevel ? '100%' : '30%' }} 
                        transition={{ duration: 1.2 }}
                    />
                </motion.div>

                {/* Level Selection */}
                {levels.map((level, index) => (
                    <motion.div
                        key={index}
                        className={`flex items-center justify-between w-full p-4 mb-4 rounded-lg cursor-pointer transition-all duration-300 
                            ${selectedLevel === level.name ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}
                        `}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setSelectedLevel(level.name)}
                    >
                        <div className="flex items-center">
                            <FaBookOpen className="text-lg mr-3" />
                            <div>
                                <h3 className="font-semibold">{level.name}</h3>
                                <p className="text-sm">{level.description}</p>
                            </div>
                        </div>
                        {selectedLevel === level.name && <FaCheckCircle className="text-2xl" />}
                    </motion.div>
                ))}

                {/* Continue Button */}
                <motion.button
                    className={`w-full py-3 px-8 rounded-full text-lg shadow-md transition duration-300 
                        ${selectedLevel ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}
                    `}
                    disabled={!selectedLevel}
                    onClick={handleContinue}
                    whileHover={selectedLevel ? { scale: 1.05 } : {}}
                    whileTap={selectedLevel ? { scale: 0.95 } : {}}
                >
                    Continue 🚀
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default EnglishLevel;
