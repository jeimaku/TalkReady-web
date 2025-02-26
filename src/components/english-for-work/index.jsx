import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";  // Importing Link for navigation

const bpoTests = [
  { title: "Customer Service Simulation", description: "Handle customer inquiries and complaints with AI-generated responses.", icon: "📞", route: "/english-for-work/modules/CustomerServSimul" },
  { title: "Email Etiquette Test", description: "Improve your professional email writing skills with interactive exercises.", icon: "📧" },
  { title: "Active Listening Challenge", description: "Practice listening to customer concerns and providing appropriate solutions.", icon: "🎧" },
  { title: "Listening & Note-taking Training", description: "Enhance your call transcription skills with real-time listening exercises.", icon: "📝" },
  { title: "Mock Call Roleplay", description: "Engage in AI-powered call simulations to improve your communication skills.", icon: "☎️" },
];

const EnglishForWork = () => {
  return (
    <div className="min-h-screen w-full bg-white px-10 py-32">
      <motion.div className="text-center text-4xl font-bold text-[#2973B2] mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1>English for Work</h1>
      </motion.div>

      <motion.p className="text-center text-lg text-gray-600 px-12 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        Enhance your communication skills for the BPO industry with AI-powered assessments and interactive training modules.
      </motion.p>

      {/* BPO Skills Grid */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        {bpoTests.map((test, index) => (
          <motion.div key={index} className="bg-gray-100 p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 flex flex-col items-center text-center" whileHover={{ scale: 1.05 }}>
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
