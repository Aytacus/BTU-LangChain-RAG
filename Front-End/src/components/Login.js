import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import loginUser from "../firebase/loginUser";
import btuLogo from "../assets/btu-logo.png";
import turkishFlag from "../assets/Turkiye.png";
import englishFlag from "../assets/English.png";
import { useTheme } from '../utils/ThemeContext';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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
      loginTitle: "BTÜ Chatbot Girişi",
      email:"E-Posta",
      emailPlaceholder: "ornek@btu.edu.tr/@ogr.btu.edu.tr",
      password:"Şifre",
      passwordPlaceholder: "••••••••",
      forgotPassword: "Şifremi unuttum",
      loginButton: "Giriş Yap",
      loginError: "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.",
      noAccount: "Hesabın yok mu?",
      register: "Kayıt Ol",
      resendPrompt: "Doğrulama e-postası almadınız mı?",
      resendLink: "Tekrar gönder"
    },
    english: {
      loginTitle: "BTU Chatbot Login",
      email:"Email",
      emailPlaceholder: "example@btu.edu.tr/@ogr.btu.edu.tr",
      password:"Password",
      passwordPlaceholder: "••••••••",
      forgotPassword: "Forgot Password",
      loginButton: "Login",
      loginError: "Login failed. Please check your credentials.",
      noAccount: "Don't have an account?",
      register: "Register",
      resendPrompt: "Didn't receive verification email?",
      resendLink: "Resend"
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
  
    try {
      const result = await loginUser(email, password, language);
      if (result.success) {
        navigate("/chat");
      } else {
        if (
          result.error === "Bu e-posta adresine ait kullanıcı bulunamadı." ||
          result.error === "No user found with this email address." ||
          result.error === "Kullanıcı bulunamadı." ||
          result.error === "User not found."
        ) {
          setErrorMessage(
            language === "turkish"
              ? "Emailiniz bulunamadı, hesap oluşturun."
              : "Your email was not found, please create an account."
          );
        } else {
          setErrorMessage(result.error || translations[language].loginError);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
        {translations[language].loginTitle}
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

      <form 
        onSubmit={handleLogin} 
        autoComplete="off"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          width: '100%',
          maxWidth: 'min(300px, 90vw)',
          marginTop: '10px'
        }}
      >
        {/* Gizli honeypot alanları - tarayıcıları yanıltmak için */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          style={{
            position: 'absolute',
            left: '-9999px',
            opacity: 0,
            height: 0,
            width: 0
          }}
          tabIndex="-1"
        />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          style={{
            position: 'absolute',
            left: '-9999px',
            opacity: 0,
            height: 0,
            width: 0
          }}
          tabIndex="-1"
        />

        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: 'clamp(12px, 3vw, 14px)',
            color: theme.text
          }}>
            {translations[language].email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email-input"
            id="login-email-field"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
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

        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: 'clamp(12px, 3vw, 14px)',
            color: theme.text
          }}>
            {translations[language].password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password-input"
            id="login-password-field"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            style={{
              width: '100%',
              padding: 'clamp(10px, 3vw, 12px)',
              border: `1px solid ${theme.input.border}`,
              borderRadius: '6px',
              fontSize: 'clamp(14px, 4vw, 16px)',
              backgroundColor: theme.input.background,
              color: theme.input.text
            }}
            placeholder={translations[language].passwordPlaceholder}
            required
          />
          <div style={{ textAlign: 'right', marginTop: '8px' }}>
            <button 
              type="button"
              onClick={() => navigate("/ForgotPassword")}
              style={{
                background: 'none',
                border: 'none',
                color: theme.primary,
                fontSize: 'clamp(12px, 3vw, 14px)',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              {translations[language].forgotPassword}
            </button>
          </div>
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
          {isLoading ? 'Giriş Yapılıyor...' : translations[language].loginButton}
        </button>
      </form>

      <div style={{ 
        textAlign: 'center',
        color: theme.textSecondary,
        fontSize: 'clamp(12px, 3vw, 14px)',
        marginTop: '10px'
      }}>
        <span>{translations[language].noAccount} </span>
        <button
          onClick={() => navigate("/register")}
          style={{
            background: 'none',
            border: 'none',
            color: theme.primary,
            cursor: 'pointer',
            fontSize: 'clamp(12px, 3vw, 14px)',
            padding: '4px 8px'
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

export default Login;