import React, { useState } from "react";
import { FaPlay, FaEdit, FaTrash } from "react-icons/fa";
import { Chart } from "react-google-charts";
import { motion } from "framer-motion";

const MyReports = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [goals, setGoals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState("");
  const [audioLogs, setAudioLogs] = useState([]);

  const handleSaveEntry = () => {
    if (currentEntry.trim()) {
      setJournalEntries([...journalEntries, currentEntry]);
      setCurrentEntry("");
    }
  };

  const handleSaveGoal = () => {
    if (currentGoal.trim()) {
      setGoals([...goals, currentGoal]);
      setCurrentGoal("");
    }
  };

  const handleDeleteEntry = (index) => {
    setJournalEntries(journalEntries.filter((_, i) => i !== index));
  };

  const handleDeleteGoal = (index) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-8 mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Header Section */}
      <motion.div
        className="text-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-3xl font-semibold text-blue-600 mb-4">Speech Analysis Report</h1>
        <p className="text-lg text-gray-600">Your progress and feedback are summarized below.</p>
      </motion.div>

      {/* Progress Chart */}
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 Progress Tracking</h2>
        <Chart
          chartType="LineChart"
          width="100%"
          height="300px"
          data={[
            ["Date", "Pronunciation Accuracy", "Speaking Rate"],
            ["Week 1", 70, 80],
            ["Week 2", 75, 85],
            ["Week 3", 80, 90],
            ["Week 4", 85, 95],
          ]}
          options={{
            hAxis: { title: "Weeks" },
            vAxis: { title: "Progress (%)" },
          }}
        />
      </motion.div>

      {/* Journal Section */}
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">📘 My Journal</h2>

        {/* Daily Reflection */}
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-gray-800">📝 Daily Reflection</h3>
          <textarea
            className="w-full p-3 border rounded-md focus:ring focus:ring-blue-300 mt-2"
            rows="4"
            placeholder="What did I learn today? What was challenging? How can I improve?"
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
          ></textarea>
          <motion.button
            className="bg-blue-600 text-white py-2 px-4 mt-2 rounded-lg hover:bg-blue-700 transition"
            onClick={handleSaveEntry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Reflection
          </motion.button>
        </div>
      </motion.div>

      {/* Audio Log Section */}
      <motion.div
        className="mt-8 bg-white p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎤 Audio Recording Log</h2>
        <p className="text-gray-600">Save and replay your recordings to track your pronunciation improvement.</p>
        <ul className="mt-4 space-y-2">
          {audioLogs.length > 0 ? (
            audioLogs.map((log, index) => (
              <motion.li
                key={index}
                className="flex justify-between items-center bg-gray-100 p-3 rounded-md"
                whileHover={{ scale: 1.03 }}
              >
                <span>{log}</span>
                <motion.button className="text-green-500" whileHover={{ scale: 1.2 }}>
                  <FaPlay />
                </motion.button>
              </motion.li>
            ))
          ) : (
            <p className="text-gray-500">No recordings saved yet.</p>
          )}
        </ul>
      </motion.div>

      {/* AI Learning Recommendations */}
      <motion.div
        className="mt-8 bg-white p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🧠 Recommended Next Steps</h2>
        <ul className="list-disc list-inside text-gray-700">
          <motion.li whileHover={{ scale: 1.02 }}>Take the <strong>Pronunciation Perfection</strong> lesson.</motion.li>
          <motion.li whileHover={{ scale: 1.02 }}>Practice <strong>Advanced Fluency Drills</strong> to improve speaking rate.</motion.li>
          <motion.li whileHover={{ scale: 1.02 }}>Challenge yourself with a <strong>Mock Interview</strong> simulation.</motion.li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default MyReports;
