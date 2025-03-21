import React, { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../contexts/authContext";
import { doCreateUserWithEmailAndPassword } from "../../../firebase/auth";
import registerImage from "../../../assets/7.png";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons


const Register = () => {
    const navigate = useNavigate();
    const { userLoggedIn } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility

    if (userLoggedIn) {
        return <Navigate to="/homepage" replace />;
    }

    const handleError = (error) => {
        switch (error.code) {
            case "auth/email-already-in-use":
                return "This email is already registered. Try logging in instead.";
            case "auth/weak-password":
                return "Password should be at least 6 characters long.";
            case "auth/invalid-email":
                return "Please enter a valid email address.";
            case "auth/network-request-failed":
                return "Network error. Check your internet connection and try again.";
            case "auth/too-many-requests":
                return "Too many attempts. Please wait and try again later.";
            default:
                return "An unexpected error occurred. Please try again.";
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(""); // Clear previous errors

        if (!firstName || !lastName || !email || !mobile || !password || !confirmPassword) {
            setErrorMessage("Please fill out all fields.");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }
        if (!isRegistering) {
            setIsRegistering(true);
            try {
                await doCreateUserWithEmailAndPassword(email, password, firstName, lastName, mobile);
                navigate("/welcome-page");
            } catch (error) {
                setErrorMessage(handleError(error)); // Handle Firebase error
                setIsRegistering(false);
            }
        }
    };

    return (
        <motion.div
            className="w-full min-h-screen flex items-center justify-center bg-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <div className="bg-white shadow-lg rounded-3xl flex w-full max-w-5xl overflow-hidden">
                {/* Left Section (Image & Text Box) */}
                <div className="hidden lg:flex w-2/5 relative">
                    {/* Background Image */}
                    <img
                        src={registerImage}
                        alt="Register Illustration"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
    
                    {/* Text Box with Background */}
                    <motion.div
                        className="absolute bottom-10 left-6 right-6 bg-black bg-opacity-60 text-white p-4 rounded-lg text-center mx-auto max-w-md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        <h2 className="text-2xl font-bold">Join TalkReady Today!</h2>
                        <p className="text-sm mt-2 leading-relaxed">
                            Develop industry-standard communication skills with AI-driven coaching and real-time feedback.
                            Prepare for call center job interviews and customer interactions with confidence!
                        </p>
                    </motion.div>
                </div>
    
                {/* Form Section */}
                <div className="w-full lg:w-3/5 p-8 flex flex-col justify-center max-w-lg mx-auto">
                    <motion.h2
                        className="text-3xl font-bold text-center text-[#0077B3]"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        Create a New Account
                    </motion.h2>
                    <form onSubmit={onSubmit} className="space-y-4 mt-6">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm text-gray-600 font-bold">First Name</label>
                                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} 
                                    className="w-full mt-2 px-3 py-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300 shadow-sm" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 font-bold">Last Name</label>
                                <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} 
                                    className="w-full mt-2 px-3 py-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300 shadow-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 font-bold">Mobile Number</label>
                            <input type="text" required value={mobile} onChange={(e) => setMobile(e.target.value)} 
                                className="w-full mt-2 px-3 py-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 font-bold">Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                                className="w-full mt-2 px-3 py-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 font-bold">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full mt-2 px-3 py-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300 shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 mt-2"
                                >
                                    {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 font-bold">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full mt-2 px-3 py-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300 shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 mt-2"
                                >
                                    {showConfirmPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                                </button>
                            </div>
                        </div>
                        {errorMessage && (
                            <motion.span 
                                className="text-red-600 font-bold block text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                {errorMessage}
                            </motion.span>
                        )}
                        <button type="submit" disabled={isRegistering} 
                            className="w-full px-4 py-2 text-white font-medium bg-[#0077B3] rounded-lg hover:bg-[#3066be] transition duration-300">
                            {isRegistering ? "Signing Up..." : "Sign Up"}
                        </button>
                    </form>
                    <p className="text-center text-sm mt-4">
                        Already have an account? <Link to={'/login'} className="hover:underline font-bold text-blue-600">Sign In</Link>
                    </p>
                </div>
            </div>
        </motion.div>
    );
    
};

export default Register;
