import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Sun, Moon } from "lucide-react";

const faqData = [
  { question: "What is TalkReady?", answer: "TalkReady is an AI-powered interactive English proficiency platform designed for aspiring call center professionals." },
  { question: "How does TalkReady help in English proficiency?", answer: "TalkReady provides real-time feedback on pronunciation, fluency, and grammar using AI-powered speech recognition and conversational simulations." },
  { question: "What call center skills does TalkReady improve?", answer: "It enhances pronunciation, fluency, listening comprehension, and handling real-time customer interactions in simulated call center scenarios." },
  { question: "Does TalkReady provide certification?", answer: "Currently, TalkReady is a self-improvement tool and does not offer official certifications. However, it aligns with industry-standard assessments." },
  { question: "What types of assessments are included?", answer: "TalkReady includes AI-driven pronunciation assessments, fluency tracking, grammar analysis, and interactive mock calls to simulate real-world customer interactions." },
  { question: "Can TalkReady help with different English accents?", answer: "Yes! It supports American, British, and Australian accents to help users adapt to global call center environments." },
  { question: "Does TalkReady use AI in training?", answer: "Yes, TalkReady integrates AI-powered speech recognition, chatbots, and real-time feedback mechanisms for effective learning." },
  { question: "Is TalkReady available on mobile?", answer: "Yes, TalkReady is available as a web-based platform and a mobile application for on-the-go learning." },
  { question: "How is my progress tracked?", answer: "Users can track their progress through AI-powered analytics that monitor pronunciation, fluency, and interaction skills over time." },
  { question: "Does TalkReady offer role-playing scenarios?", answer: "Yes, TalkReady includes role-playing exercises where users simulate real-life customer calls and receive AI-driven feedback." },
];

const FAQ = () => {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const filteredFaqs = faqData.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-600">Frequently Asked Questions</h2>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search FAQs..."
        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 text-lg"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => (
          <motion.div
            key={index}
            className={`shadow-lg rounded-lg p-4 cursor-pointer transition-colors duration-300 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="flex justify-between items-center"
              onClick={() => toggleExpand(index)}
            >
              <h3 className="text-lg text-[#0077B3] font-medium">{faq.question}</h3>
              {expanded === index ? (
                <ChevronUp size={24} className="text-blue-500" />
              ) : (
                <ChevronDown size={24} className="text-gray-500" />
              )}
            </div>

            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={expanded === index ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
                >
                <p className="mt-3">
                    {faq.answer}
                </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
