import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate } from 'react-icons/fa'; // Icon for visual appeal
import welcomeImage from './../../assets/welc.gif'; // Import an illustration

const WelcomePage = () => {
    const { currentUser } = useAuth();
    const [showText, setShowText] = useState(false);
    const navigate = useNavigate();

    const userName = currentUser?.displayName || "User";

    useEffect(() => {
        if (currentUser) {
            setShowText(true);
        }
    }, [currentUser]);

    const handleBegin = () => {
        navigate('/english-level');
    };

    return (
        <motion.div 
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-6"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.8 }}
        >
            {/* Animated Welcome Card */}
            <motion.div 
                className="bg-white shadow-2xl rounded-xl w-full max-w-lg p-10 text-center flex flex-col items-center"
                initial={{ y: -30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* User Icon */}
                <motion.div 
                    className="bg-indigo-500 text-white p-4 rounded-full mb-4 shadow-lg"
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <FaUserGraduate size={40} />
                </motion.div>

                {/* Welcome Message */}
                <motion.h1 
                    className="text-3xl font-bold text-indigo-600 mb-2"
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: showText ? 1 : 0, y: 0 }} 
                    transition={{ duration: 1.2 }}
                >
                    Welcome, {userName}!
                </motion.h1>

                {/* Animated Illustration */}
                <motion.img 
                    src={welcomeImage} 
                    alt="Welcome Illustration" 
                    className="w-40 my-4"
                    initial={{ opacity: 0, scale: 0.5 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.8, delay: 0.6 }}
                />

                {/* Instructions */}
                <motion.p 
                    className="text-lg text-gray-600"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: showText ? 1 : 0 }} 
                    transition={{ duration: 1.2, delay: 0.5 }}
                >
                    We have a few questions to learn about you and your goals.
                </motion.p>

                <motion.p 
                    className="text-lg text-gray-600 mt-2"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: showText ? 1 : 0 }} 
                    transition={{ duration: 1.2, delay: 1 }}
                >
                    This will help us create the best study plan for you!
                </motion.p>

                {/* Button with Hover Animation */}
                <motion.button
                    className="bg-indigo-600 text-white py-3 px-8 rounded-full mt-6 text-lg shadow-md hover:bg-indigo-700 transition duration-300"
                    onClick={handleBegin}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Let's Begin 🚀
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default WelcomePage;
