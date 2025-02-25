import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Firestore imports

export const doCreateUserWithEmailAndPassword = async (email, password, firstName, lastName, mobileNumber) => {
  try {
    if (!firstName || !lastName || !email || !mobileNumber || !password) {
      throw new Error("Missing required fields. Please fill out all fields.");
    }

    // ✅ Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("✅ User created successfully:", user.uid);

    // ✅ Save new user data in Firestore
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      firstName: firstName || "Unknown",
      lastName: lastName || "Unknown",
      email: email,
      mobileNumber: mobileNumber || "N/A",
      isNewUser: true,
      createdAt: new Date().toISOString(),
      onboarding: {} // Initialize an empty onboarding object
    });    

    console.log("✅ User data successfully stored in Firestore:", user.uid);

    return userCredential;
  } catch (error) {
    console.error("❌ Error creating user:", error.message);
    throw error;
  }
};


// Sign In with Email & Password
export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign In with Google & Save to Firestore
export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Reference to Firestore user document
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Extract first and last name from displayName
      const nameParts = user.displayName ? user.displayName.split(" ") : ["User"];
      const firstName = nameParts[0] || "User";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      // Save user data to Firestore
      await setDoc(userRef, {
        firstName,
        lastName,
        email: user.email,
        mobileNumber: "", // Google users may not have a phone number
      });
    }
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
};

// Sign Out User
export const doSignOut = () => {
  return auth.signOut();
};

// Reset Password
export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

// Change Password
export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

// Send Email Verification
export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/homepage`,
  });
};
