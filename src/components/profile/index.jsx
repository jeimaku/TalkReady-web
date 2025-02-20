import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/authContext';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Profile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFirstName(userData.firstName || currentUser.displayName?.split(" ")[0] || '');
          setLastName(userData.lastName || currentUser.displayName?.split(" ")[1] || '');
          setEmail(userData.email || currentUser.email || '');
          setMobileNumber(userData.mobileNumber || '');
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleSave = async () => {
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      try {
        await updateDoc(userRef, {
          firstName,
          lastName,
          mobileNumber,
        });
        setShowModal(true);
        setTimeout(() => setShowModal(false), 3000);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  return (
    <motion.div className="flex flex-col items-center justify-start min-h-screen p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.div className="w-full max-w-4xl p-8 mb-6 mt-20 bg-white shadow-lg rounded-xl" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <motion.img
              src="https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-circle-icon.png"
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
              whileHover={{ scale: 1.1 }}
            />
            <div className="ml-4">
              <h1 className="text-3xl font-semibold">{`${firstName} ${lastName}`.trim()}</h1>
              <p className="text-gray-500">{email}</p>
            </div>
          </div>
          <motion.button
            onClick={() => {
              if (isEditing) handleSave();
              setIsEditing(!isEditing);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            whileHover={{ scale: 1.05 }}
          >
            {isEditing ? 'Save' : 'Edit'}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'First Name', value: firstName, setter: setFirstName },
            { label: 'Last Name', value: lastName, setter: setLastName },
            { label: 'Mobile Number', value: mobileNumber, setter: setMobileNumber },
            { label: 'Email', value: email, setter: setEmail, disabled: true },
          ].map(({ label, value, setter, disabled }, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <label className="text-gray-700 font-semibold">{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setter(e.target.value)}
                disabled={!isEditing || disabled}
                className="w-full mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {showModal && (
        <motion.div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <motion.div className="bg-white p-6 rounded-md shadow-md max-w-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <h2 className="text-xl font-semibold text-green-600">Profile updated successfully</h2>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Profile;
