import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/authConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import btuLogo from '../assets/btu-logo.png';
import turkishFlag from "../assets/Turkiye.png";
import englishFlag from "../assets/English.png";
import { useTheme } from '../utils/ThemeContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("turkish");
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, theme } = useTheme();

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.includes("@btu.edu.tr") && !email.includes("@ogr.btu.edu.tr")) {
      setErrorMessage(
        language === "turkish"
          ? "Lütfen geçerli bir BTÜ e-posta adresi giriniz (@btu.edu.tr veya @ogr.btu.edu.tr)"
          : "Please enter a valid BTÜ email address (@btu.edu.tr or @ogr.btu.edu.tr)"
      );
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(
        language === "turkish"
          ? "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
          : "Password reset link has been sent to your email address."
      );
    } catch (error) {
      setErrorMessage(
        language === "turkish"
          ? "Şifre sıfırlama işlemi başarısız oldu: " + error.message
          : "Password reset failed: " + error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const translations = {
    turkish: {
      passwordReset: "Şifre Sıfırlama",
      emailLabel: "BTÜ E-posta Adresi",
      emailPlaceholder: "ornek@btu.edu.tr/ornek@ogr.btu.edu.tr",
      resetButton: "Şifremi Sıfırla",
      returnToLogin: "Giriş ekranına dön"
    },
    english: {
      passwordReset: "Password Reset",
      emailLabel: "BTU Email Address",
      emailPlaceholder: "example@btu.edu.tr/@ogr.btu.edu.tr",
      resetButton: "Reset Password",
      returnToLogin: "Return to Login"
    }
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
        {translations[language].passwordReset}
      </h1>

      {errorMessage && (
        <div style={{
          backgroundColor: theme.errorBackground,
          borderLeft: `4px solid ${theme.error}`,
          padding: 'clamp(8px, 2vw, 12px)',
          borderRadius: '4px',
          width: '100%',
          maxWidth: 'min(300px, 90vw)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ 
            color: theme.error,
            fontSize: 'clamp(12px, 3vw, 14px)'
          }}>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div style={{
          backgroundColor: theme.successBackground,
          borderLeft: `4px solid ${theme.success}`,
          padding: 'clamp(8px, 2vw, 12px)',
          borderRadius: '4px',
          width: '100%',
          maxWidth: 'min(300px, 90vw)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ 
            color: theme.success,
            fontSize: 'clamp(12px, 3vw, 14px)'
          }}>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '100%',
        maxWidth: 'min(300px, 90vw)',
        marginTop: '10px'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: 'clamp(12px, 3vw, 14px)',
            color: theme.text
          }}>
            {translations[language].emailLabel}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: 'clamp(10px, 3vw, 12px)',
              border: `1px solid ${theme.input.border}`,
              borderRadius: '6px',
              fontSize: 'clamp(14px, 4vw, 16px)',
              backgroundColor: theme.input.background,
              color: theme.input.text
            }}
            placeholder={translations[language].emailPlaceholder}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
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
            opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {isLoading ? 'Gönderiliyor...' : translations[language].resetButton}
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{
            background: 'none',
            border: 'none',
            color: theme.primary,
            fontSize: 'clamp(12px, 3vw, 14px)',
            cursor: 'pointer',
            marginTop: '10px',
            padding: '4px 8px'
          }}
        >
          &larr; {translations[language].returnToLogin}
        </button>
      </form>

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

export default ForgotPassword;
