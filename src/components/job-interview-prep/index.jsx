import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import images
import slideImage1 from "./../../assets/1.png";
import slideImage2 from "./../../assets/2.png";
import slideImage3 from "./../../assets/3.png";

const JobInterviewPrep = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "TalkReady – Sample Text",
      description: "Sample text",
      image: slideImage1,
    },
    {
      title: "How TalkReady Works",
      description: "Sample text",
      image: slideImage2,
    },
    {
      title: "Polish Your English Presentation with AI",
      description: "Sample text",
      image: slideImage3,
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white pb-20">
      {/* Page Title */}
      <motion.div
        className="text-center text-4xl font-bold mb-8 text-[#2973B2] mt-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>English for Work</h1>
      </motion.div>

      {/* Full-Width Slideshow Section */}
      <div className="relative w-full h-[500px] overflow-hidden">
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            className="absolute w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center h-full bg-black bg-opacity-50">
              <motion.div
                className="text-center text-white font-bold p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-4xl">{slides[currentSlide].title}</h1>
                <p className="mt-4 text-xl">{slides[currentSlide].description}</p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full cursor-pointer transition-all duration-300 ${
                index === currentSlide ? "bg-[#2973B2]" : "bg-gray-300"
              }`}
              whileHover={{ scale: 1.2 }}
            ></motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-gray-200 bg-opacity-70 p-4 rounded-full shadow-md hover:bg-opacity-100 transition"
        >
          <svg
            className="w-10 h-10 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-gray-200 bg-opacity-70 p-4 rounded-full shadow-md hover:bg-opacity-100 transition"
        >
          <svg
            className="w-10 h-10 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Title for Courses */}
      <motion.div
        className="py-10 px-12 text-center text-3xl font-semibold text-[#2973B2]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2>Mock Job Interview with AI</h2>
      </motion.div>

      {/* Full-Width Mock Job Interview Options */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 w-full px-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {[
          { title: "Mock Job Interview: First Try", color: "bg-blue-100" },
          { title: "Mock Job Interview: General", color: "bg-orange-100" },
          { title: "Mock Job Interview: Specialist", color: "bg-green-100" },
          { title: "Mock Job Interview: Student", color: "bg-purple-100" },
          { title: "Mock Job Interview: Manager", color: "bg-red-100" },
        ].map((item, index) => (
          <motion.div
            key={index}
            className={`${item.color} p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 text-center`}
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-lg font-semibold text-gray-800">{item.title}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default JobInterviewPrep;
