import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';
import { FaHome, FaUserAlt, FaClipboardList, FaTrophy, FaRobot } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Header = () => {
  const [programsOpen, setProgramsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userLoggedIn, currentUser } = useAuth();
  const programsRef = useRef(null);
  const profileRef = useRef(null);

  const togglePrograms = () => setProgramsOpen(!programsOpen);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  const firstName = currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'User';

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setProgramsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full top-0 left-0 z-50 flex justify-between items-center px-6 py-4 shadow-lg transition-all duration-300 backdrop-blur-md ${scrolling ? 'bg-white/80 shadow-md' : 'bg-white/90'}`}
    >
      {/* Logo */}
      <motion.h1
        whileHover={{ scale: 1.1 }}
        className="text-3xl font-bold text-[#3066be] cursor-pointer drop-shadow-lg"
      >
        TalkReady
      </motion.h1>

      {/* Navigation */}
      {userLoggedIn ? (
        <div className="flex space-x-8">
          <Link to="/homepage" className={`flex items-center space-x-2 ${location.pathname === '/homepage' ? 'text-[#0077B3] font-bold' : 'text-[#3066be]'} hover:scale-105 transition`}>
            <FaHome className="text-2xl" /> <span>Home</span>
          </Link>
          <div className="relative" ref={programsRef}>
            <button onClick={togglePrograms} className={`flex items-center space-x-2 ${programsOpen || location.pathname.includes('/accent-training') || location.pathname.includes('/english-for-work') ? 'text-[#0077B3] font-bold' : 'text-[#3066be]'} hover:scale-105 transition`}>
              <FaClipboardList className="text-2xl" /> <span>Programs</span>
            </button>
            {programsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 mt-2 bg-white shadow-lg rounded-lg w-48 border border-gray-200"
              >
                <Link to="/accent-training" className={`block px-4 py-2 hover:bg-gray-100 ${location.pathname === '/accent-training' ? 'text-[#0077B3] font-bold' : ''}`}>Accent Training</Link>
                <Link to="/english-for-work" className={`block px-4 py-2 hover:bg-gray-100 ${location.pathname === '/english-for-work' ? 'text-[#0077B3] font-bold' : ''}`}>English for Work</Link>
              </motion.div>
            )}
          </div>
          <Link to="/courses" className={`flex items-center space-x-2 ${location.pathname === '/courses' ? 'text-[#0077B3] font-bold' : 'text-[#3066be]'} hover:scale-105 transition`}>
            <FaTrophy className="text-2xl" /> <span>Courses</span>
          </Link>
          <Link to="/my-reports" className={`flex items-center space-x-2 ${location.pathname === '/my-reports' ? 'text-[#0077B3] font-bold' : 'text-[#3066be]'} hover:scale-105 transition`}>
            <FaClipboardList className="text-2xl" /> <span>My Reports</span>
          </Link>
          <Link to="/Chatbot" className={`flex items-center space-x-2 ${location.pathname === '/Chatbot' ? 'text-[#0077B3] font-bold' : 'text-[#3066be]'} hover:scale-105 transition`}>
            <FaRobot className="text-2xl" /> <span>Chatbot</span>
          </Link>
        </div>
      ) : (
        <div className="flex gap-x-4">
          <Link to="/login" className="px-4 py-2 border border-[#0077B3] text-[#0077B3] rounded-md hover:bg-[#3066be] hover:text-white transition">Login</Link>
          <Link to="/register" className="px-4 py-2 border border-[#0077B3] text-[#0077B3] rounded-md hover:bg-[#3066be] hover:text-white transition">Register</Link>
        </div>
      )}

      {/* Profile */}
      {userLoggedIn && (
        <div className="relative" ref={profileRef}>
          <button onClick={toggleProfile} className={`flex items-center gap-2 ${profileOpen ? 'text-[#0077B3] font-bold' : 'text-[#3066be]'}`}>
            <FaUserAlt className="text-2xl" /> <span>{firstName}</span>
          </button>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-48 border border-gray-200"
            >
              <Link to="/profile" className={`block px-4 py-2 hover:bg-gray-100 ${location.pathname === '/profile' ? 'text-[#0077B3] font-bold' : ''}`}>Profile</Link>
              <Link to="/share-feedback" className={`block px-4 py-2 hover:bg-gray-100 ${location.pathname === '/share-feedback' ? 'text-[#0077B3] font-bold' : ''}`}>Share Feedback</Link>
              <Link to="/faq" className={`block px-4 py-2 hover:bg-gray-100 ${location.pathname === '/faq' ? 'text-[#0077B3] font-bold' : ''}`}>FAQ</Link>
              <Link to="/contact-us" className={`block px-4 py-2 hover:bg-gray-100 ${location.pathname === '/contact-us' ? 'text-[#0077B3] font-bold' : ''}`}>Contact Us</Link>
              <button
                onClick={() => {
                  doSignOut().then(() => navigate('/login'));
                }}
                className="block w-full px-4 py-2 text-red-500 hover:bg-gray-100"
              >
                Logout
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.nav>
  );
};

export default Header;
