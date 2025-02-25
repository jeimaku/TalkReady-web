import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc, setDoc, updateDoc } from "firebase/firestore"; // Import Firestore DB
import { db } from "../../firebase/firebase";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  const initializeUser = async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      try {
        const userDoc = await getDoc(userRef);
    
        let displayName = user.displayName || "User"; 
        let completedOnboarding = false;

        if (userDoc.exists()) {
          const userData = userDoc.data();
          displayName = userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : user.displayName || "User"; 
          completedOnboarding = userData.hasCompletedOnboarding || false; 
        } else {
          // ✅ Create user document if it doesn’t exist
          await setDoc(userRef, { 
            displayName: user.displayName || "User", 
            hasCompletedOnboarding: false 
          }, { merge: true });
        }

        setCurrentUser({
          ...user,
          displayName,
        });

        setHasCompletedOnboarding(completedOnboarding);
        setUserLoggedIn(true);
      } catch (error) {
        console.error("Error initializing user:", error);
      }
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
      setHasCompletedOnboarding(false);
    }
    setLoading(false);
  };

  // ✅ Function to mark onboarding as completed
  // const markOnboardingComplete = async () => {
  //   if (currentUser) {
  //     const userRef = doc(db, "users", currentUser.uid);
  //     try {
  //       const userDoc = await getDoc(userRef);
  //       if (userDoc.exists()) {
  //         await updateDoc(userRef, { hasCompletedOnboarding: true });
  //       } else {
  //         await setDoc(userRef, { hasCompletedOnboarding: true }, { merge: true });
  //       }
  //       setHasCompletedOnboarding(true);
  //     } catch (error) {
  //       console.error("Error updating onboarding status:", error);
  //     }
  //   }
  // };

  const markOnboardingComplete = async () => {
    if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        try {
            await updateDoc(userRef, { hasCompletedOnboarding: true });
            setHasCompletedOnboarding(true);
        } catch (error) {
            console.error("Error updating onboarding status:", error);
        }
    }
  };

  const value = {
    userLoggedIn,
    currentUser,
    hasCompletedOnboarding,
    markOnboardingComplete, 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
