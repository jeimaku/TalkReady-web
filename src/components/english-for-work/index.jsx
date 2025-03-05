import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Importing Link for navigation

const bpoTests = [
  { title: "Customer Service Simulation", description: "Handle customer inquiries and complaints with AI-generated responses and speech analysis.", icon: "📞", route: "/english-for-work/modules/CustomerServSimul" },
  { title: "Email Etiquette Test", description: "Enhance professional email writing skills with AI feedback on clarity and tone.", icon: "📧", route: "/english-for-work/modules/EmailEtiquette" },
  { title: "Active Listening & Accent Recognition", description: "Understand diverse English accents and improve response accuracy.", icon: "🎧", route: "/english-for-work/modules/AccentRecognition" },
  { title: "Listening & Note-taking Training", description: "Develop call transcription skills and practice real-time note-taking.", icon: "📝", route: "/english-for-work/modules/ListeningTraining" },
  { title: "Mock Call Roleplay with AI Feedback", description: "Engage in AI-powered call simulations with real-time pronunciation evaluation.", icon: "☎️", route: "/english-for-work/modules/MockCall" },
  { title: "Pronunciation & Fluency Assessment", description: "Get real-time AI feedback on pronunciation, fluency, and tone.", icon: "🗣️", route: "/english-for-work/modules/PronunciationTraining" },
  { title: "Accent Neutralization Training", description: "Reduce strong regional accents for clear, professional communication.", icon: "🌎", route: "/english-for-work/modules/AccentNeutralization" },
];

const EnglishForWork = () => {
  return (
    <div className="min-h-screen w-full bg-white px-10 py-32">
      {/* Page Title */}
      <motion.div 
        className="text-center text-4xl font-bold text-[#2973B2] mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>English for Work</h1>
      </motion.div>

      {/* Description */}
      <motion.p 
        className="text-center text-lg text-gray-600 px-12 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Master workplace communication with AI-powered speech training, pronunciation coaching, and real-world Call Center simulations.
      </motion.p>

      {/* BPO Skills Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {bpoTests.map((test, index) => (
          <motion.div 
            key={index}
            className="bg-gray-100 p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 flex flex-col items-center text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-5xl">{test.icon}</div>
            <h2 className="text-2xl font-bold mt-4">{test.title}</h2>
            <p className="mt-2 text-gray-600">{test.description}</p>
            <Link to={test.route} className="mt-4 text-[#2973B2] hover:underline">Start Simulation</Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default EnglishForWork;
