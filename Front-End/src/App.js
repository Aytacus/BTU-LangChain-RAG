import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Chatbot from "./components/Chatbot";
import HomePage from "./components/HomePage";
import ForgotPassword from "./components/ForgotPassword";
import { auth } from "./firebase/authConfig";
import { onAuthStateChanged } from "firebase/auth";
import { ThemeProvider } from "./utils/ThemeContext";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/chat" /> : <HomePage />} />
            <Route path="/login" element={user ? <Navigate to="/chat" /> : <Login />} />
            <Route
              path="/register"
              element={
                user && user.emailVerified ? (
                  <Navigate to="/chat" />
                ) : (
                  <Signup />
                )
              }
            />
            <Route path="/ForgotPassword" element={user ? <Navigate to="/chat" /> : <ForgotPassword />} />
            <Route
              path="/chat"
              element={
                user ? (
                  user.emailVerified ? (
                    <Chatbot />
                  ) : (
                    <Navigate to="/login" />
                  )
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route path="*" element={<Navigate to={user ? (user.emailVerified ? "/chat" : "/login") : "/"} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;