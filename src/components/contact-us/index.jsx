import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Send } from "lucide-react";

const ContactUs = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000); // Reset after 3 seconds
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-white text-gray-900">
      
      {/* Contact Form Container */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="w-full max-w-3xl bg-white shadow-lg border border-gray-300 rounded-xl p-8"
      >
        <h2 className="text-3xl font-bold text-[#0077B3] text-center">Contact Us</h2>
        <p className="text-center text-gray-600 mt-2">We’d love to hear from you! Fill out the form below.</p>
  
        {submitted ? (
          <motion.div 
            className="mt-6 p-4 bg-green-100 text-green-700 rounded-lg text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✅ Thank you! Your message has been sent.
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Name */}
            <motion.div whileFocus={{ scale: 1.05 }} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3066be] bg-white text-gray-900 placeholder-gray-500"
              />
            </motion.div>
  
            {/* Email */}
            <motion.div whileFocus={{ scale: 1.05 }} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                value={formData.email}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3066be] bg-white text-gray-900 placeholder-gray-500"
              />
            </motion.div>
  
            {/* Subject */}
            <motion.div whileFocus={{ scale: 1.05 }} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3066be] bg-white text-gray-900 placeholder-gray-500"
              />
            </motion.div>
  
            {/* Message */}
            <motion.div whileFocus={{ scale: 1.05 }} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea
                name="message"
                placeholder="Your message..."
                required
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3066be] bg-white text-gray-900 placeholder-gray-500"
              />
            </motion.div>
  
            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                type="submit"
                className="w-full flex justify-center items-center bg-[#0077B3] hover:bg-[#3066be] text-white py-3 rounded-lg text-lg font-semibold transition-all"
              >
                Send Message <Send className="ml-2" />
              </button>
            </motion.div>
          </form>
        )}
      </motion.div>
  
      {/* Contact Information */}
      <div className="mt-8 text-center">
        <h3 className="text-xl font-semibold text-[#0077B3]">Contact Information</h3>
        <p className="text-gray-600">📧 Email: support@talkready.com</p>
        <p className="text-gray-600">📞 Phone: +1 (800) 123-4567</p>
        
        {/* Social Media Links */}
        <div className="flex justify-center space-x-4 mt-3">
          <a href="https://facebook.com" className="text-[#0077B3] hover:text-[#3066be] font-medium transition">Facebook</a>
          <a href="https://twitter.com" className="text-[#0077B3] hover:text-[#3066be] font-medium transition">Twitter</a>
          <a href="https://linkedin.com" className="text-[#0077B3] hover:text-[#3066be] font-medium transition">LinkedIn</a>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
