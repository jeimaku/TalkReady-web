import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBookOpen, FaChalkboardTeacher, FaCheckCircle, FaArrowLeft } from "react-icons/fa";

const course = {
  title: "English Communication Skills for BPO Professionals",
  objective: "Enhance grammar, pronunciation, and vocabulary for effective communication in BPO settings.",
  targetAudience: "Aspiring BPO professionals, customer service representatives, and call center trainees.",
  duration: "6 weeks (self-paced)",
  format: "Interactive lessons, quizzes, role-plays, AI-driven assessments",
  modules: [
    {
      id: 1,
      title: "Fundamentals of English Grammar",
      icon: <FaBookOpen className="text-blue-600 text-2xl" />,
      objective: "Strengthen foundational grammar skills for clear and professional communication.",
      lessons: [
        { id: 1, title: "Sentence Structure and Parts of Speech", source: "ESL Pals - Grammar Lessons" },
        { id: 2, title: "Tenses and Their Usage", source: "British Council - English for Business" },
        { id: 3, title: "Subject-Verb Agreement", source: "Linguahouse - Business English Lesson Plans" },
      ],
      assessments: ["Grammar Quiz – Multiple-choice & sentence correction", "Writing Activity – Rewrite customer emails"],
    },
    {
      id: 2,
      title: "Pronunciation and Accent Neutralization",
      icon: <FaChalkboardTeacher className="text-blue-600 text-2xl" />,
      objective: "Improve clarity and reduce pronunciation issues for better customer understanding.",
      lessons: [
        { id: 4, title: "Introduction to Phonetics", source: "Alison - English for Customer Service" },
        { id: 5, title: "Common Pronunciation Challenges", source: "Preply - English for Call Centers" },
        { id: 6, title: "Stress and Intonation Patterns", source: "Lingua Linkup - English Training for Call Centers" },
      ],
      assessments: ["Pronunciation Drills – AI speech feedback", "Listening Test – Identify correct pronunciation"],
    },
    {
      id: 3,
      title: "Business Vocabulary and Expressions",
      icon: <FaBookOpen className="text-blue-600 text-2xl" />,
      objective: "Expand vocabulary and teach appropriate expressions for BPO scenarios.",
      lessons: [
        { id: 7, title: "Industry-Specific Terminology", source: "ESL Brains - Business English" },
        { id: 8, title: "Professional Greetings and Closings", source: "Your English Pal - Business English Lesson Plans" },
        { id: 9, title: "Handling Difficult Conversations", source: "Second Nature - Effective Communication Skills" },
      ],
      assessments: ["Vocabulary Quiz – Matching words", "Email & Chat Response Exercise – Rewrite customer responses"],
    },
    {
      id: 4,
      title: "Practical Application and Role-Play",
      icon: <FaChalkboardTeacher className="text-blue-600 text-2xl" />,
      objective: "Apply grammar, pronunciation, and vocabulary skills in real-world BPO scenarios.",
      lessons: [
        { id: 10, title: "Mock Calls", source: "Let's Talk English Speaking Classes - Call Center Training" },
        { id: 11, title: "Email and Chat Correspondence", source: "Bridge TEFL - Business English Lesson Plans" },
        { id: 12, title: "Feedback Sessions", source: "CIFAL Lebanon - English Academy for BPO Professionals" },
      ],
      assessments: ["Final Mock Call – AI-generated feedback", "Comprehensive Speech Analysis Report – AI evaluates performance"],
    },
  ],
};

function EngCommSkills() {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="p-5 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-blue-600 font-semibold hover:underline">
        <FaArrowLeft /> Back
      </button>
      
      {/* Course Header */}
      <motion.div 
        className="bg-blue-100 p-6 rounded-lg shadow-md text-center"
        whileHover={{ scale: 1.02 }}
      >
        <h2 className="text-3xl font-bold text-blue-800">{course.title}</h2>
        <p className="text-lg text-gray-700 mt-2">{course.objective}</p>
        <p className="text-md font-medium mt-2"><b>Target Audience:</b> {course.targetAudience}</p>
        <p className="text-md"><b>Duration:</b> {course.duration}</p>
        <p className="text-md"><b>Format:</b> {course.format}</p>
      </motion.div>

      {/* Modules Section */}
      {course.modules.map((module) => (
        <motion.div 
          key={module.id} 
          className="bg-white p-5 rounded-lg shadow-md mt-6 border-l-4 border-blue-600"
          whileHover={{ scale: 1.03 }}
        >
          <div className="flex items-center gap-3">
            {module.icon}
            <h3 className="text-xl font-semibold text-blue-700">{module.title}</h3>
          </div>
          <p className="text-gray-600 mt-1">{module.objective}</p>

          {/* Lessons Section */}
          <div className="mt-4">
            <h4 className="text-lg font-medium text-gray-700">Lessons:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {module.lessons.map((lesson) => (
                <motion.div 
                  key={lesson.id} 
                  className="p-4 bg-blue-50 rounded-lg shadow-md border border-blue-300 cursor-pointer hover:bg-blue-200 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => alert(`Redirecting to ${lesson.title}`)}
                >
                  <h5 className="text-md font-medium text-blue-800">{lesson.title}</h5>
                  <p className="text-sm text-gray-500">{lesson.source}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Assessments Section */}
          <div className="mt-4">
            <h4 className="text-lg font-medium text-gray-700">Assessments:</h4>
            <ul className="list-disc ml-5 text-gray-600">
              {module.assessments.map((assessment, index) => (
                <motion.li 
                  key={index} 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2"
                >
                  <FaCheckCircle className="text-green-500" /> {assessment}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default EngCommSkills;
