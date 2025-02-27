import React, { useState, useEffect } from "react";
import { Navigate, useRoutes, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/authContext";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Header from "./components/header";
import EnglishLevel from "./components/english-level";
import CurrentGoal from "./components/curent-goal";
import LearningPreference from "./components/learning-preference";
import DailyPracticeGoal from "./components/daily-practice-goal";
import PersonalizingPlan from "./components/personalizing-plan";
import { AuthProvider } from "./contexts/authContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./components/homepage";
import Profile from "./components/profile";
import Courses from "./components/courses";
import JobInterviewPrep from "./components/job-interview-prep";
import Test from "./components/test";
import MyReports from "./components/my-reports";
import EnglishForWork from "./components/english-for-work";
import WelcomePage from "./components/welcome-page";
import Chatbot from "./components/chatbot";

//courses
import IntroEnglishPronunciation from "./components/courses/course-details/intro-english-pronunciation";


//assessments
import PhoneticChartActivity from "./components/courses/course-details/phonetic-chart-act/PhoneticChartActivity";

//english-for-work page
import CustomerServiceSimulation from "./components/english-for-work/modules/CustomerServSimul";


function App() {
  const { userLoggedIn, hasCompletedOnboarding } = useAuth();
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  // ✅ List of onboarding pages
  const onboardingPages = [
    "/welcome-page",
    "/english-level",
    "/current-goal",
    "/learning-preference",
    "/daily-practice-goal",
    "/personalizing-plan",
  ];

  // ✅ Redirect new users to onboarding, returning users to homepage
  useEffect(() => {
    if (userLoggedIn) {
      if (!hasCompletedOnboarding && !onboardingPages.includes(location.pathname)) {
        window.location.href = "/welcome-page"; // New users start at the welcome page
      } 
      else if (hasCompletedOnboarding && onboardingPages.includes(location.pathname)) {
        if (location.pathname !== "/personalizing-plan") {
          window.location.href = "/homepage"; // Returning users go straight to homepage
        }
      }
    }
  }, [userLoggedIn, hasCompletedOnboarding, location.pathname]);

  // ✅ Do NOT mark onboarding as completed in `App.jsx`, let `PersonalizingPlan` handle it.

  const routesArray = [
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/welcome-page", element: <ProtectedRoute element={<WelcomePage />} /> },
    { path: "/english-level", element: <ProtectedRoute element={<EnglishLevel setProgress={setProgress} />} /> },
    { path: "/current-goal", element: <ProtectedRoute element={<CurrentGoal setProgress={setProgress} />} /> },
    { path: "/learning-preference", element: <ProtectedRoute element={<LearningPreference setProgress={setProgress} />} /> },
    { path: "/daily-practice-goal", element: <ProtectedRoute element={<DailyPracticeGoal setProgress={setProgress} />} /> },
    { path: "/personalizing-plan", element: <ProtectedRoute element={<PersonalizingPlan />} /> }, // ✅ Let this page handle onboarding completion
    { path: "/homepage", element: <ProtectedRoute element={<HomePage />} /> },
    { path: "/", element: userLoggedIn ? <Navigate to="/homepage" /> : <Navigate to="/login" /> },
    { path: "/profile", element: <ProtectedRoute element={<Profile setProgress={setProgress} />} /> },
    { path: "/courses", element: <ProtectedRoute element={<Courses setProgress={setProgress} />} /> },
    { path: "/job-interview-prep", element: <ProtectedRoute element={<JobInterviewPrep setProgress={setProgress} />} /> },
    { path: "/my-reports", element: <ProtectedRoute element={<MyReports setProgress={setProgress} />} /> },
    { path: "/test", element: <ProtectedRoute element={<Test setProgress={setProgress} />} /> },
    { path: "chatbot", element: <ProtectedRoute element={<Chatbot setProgress={setProgress} />} /> },

    // ✅ Course Details Routes
    { path: "/course/:courseId", element: <ProtectedRoute element={<IntroEnglishPronunciation setProgress={setProgress} />} /> },

    // ✅ Course Details Routes
    { path: "course/:courseId/phonetic-chart-assessment", element: <PhoneticChartActivity setProgress={setProgress} /> },

    // ✅ Eng for work page Details Routes
    { path: "/english-for-work", element: <ProtectedRoute element={<EnglishForWork setProgress={setProgress} />} /> },
    { path: "/english-for-work/modules/CustomerServSimul", element: <CustomerServiceSimulation setProgress={setProgress} /> },


  
  ];

  let routesElement = useRoutes(routesArray);

  return (
    <AuthProvider>
      {/* Hide header on login and register pages */}
      {!onboardingPages.includes(location.pathname) &&
        location.pathname !== "/login" &&
        location.pathname !== "/register" &&
        location.pathname !== "/course/intro-english-pronunciation" &&

        location.pathname !== "/course/course-details/assessment/phonetic" &&

        location.pathname !== "/english-for-work/modules/CustomerServSimul" &&

        // location.pathname !== "/Chatbot" && 
        <Header />}
      
      {/* <div className="w-full h-screen flex flex-col">
        <div className="w-full bg-gray-300 h-2">
          <div className="bg-blue-600 h-full" style={{ width: `${progress}%` }}></div>
        </div>
        {routesElement}
      </div>
    </AuthProvider> */}
    <div className="w-full h-screen flex flex-col">
        {/* Removed progress bar */}
        {routesElement}
      </div>
    </AuthProvider>
  );
}

export default App;
