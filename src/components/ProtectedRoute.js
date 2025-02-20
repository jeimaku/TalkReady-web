import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';  // Import the auth context

const ProtectedRoute = ({ element }) => {
  const { userLoggedIn } = useAuth(); // Check if user is logged in

  if (!userLoggedIn) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return element;  // If logged in, render the protected component
};

export default ProtectedRoute;
