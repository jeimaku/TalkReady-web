import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom"; // Added Link for navigation
import { db } from "../../../firebase/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { FaBookOpen, FaCheckCircle, FaArrowLeft } from "react-icons/fa"; 
import { ClipLoader } from "react-spinners";

function IntroEnglishPronunciation() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, "courses", courseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCourse(docSnap.data());
        } else {
          setCourse(null);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <ClipLoader color="#1D4ED8" loading={true} size={50} />
          <p className="mt-4 text-blue-600">Loading course data...</p>
        </div>
      </div>
    );
  }

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

      {/* Lessons Section */}
      {course.lessons && course.lessons.map((lesson, index) => (
        <motion.div
          key={index}
          className="bg-white p-5 rounded-lg shadow-md mt-6 border-l-4 border-blue-600"
          whileHover={{ scale: 1.03 }}
        >
          <div className="flex items-center gap-3">
            <FaBookOpen className="text-blue-600 text-2xl" />
            <h3 className="text-xl font-semibold text-blue-700">
              {/* If the lesson is "Phonetic Chart Practice", make it clickable */}
              {lesson.title === "Phonetic Chart Practice" ? (
                <Link to={`/course/${courseId}/phonetic-chart-assessment`} className="text-blue-600 hover:underline">
                  {lesson.title}
                </Link>
              ) : (
                lesson.title
              )}
            </h3>
          </div>
          <p className="text-gray-600 mt-1">{lesson.assessment}</p>

          {/* Tasks Section */}
          <div className="mt-4">
            <h4 className="text-lg font-medium text-gray-700">Tasks:</h4>
            <ul>
              {lesson.task && lesson.task.map((task, i) => (
                <li key={i} className="text-gray-600">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  {task.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Assessment Section */}
          <div className="mt-4">
            <p className="text-md font-medium text-gray-700">Status: {lesson.status}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default IntroEnglishPronunciation;
