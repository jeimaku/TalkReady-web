import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { doSignInWithEmailAndPassword, doSignInWithGoogle, doPasswordReset } from "../../../firebase/auth";
import { useAuth } from "../../../contexts/authContext";
import googleIcon from "../../../assets/google.png";
import logo from "../../../assets/logoTR.png";


// Image Array for Slideshow
const images = [
    require("../../../assets/4.png"),
    require("../../../assets/5.png"),
    require("../../../assets/6.png")
];

const Login = () => {
    const [currentImage, setCurrentImage] = useState(0);

    const { userLoggedIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [forgotPassword, setForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");

     // Slideshow Effect
     useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(interval);
    }, []);

    
    if (userLoggedIn) {
        return <Navigate to="/welcome-page" replace />;
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                await doSignInWithEmailAndPassword(email, password);
            } catch (error) {
                setIsSigningIn(false);
                setErrorMessage("Invalid email or password. Please try again.");
            }
        }
    };

    const onGoogleSignIn = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                await doSignInWithGoogle();
            } catch (err) {
                console.error("Google sign-in failed:", err);
                setIsSigningIn(false);
            }
        }
    };

    const handleForgotPassword = async () => {
        if (!resetEmail) {
            setResetError("Please enter your email address.");
            return;
        }
        try {
            await doPasswordReset(resetEmail);
            setResetSuccess("A password reset link has been sent to your email.");
            setResetError("");
        } catch (error) {
            setResetError("Error resetting password. Please try again.");
            setResetSuccess("");
        }
    };

    return (
        <motion.div
            className="w-full min-h-screen flex items-center justify-center bg-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <div className="bg-white shadow-lg rounded-3xl flex w-full max-w-7xl overflow-hidden">
                {/* Left Section (Image Background with Text Box) */}
                <div className="w-1/2 hidden lg:flex relative">
                    {/* Background Image */}
                    <motion.img
                        key={currentImage}
                        src={images[currentImage]}
                        alt="Slideshow Image"
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
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
                        <h2 className="text-2xl font-bold">Master English, Master Your Career</h2>
                        <p className="text-sm mt-2 leading-relaxed">
                            TalkReady is an AI-powered English proficiency platform designed for aspiring call center professionals.
                            Enhance your fluency, pronunciation, and communication skills with real-time feedback!
                        </p>
                    </motion.div>
                </div>

    
                {/* Form Section */}
                <div className="w-full lg:w-2/5 p-8 flex flex-col justify-center max-w-md mx-auto">
                    {/* Logo & Welcome Text */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <img src={logo} alt="Logo" className="w-12 h-12 mb-5" />
                        <motion.h2
                            className="text-3xl font-bold text-[#0077B3]"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            Welcome to TalkReady 👋
                        </motion.h2>
                        <p className="text-gray-600 text-sm mt-1">Kindly enter your details below to log in</p>
                    </div>
    
                    {!forgotPassword ? (
                        <form onSubmit={onSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div>
                                <label className="text-sm text-gray-600 font-bold">Email</label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300 shadow-sm"
                                />
                            </div>
    
                            {/* Password Input */}
                            <div>
                                <label className="text-sm text-gray-600 font-bold">Password</label>
                                <input
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300 shadow-sm"
                                />
                            </div>
    
                            {/* Error Message */}
                            {errorMessage && <span className="text-red-500 font-bold">{errorMessage}</span>}
    
                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isSigningIn}
                                className="w-full px-4 py-2 text-white font-medium bg-[#0077B3] rounded-lg hover:bg-[#3066be] transition duration-300 flex items-center justify-center"
                            >
                                {isSigningIn ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
    
                            {/* Forgot Password */}
                            <p
                                onClick={() => setForgotPassword(true)}
                                className="text-[#3066be] text-sm cursor-pointer text-center"
                            >
                                Forgot Password?
                            </p>
    
                            {/* Divider */}
                            <div className="flex items-center space-x-2 text-gray-500">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="text-sm">or</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>
    
                            {/* Google Login Button */}
                            <button
                                disabled={isSigningIn}
                                onClick={(e) => onGoogleSignIn(e)}
                                className="w-full flex items-center justify-center gap-x-3 py-2.5 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition duration-300"
                            >
                                <img src={googleIcon} alt="Google" className="w-5 h-5" />
                                {isSigningIn ? (
                                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    "Continue with Google"
                                )}
                            </button>
    
                            {/* Register Link */}
                            <p className="text-center text-sm text-gray-600 mt-4">
                                Don't have an account? <Link to={'/register'} className="hover:underline font-bold text-blue-600">Sign up</Link>
                            </p>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-center text-blue-600">Reset Password</h4>
                            <div>
                                <label className="text-sm text-gray-600 font-bold">Enter your email to reset your password</label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300 shadow-sm"
                                />
                            </div>
                            {resetError && <span className="text-red-500 font-bold">{resetError}</span>}
                            {resetSuccess && <span className="text-green-500 font-bold">{resetSuccess}</span>}
                            <button
                                onClick={handleForgotPassword}
                                className="w-full px-4 py-2 text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300"
                            >
                                Reset Password
                            </button>
                            <p
                                onClick={() => setForgotPassword(false)}
                                className="text-blue-600 text-sm hover:underline cursor-pointer text-center"
                            >
                                Back to Login
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
    
};

export default Login;