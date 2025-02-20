// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUGIr7eAdvBIht7v9PuW-Q6Z_Xv-tDRqQ",
  authDomain: "talkready-a8496.firebaseapp.com",
  projectId: "talkready-a8496",
  storageBucket: "talkready-a8496.firebasestorage.app",
  messagingSenderId: "687695411049",
  appId: "1:687695411049:web:162dba888f029a4cb7aff8",
  measurementId: "G-HM621P1FWW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// This function no longer stores the password in Firestore
async function saveUserData(userId, firstName, lastName, mobile, email) {
  await setDoc(doc(db, "users", userId), {
    firstName: firstName,
    lastName: lastName,
    mobileNumber: mobile,
    email: email,   // Store email in Firestore but not the password
  });
}


export { app, auth, db, saveUserData, GoogleAuthProvider, signInWithPopup };
