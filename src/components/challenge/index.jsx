import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaMicrophone } from "react-icons/fa";

const challengeTasks = [
  { title: "Test Your Speaking Level", color: "bg-blue-100", icon: "🎓" },
  { title: "Master a New Accent", color: "bg-orange-100", icon: "🗣️" },
  { title: "Daily Pronunciation Drills", color: "bg-red-100", icon: "📢" },
  { title: "Customer Service Roleplay", color: "bg-green-100", icon: "📞" },
  { title: "Fluency Booster: Speak Without Pauses", color: "bg-purple-100", icon: "🚀" },
  { title: "Grammar in Spoken English", color: "bg-teal-100", icon: "📝" },
  { title: "Confident Conversations Challenge", color: "bg-yellow-100", icon: "💬" },
  { title: "Mock BPO Interview", color: "bg-pink-100", icon: "🎙️" },
];

const Challenge = () => {
  return (
    <div className="min-h-screen w-full bg-white px-10 py-32"> 
      {/* Page Title */}
      <motion.div className="text-center text-4xl font-bold text-[#2973B2] mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1>English Speaking Challenge</h1>
      </motion.div>

      {/* Social Media & Start Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <span className="text-gray-500 flex items-center">🔔 Stay updated! Follow us on social media</span>
        <div className="flex gap-4">
          <button className="bg-black text-white px-4 py-2 rounded-md shadow hover:shadow-lg">Start Day 1</button>
        </div>
      </div>

      {/* Challenge Grid */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {challengeTasks.map((task, index) => (
          <motion.div key={index} className={`${task.color} p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 flex flex-col items-start`} whileHover={{ scale: 1.05 }}>
            <span className="text-lg font-semibold text-gray-800 flex items-center">⚡ Available</span>
            <h2 className="text-2xl font-bold mt-2">{task.title}</h2>
            <div className="text-6xl mt-4 self-end">{task.icon}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Challenge;
