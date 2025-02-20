import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";  // Import AuthProvider

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>  {/* Wrap the App component with AuthProvider */}
      <App />
    </AuthProvider>
  </BrowserRouter>
);
