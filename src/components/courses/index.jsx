import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // ✅ Import Link for navigation
import "./course.css";

const courses = [
  { 
    id: "eng-comm-skills", 
    title: "Grammar & Pronunciation for BPO Professionals", 
    level: "B2", 
    category: "Speaking", 
    status: "Available", 
    lessons: 25, 
    img: "communication.png", 
    color: "bg-blue-100", 
    icon: "🗣️" 
  }
];

function CourseCard({ course }) {
  return (
    <Link to={`/course/${course.id}`} className="no-underline">
      <motion.div 
        className={`course-card ${course.color}`}
        whileHover={{ scale: 1.05, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-5xl">{course.icon}</div>
        <h3 className="course-title mt-2">{course.title}</h3>
        <p className="course-level">{course.level}</p>
        <p className="course-lessons">Lessons: {course.lessons}</p>
      </motion.div>
    </Link>
  );
}

function Courses() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ category: '', status: '', level: '' });

  const resetFilter = (filterType) => {
    setFilter({ ...filter, [filterType]: '' });
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter.category ? course.category === filter.category : true) &&
    (filter.status ? course.status === filter.status : true) &&
    (filter.level ? course.level === filter.level : true)
  );

  return (
    <div className="courses-page">
      <motion.div 
        className="filter-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input
          type="text"
          placeholder="Search"
          className="search-bar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-group">
          <select className="filter-dropdown" onChange={(e) => setFilter({ ...filter, category: e.target.value })} value={filter.category}>
            <option value="">Category</option>
            <option value="Speaking">Speaking</option>
            <option value="Writing">Writing</option>
            <option value="Listening">Listening</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Accent & Pronunciation Training">Accent & Pronunciation Training</option> 
          </select>
          <button className="reset-btn" onClick={() => resetFilter('category')}>Reset</button>
        </div>
      </motion.div>

      <motion.div 
        className="courses-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </motion.div>
    </div>
  );
}

export default Courses;
