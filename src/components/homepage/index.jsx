import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaRegClock, FaRegStar, FaChevronLeft, FaChevronRight, FaGraduationCap, 
          FaChartBar, FaRobot, FaMicrophone, FaQuestionCircle, FaVolumeUp, FaUserTie } from "react-icons/fa"; // ✅ Fixed import
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/authContext"; // Import the useAuth hook
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

const HomePage = () => {
  const { currentUser } = useAuth();
  const [scrolling, setScrolling] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const featuredRef = useRef(null);
  const [highlightedSkill, setHighlightedSkill] = useState(null);


  const firstName = currentUser?.displayName?.split(" ")[0] || "User";
  const lastName = currentUser?.displayName?.split(" ")[1] || "";



  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => setIsRecording(false);

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const scrollLeft = () => {
    if (featuredRef.current) {
      featuredRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (featuredRef.current) {
      featuredRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };
  
  // Placeholder scores for each category (Replace with actual data)
  const skillData = {
    labels: ["Grammar", "Fluency", "Interaction", "Pronunciation", "Vocabulary"],
    datasets: [
      {
        label: "Skill Progress",
        data: [80, 55, 45, 70, 50],
        backgroundColor: "rgba(0, 119, 179, 0.2)",
        borderColor: "#0077B3",
        borderWidth: 2,
        pointBackgroundColor: "#0077B3",
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}`;
          },
        },
      },
      legend: { display: false },
    },
  };
  
  return (
    <div className="flex flex-col items-center justify-start min-h-screen h-full w-full">

      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-5xl p-8 mb-6 mt-20 text-center ${
          scrolling ? "bg-opacity-50 backdrop-blur-md" : ""
        }`}
      >
        <h1 className="text-4xl font-bold text-[#0077B3]">Welcome to TalkReady</h1>
        <p className="text-lg text-gray-700 mt-2">
          Your AI-powered platform for improving English for Call Center roles
        </p>
      </motion.div>

      {/* Skill Tracker with Category Selection */}
      <motion.div
        className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-2xl font-semibold text-[#0077B3] mb-4">Skill Progress Tracker</h3>
        
        {/* Skill Selection Tabs */}
        <div className="flex justify-center gap-2 mb-4">
          {["Grammar", "Fluency", "Interaction", "Pronunciation", "Vocabulary"].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition duration-300 ${
                highlightedSkill === category ? "bg-[#0077B3] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setHighlightedSkill(highlightedSkill === category ? null : category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="w-80 mx-auto relative">
          <Radar data={skillData} options={radarOptions} />
        </div>
      </motion.div>

      {/* User Stats */}
      <motion.div
        className="flex justify-between items-center mb-6 text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center">
          <FaRegClock className="text-2xl text-[#2B60E4] mr-2" />
          <span className="text-lg font-semibold">Speaking Time: 0 min</span>
        </div>
        <div className="flex items-center">
          <FaRegStar className="text-2xl text-yellow-500 mr-2" />
          <span className="text-lg font-semibold">Streak: 0 days</span>
        </div>
      </motion.div>

      {/* Speaking Level Test Section */}
      <motion.div
        className="border p-6 rounded-lg bg-[#0077B3] text-white shadow-lg mb-6 w-full max-w-3xl text-center transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h3 className="text-2xl font-semibold mb-2">Speaking Level Test</h3>
        <p className="text-lg mb-4">Find out your English level and get level-up recommendations</p>
        <p className="text-sm text-gray-200 mb-4">
          Start the Speaking Level Test to evaluate your English proficiency and get tailored recommendations. This test will help you understand your current speaking skills and guide you on how to improve them through personalized practice scenarios with our AI-powered chatbot. Prepare for real-life customer service conversations and boost your confidence!
        </p>

        <Link
          to="/chatbot"
          className="mt-4 inline-block bg-white text-[#0077B3] py-2 px-6 rounded-full hover:bg-[#005f7f] hover:text-white transition duration-300 ease-in-out"
        >
          <FaMicrophone className="mr-2 inline-block text-xl" /> Start Practice
        </Link>
      </motion.div>


      {/* Featured Section */}
      <motion.div
        className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg text-center relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-2xl font-semibold text-[#0077B3] mb-4">Featured Courses</h3>

        <div className="relative mt-4">
          {/* Left Arrow Button */}
          <button
            className="absolute left-[-30px] top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300 z-10"
            onClick={scrollLeft}
          >
            <FaChevronLeft className="text-xl text-gray-700" />
          </button>

          {/* Scrolling Course Container */}
          <div
            ref={featuredRef}
            className="flex overflow-x-auto gap-4 p-4 scrollbar-hide scroll-smooth rounded-lg"
            style={{
              scrollBehavior: "smooth",
              whiteSpace: "nowrap",
              paddingLeft: "40px", // Prevent left arrow overlap
              paddingRight: "40px", // Prevent right arrow overlap
            }}
          >
            {[
              {
                title: "Cultural Fit for Working in the U.S.",
                desc: "Powered by English for IT",
                img: "https://cdn-icons-png.flaticon.com/512/1754/1754435.png",
              },
              {
                title: "Speak Like a Native with TV Shows",
                desc: "Master conversational English",
                img: "https://cdn-icons-png.flaticon.com/512/1754/1754435.png",
              },
              {
                title: "Job Interview Simulator",
                desc: "Prepare for job interviews with interactive scenarios",
                img: "https://cdn-icons-png.flaticon.com/512/1754/1754435.png",
              },
              {
                title: "How to Make Great Small Talk",
                desc: "Improve your social English skills by learning practical conversation techniques",
                img: "https://cdn-icons-png.flaticon.com/512/1754/1754435.png",
              },
            ].map((course, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="bg-gray-100 p-4 rounded-lg shadow-md w-60 text-center inline-block"
              >
                <img
                  src={course.img}
                  alt={course.title}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <h4 className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis w-full">
                  {course.title}
                </h4>
                <p className="text-sm text-gray-600 h-10 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                  {course.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            className="absolute right-[-30px] top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300 z-10"
            onClick={scrollRight}
          >
            <FaChevronRight className="text-xl text-gray-700" />
          </button>
        </div>
      </motion.div>


      {/* Speech Analyzer Section */}
      <motion.div className="w-full max-w-4xl p-6 mt-8 bg-[#0077B3] text-white rounded-lg shadow-lg text-center" whileHover={{ scale: 1.03 }}>
        <h2 className="text-3xl font-semibold">Speech Analyzer</h2>
        <p className="text-lg mt-2">Record or upload an audio file to receive AI-powered feedback on pronunciation, fluency, and grammar.</p>

        <div className="mt-6 flex gap-6 justify-center">
          <button onClick={isRecording ? stopRecording : startRecording} className="bg-white text-[#0077B3] py-2 px-6 rounded-full hover:bg-gray-300 transition duration-300">
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>

          <label className="bg-white text-[#0077B3] py-2 px-6 rounded-full cursor-pointer hover:bg-gray-300 transition duration-300">
            Upload Audio
            <input type="file" accept="audio/*" onChange={handleAudioUpload} hidden />
          </label>
        </div>
      </motion.div>

      {/* Quick Navigation Section */}
      <motion.div
        className="w-full max-w-4xl p-6 mt-8 bg-white rounded-lg shadow-xl text-center"
        whileHover={{ scale: 1.03 }}
      >
        <h2 className="text-2xl font-semibold text-[#0077B3] mb-4">Quick Navigation</h2>
        <p className="text-lg text-gray-700 mb-6">Easily access different features of TalkReady</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

          {/* Accent Training */}
          <Link
            to="/accent-training/"
            className="flex flex-col items-center gap-2 bg-[#f9f9f9] p-6 rounded-lg shadow-md hover:bg-[#0077B3] hover:text-white transition-all duration-300 ease-in-out"
          >
            <FaVolumeUp className="text-4xl text-[#0077B3] mb-2 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-white" />
            <span className="text-lg font-semibold">Accent Training</span> {/* Updated text */}
          </Link>

          {/* Courses */}
          <Link
            to="/courses"
            className="flex flex-col items-center gap-2 bg-[#f9f9f9] p-6 rounded-lg shadow-md hover:bg-[#0077B3] hover:text-white transition-all duration-300 ease-in-out"
          >
            <FaGraduationCap className="text-4xl text-[#0077B3] mb-2 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-white" />
            <span className="text-lg font-semibold">Courses</span>
          </Link>

          {/* My Reports */}
          <Link
            to="/my-reports"
            className="flex flex-col items-center gap-2 bg-[#f9f9f9] p-6 rounded-lg shadow-md hover:bg-[#0077B3] hover:text-white transition-all duration-300 ease-in-out"
          >
            <FaChartBar className="text-4xl text-[#0077B3] mb-2 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-white" />
            <span className="text-lg font-semibold">My Reports</span>
          </Link>

          {/* English For Work */}
          <Link
            to="/english-for-work"
            className="flex flex-col items-center gap-2 bg-[#f9f9f9] p-6 rounded-lg shadow-md hover:bg-[#0077B3] hover:text-white transition-all duration-300 ease-in-out"
          >
            <FaUserTie className="text-4xl text-[#0077B3] mb-2 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-white" />
            <span className="text-lg font-semibold">English For Work</span>
          </Link>

          {/* Chatbot */}
          <Link
            to="/chatbot"
            className="flex flex-col items-center gap-2 bg-[#f9f9f9] p-6 rounded-lg shadow-md hover:bg-[#0077B3] hover:text-white transition-all duration-300 ease-in-out"
          >
            <FaRobot className="text-4xl text-[#0077B3] mb-2 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-white" />
            <span className="text-lg font-semibold">Chatbot</span> {/* Updated text */}
          </Link>

          {/* FAQ */}
          <Link
            to="/faq"
            className="flex flex-col items-center gap-2 bg-[#f9f9f9] p-6 rounded-lg shadow-md hover:bg-[#0077B3] hover:text-white transition-all duration-300 ease-in-out"
          >
            <FaQuestionCircle className="text-4xl text-[#0077B3] mb-2 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-white" />
            <span className="text-lg font-semibold">FAQ</span> {/* Updated text */}
          </Link>

        </div>
      </motion.div>


    </div>
  );
};

export default HomePage;
