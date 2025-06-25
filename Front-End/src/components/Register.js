import React, { useState } from 'react';
import { auth } from '../firebase/authConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import btuLogo from '../assets/btu-logo.png';
import turkishFlag from "../assets/Turkiye.png";
import englishFlag from "../assets/English.png";
import { useTheme } from '../utils/ThemeContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("turkish");
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email.includes("@btu.edu.tr") && !email.includes("@ogr.btu.edu.tr")) {
      setError(
        language === "turkish"
          ? "Lütfen geçerli bir BTÜ e-posta adresi giriniz (@btu.edu.tr veya @ogr.btu.edu.tr)"
          : "Please enter a valid BTÜ email address (@btu.edu.tr or @ogr.btu.edu.tr)"
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(
        language === "turkish"
          ? "Şifreler eşleşmiyor"
          : "Passwords do not match"
      );
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      navigate('/login');
    } catch (error) {
      setError(
        language === "turkish"
          ? "Kayıt işlemi başarısız oldu: " + error.message
          : "Registration failed: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const translations = {
    turkish: {
      register: "Kayıt Ol",
      email: "E-posta",
      password: "Şifre",
      confirmPassword: "Şifre Tekrar",
      registerButton: "Kayıt Ol",
      haveAccount: "Zaten hesabınız var mı?",
      login: "Giriş Yap"
    },
    english: {
      register: "Register",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      registerButton: "Register",
      haveAccount: "Already have an account?",
      login: "Login"
    }
  };

  return (
    <div style={{
      height: '100vh',
      boxSizing: 'border-box',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: error ? 'flex-start' : 'center', // Hata varsa üstten başlat
      backgroundColor: isDarkMode ? '#1F2937' : '#f5faff',
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
      gap: '20px',
      padding: error ? '80px 0 20px 0' : '0', // Hata varsa üstten padding ekle
      paddingLeft: '20px',
      paddingRight: '20px',
      color: isDarkMode ? '#ffffff' : '#000000',
      overflow: 'auto' // Scroll ekle
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
          fontSize: '1.5rem',
          padding: '10px',
          color: isDarkMode ? '#ffffff' : '#000000',
          zIndex: 9999
        }}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <img 
        src={btuLogo} 
        alt="BTÜ Logo" 
        style={{ 
          width: error ? '120px' : '200px', // Hata varsa logo küçült
          height: 'auto',
          maxWidth: '100%',
          transition: 'width 0.3s ease' // Smooth geçiş
        }} 
      />
      <h1 style={{ 
        fontSize: error ? '20px' : '24px', // Hata varsa başlık küçült
        fontWeight: '500', 
        color: isDarkMode ? '#ffffff' : '#000000',
        textAlign: 'center',
        transition: 'font-size 0.3s ease' // Smooth geçiş
      }}>
        {translations[language].register}
      </h1>
      
      {error && (
        <div style={{
          backgroundColor: isDarkMode ? '#4B5563' : '#ffebee',
          borderLeft: '4px solid #f44336',
          padding: '12px',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '300px',
          display: 'flex',
          alignItems: 'center',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ color: isDarkMode ? '#ffffff' : '#d32f2f', fontSize: '14px' }}>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} autoComplete="off" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '100%',
        maxWidth: '300px'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            color: isDarkMode ? '#ffffff' : '#333'
          }}>
            {translations[language].email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            id="register-email"
            autoComplete="username"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000'
            }}
            placeholder="ornek@btu.edu.tr/@ogr.btu.edu.tr"
            required
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            color: isDarkMode ? '#ffffff' : '#333'
          }}>
            {translations[language].password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="new-password"
            id="register-password"
            autoComplete="new-password"
            data-form-type="password"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000'
            }}
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            color: isDarkMode ? '#ffffff' : '#333'
          }}>
            {translations[language].confirmPassword}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            name="confirm-password"
            id="register-confirm-password"
            autoComplete="new-password"
            data-form-type="password"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000'
            }}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#00a99d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Kayıt Yapılıyor...' : translations[language].registerButton}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <span style={{ color: isDarkMode ? '#9CA3AF' : '#666' }}>{translations[language].haveAccount} </span>
        <button 
          onClick={() => navigate("/login")}
          style={{
            background: 'none',
            border: 'none',
            color: isDarkMode ? '#60A5FA' : '#0066cc',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {translations[language].login}
        </button>
      </div>

      {/* Language selection buttons */}
      <div style={{ position: 'absolute', top: '30px', right: '30px', display: 'flex', gap: '6px', zIndex: 20, maxWidth: 'calc(100vw - 40px)' }}>
        <button
          onClick={() => handleLanguageChange("turkish")}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '3px',
            opacity: language === 'turkish' ? 1 : 0.6,
            transition: 'opacity 0.3s'
          }}
        >
          <img
            src={turkishFlag}
            alt="Turkish"
            style={{
              width: '24px',
              height: '16px',
              objectFit: 'cover',
              border: language === 'turkish' ? '2px solid #0066cc' : 'none',
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
            padding: '3px',
            opacity: language === 'english' ? 1 : 0.6,
            transition: 'opacity 0.3s'
          }}
        >
          <img
            src={englishFlag}
            alt="English"
            style={{
              width: '24px',
              height: '16px',
              objectFit: 'cover',
              border: language === 'english' ? '2px solid #0066cc' : 'none',
              borderRadius: '3px'
            }}
          />
        </button>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Register;