import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import btuLogo from "../assets/btu-logo.png";
import registerUser from "../firebase/registerUser";
import turkishFlag from "../assets/Turkiye.png";
import englishFlag from "../assets/English.png";
import { useTheme } from '../utils/ThemeContext';

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
  
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const translations = {
    turkish: {
      signupTitle: "BTÜ Chatbot Kayıt Ol",
      emailLabel: "BTÜ E-posta Adresi",
      emailplaceholder: "ornek@btu.edu.tr/@ogr.btu.edu.tr",
      passwordLabel: "Şifre (en az 6 karakter)",
      confirmPasswordLabel: "Şifre Tekrar",
      passwordMismatch: "Şifreler eşleşmiyor",
      registerButton: "Kayıt Ol",
      loginLink: "Zaten hesabınız var mı? Giriş Yap",
      verificationSent: "Doğrulama e-postası gönderildi. Lütfen e-postanızı kontrol edin ve doğrulayın yoksa 5 dakika içinde hesabınız silenecek.",
      proceedToLogin: "Giriş sayfasına git",
      loadingregister: "Kayıt Yapılıyor..."
    },
    english: {
      signupTitle: "BTU Chatbot Signup",
      emailLabel: "BTU Email Address",
      emailplaceholder: "example@btu.edu.tr/@ogr.btu.edu.tr",
      passwordLabel: "Password (at least 6 characters)",
      confirmPasswordLabel: "Confirm Password",
      passwordMismatch: "Passwords do not match",
      registerButton: "Register",
      loginLink: "Already have an account? Login",
      verificationSent: "Verification email sent. Please check your email and verify your account in 5 minutes or your account will be deleted.",
      proceedToLogin: "Go to login page",
      loadingregister: "Registering..."
    }
  };
  
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setErrorMessage(translations[language].passwordMismatch);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
     await registerUser(email, password, language);
      // Kayıt başarılı, doğrulama e-postası gönderildi
      setSuccessMessage(translations[language].verificationSent);
      // Formları temizle
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Hata mesajı varsa layout'u yukarı kaydır
  const hasError = errorMessage || successMessage;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: hasError ? 'flex-start' : 'center',
      minHeight: '100vh',
      backgroundColor: theme.background,
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
      gap: hasError ? '18px' : '20px', // Daha az küçültme
      padding: '20px',
      paddingTop: hasError ? '30px' : '20px', // Daha az padding
      paddingBottom: hasError ? '40px' : '20px',
      color: theme.text,
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'auto'
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
          width: hasError ? 'clamp(140px, 35vw, 180px)' : 'clamp(150px, 40vw, 200px)', // Daha az küçültme
          height: 'auto',
          maxWidth: '100%',
          marginTop: hasError ? '10px' : '60px' // Az bir margin bırak
        }} 
      />

      <h1 style={{ 
        fontSize: hasError ? 'clamp(19px, 4.5vw, 22px)' : 'clamp(20px, 5vw, 24px)', // Daha az küçültme
        fontWeight: '500', 
        color: theme.text,
        textAlign: 'center',
        margin: hasError ? '8px 0' : '10px 0' // Az bir margin küçültme
      }}>
        {translations[language].signupTitle}
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

      {successMessage ? (
        <div style={{
          backgroundColor: theme.successBackground,
          borderLeft: `4px solid ${theme.success}`,
          padding: 'clamp(8px, 2vw, 12px)',
          borderRadius: '4px',
          width: '100%',
          maxWidth: 'min(300px, 90vw)',
          marginBottom: '20px'
        }}>
          <p style={{ 
            color: theme.success, 
            marginBottom: '15px',
            fontSize: 'clamp(12px, 3vw, 14px)'
          }}>{successMessage}</p>
          <button
            onClick={() => navigate("/login")}
            style={{
              backgroundColor: theme.button.primary,
              color: theme.button.text,
              border: 'none',
              borderRadius: '4px',
              padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 15px)',
              cursor: 'pointer',
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {translations[language].proceedToLogin}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSignup} autoComplete="off" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: hasError ? '13px' : '15px', // Daha az gap küçültme
          width: '100%',
          maxWidth: 'min(300px, 90vw)',
          marginTop: hasError ? '8px' : '10px' // Az bir margin küçültme
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
              name="email"
              id="signup-email"
              autoComplete="username"
              style={{
                width: '100%',
                padding: 'clamp(10px, 3vw, 12px)',
                border: `1px solid ${theme.input.border}`,
                borderRadius: '6px',
                fontSize: 'clamp(14px, 4vw, 16px)',
                backgroundColor: theme.input.background,
                color: theme.input.text
              }}
              placeholder={translations[language].emailplaceholder}
              required
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: 'clamp(12px, 3vw, 14px)',
              color: theme.text
            }}>
              {translations[language].passwordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="new-password"
              id="signup-password"
              autoComplete="new-password"
              data-form-type="password"
              data-lpignore="true"
              data-1p-ignore="true"
              style={{
                width: '100%',
                padding: 'clamp(10px, 3vw, 12px)',
                border: `1px solid ${theme.input.border}`,
                borderRadius: '6px',
                fontSize: 'clamp(14px, 4vw, 16px)',
                backgroundColor: theme.input.background,
                color: theme.input.text
              }}
              placeholder="••••••••"
              minLength="6"
              required
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: 'clamp(12px, 3vw, 14px)',
              color: theme.text
            }}>
              {translations[language].confirmPasswordLabel}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              name="confirm-password"
              id="signup-confirm-password"
              autoComplete="new-password"
              data-form-type="password"
              data-lpignore="true"
              data-1p-ignore="true"
              style={{
                width: '100%',
                padding: 'clamp(10px, 3vw, 12px)',
                border: `1px solid ${theme.input.border}`,
                borderRadius: '6px',
                fontSize: 'clamp(14px, 4vw, 16px)',
                backgroundColor: theme.input.background,
                color: theme.input.text
              }}
              placeholder="••••••••"
              minLength="6"
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
            {isLoading ? translations[language].loadingregister : translations[language].registerButton}
          </button>

          <div style={{ 
            textAlign: 'center',
            color: theme.textSecondary,
            fontSize: 'clamp(12px, 3vw, 14px)',
            marginTop: '10px'
          }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                background: 'none',
                border: 'none',
                color: theme.primary,
                cursor: 'pointer',
                fontSize: 'clamp(12px, 3vw, 14px)',
                padding: '4px 8px'
              }}
            >
              {translations[language].loginLink}
            </button>
          </div>
        </form>
      )}

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

export default Signup;