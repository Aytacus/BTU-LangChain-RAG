import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { auth } from "../firebase/firebase"; // Removed unused import
import btuLogo from "../assets/btu-logo.png";
import turkishFlag from "../assets/Turkiye.png";
import englishFlag from "../assets/English.png";
import { useTheme } from '../utils/ThemeContext';

const HomePage = () => {
  const [language, setLanguage] = useState("turkish");
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, theme } = useTheme();

  const translations = {
    turkish: {
      welcome: "BTÜ Chatbot'a Hoşgeldiniz",
      login: "Giriş Yap",
      register: "Kayıt Ol"
    },
    english: {
      welcome: "Welcome to BTU Chatbot",
      login: "Login",
      register: "Register"
    }
  };

  useEffect(() => {
    // Sayfa yüklendiğinde dil tercihini localStorage'dan al
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang); // Dil tercihine göre localStorage'ı güncelle
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: theme.background,
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
      gap: '20px',
      padding: '20px',
      color: theme.text,
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
          padding: '5px',
          color: theme.text,
          zIndex: 10
        }}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <img 
        src={btuLogo} 
        alt="BTÜ Logo" 
        style={{ 
          width: 'clamp(150px, 40vw, 200px)', 
          height: 'auto',
          maxWidth: '100%',
          marginTop: '60px'
        }} 
      />

      <h1 style={{ 
        fontSize: 'clamp(20px, 5vw, 24px)', 
        fontWeight: '500', 
        color: theme.text,
        textAlign: 'center',
        margin: '10px 0'
      }}>
        {translations[language].welcome}
      </h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '100%',
        maxWidth: 'min(300px, 90vw)',
        marginTop: '20px'
      }}>
        <button
          onClick={() => navigate("/login")}
          style={{
            width: '100%',
            padding: 'clamp(10px, 3vw, 12px)',
            backgroundColor: theme.button.primary,
            color: theme.button.text,
            border: 'none',
            borderRadius: '6px',
            fontSize: 'clamp(14px, 4vw, 16px)',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {translations[language].login}
        </button>

        <button
          onClick={() => navigate("/register")}
          style={{
            width: '100%',
            padding: 'clamp(10px, 3vw, 12px)',
            backgroundColor: theme.button.secondary,
            color: theme.button.text,
            border: 'none',
            borderRadius: '6px',
            fontSize: 'clamp(14px, 4vw, 16px)',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {translations[language].register}
        </button>
      </div>

      {/* Language selection buttons */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        display: 'flex', 
        gap: '10px',
        zIndex: 10
      }}>
        <button
          onClick={() => handleLanguageChange("turkish")}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            opacity: language === 'turkish' ? 1 : 0.6,
            transition: 'opacity 0.3s'
          }}
        >
          <img
            src={turkishFlag}
            alt="Turkish"
            style={{
              width: 'clamp(25px, 6vw, 30px)',
              height: 'clamp(16px, 4vw, 20px)',
              objectFit: 'cover',
              border: language === 'turkish' ? `2px solid ${theme.primary}` : 'none',
              borderRadius: '3px'
            }}
          />
        </button>
        <button
          onClick={() => handleLanguageChange("english")}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            opacity: language === 'english' ? 1 : 0.6,
            transition: 'opacity 0.3s'
          }}
        >
          <img
            src={englishFlag}
            alt="English"
            style={{
              width: 'clamp(25px, 6vw, 30px)',
              height: 'clamp(16px, 4vw, 20px)',
              objectFit: 'cover',
              border: language === 'english' ? `2px solid ${theme.primary}` : 'none',
              borderRadius: '3px'
            }}
          />
        </button>
      </div>
    </div>
  );
};

export default HomePage;
