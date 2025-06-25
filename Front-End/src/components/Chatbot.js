import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/authConfig";
import {Timestamp} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  getChatSessions,
  getChatMessages,
  saveChatMessage,
  createChatSession,
  deleteChatSession,
  updateSessionTitle,
  listenChatMessages
} from "./firebaseFunctions";
import btuLogo from "../assets/btu-logo.png";
import { useTheme } from '../utils/ThemeContext';
import "./Chatbot.css";

const Chatbot = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("turkish");
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [chatTitle, setChatTitle] = useState("Yeni Sohbet");
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [messageLoading, setMessageLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ show: false, sessionId: null });
  const [editTitleDialog, setEditTitleDialog] = useState({ show: false, title: '' });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Textarea için otomatik scroll fonksiyonu
  const handleTextareaInput = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [activeSessionId, messages.length, messageLoading]);

  useEffect(() => {
    const storedLang = localStorage.getItem("language");
    setLanguage(storedLang === "english" ? "english" : "turkish");
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Ekran boyutu değiştiğinde sidebar açıksa kapat
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const texts = {
    turkish: {
      title: "BTÜ Asistan",
      welcome: "BTÜ Asistan'a hoş geldiniz!",
      placeholder: "Mesaj yazın...",
      send: "Gönder",
      logout: "Çıkış",
      error: "Yanıt alınamadı.",
      newChat: "Yeni Sohbet",
      delete: "Sil",
      faq: {
        title: "Sıkça Sorulan Sorular",
        imep: "BTÜ İMEP Hakkında Bilgi",
        internship: "BTÜ Staj Hakkında Bilgi",
        btu: "BTÜ Hakkında Bilgi"
      }
    },
    english: {
      title: "BTU Assistant",
      welcome: "Welcome to BTU Assistant!",
      placeholder: "Type a message...",
      send: "Send",
      logout: "Logout",
      error: "Could not retrieve response.",
      newChat: "New Chat",
      delete: "Delete",
      faq: {
        title: "Frequently Asked Questions",
        imep: "About BTU IMEP",
        internship: "About BTU Internship",
        btu: "About BTU"
      }
    }
  };

  const t = texts[language];

  const renderMessageContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
      const pdfRegex = /([\wÇçĞğİıÖöŞşÜü ,\-]+\.pdf)/g;
      const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)(?![^<]*>|[^\[]*\])/g;
      let lastIndex = 0;
      const elements = [];
      let match;
      let markdownLinks = [];
      // Önce markdown linkleri işle ve url'lerini topla
      while ((match = markdownLinkRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          elements.push(line.slice(lastIndex, match.index));
        }
        elements.push(
          <a
            key={i + '-mdlink-' + match.index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#2563eb',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {match[1]}
          </a>
        );
        markdownLinks.push(match[2]);
        lastIndex = match.index + match[0].length;
      }
      // Sonrasında kalan kısmı eski pdf ve url mantığıyla işle
      let rest = line.slice(lastIndex);
      // PDF linklerini işle
      let pdfLast = 0;
      while ((match = pdfRegex.exec(rest)) !== null) {
        if (match.index > pdfLast) {
          let before = rest.slice(pdfLast, match.index);
          // URL'leri işle
          let urlMatch, urlLast = 0;
          while ((urlMatch = urlRegex.exec(before)) !== null) {
            // Eğer bu url markdown linkte geçtiyse tekrar gösterme
            if (markdownLinks.includes(urlMatch[1])) {
              urlLast = urlMatch.index + urlMatch[1].length;
              continue;
            }
            if (urlMatch.index > urlLast) {
              elements.push(before.slice(urlLast, urlMatch.index));
            }
            elements.push(
              <a
                key={i + '-url-' + urlMatch.index}
                href={urlMatch[1]}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#2563eb',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {urlMatch[1]}
              </a>
            );
            urlLast = urlMatch.index + urlMatch[1].length;
          }
          if (urlLast < before.length) {
            elements.push(before.slice(urlLast));
          }
        }
        const pdfText = match[1];
        const pdfUrl = `${window.location.origin}/documents/${pdfText.trim()}`;
        elements.push(
          <a
            key={i + '-pdf-' + match.index}
            href={encodeURI(pdfUrl)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#2563eb',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {pdfText}
          </a>
        );
        pdfLast = match.index + pdfText.length;
      }
      // Satırın kalanında URL var mı kontrol et
      if (pdfLast < rest.length) {
        let after = rest.slice(pdfLast);
        let urlMatch, urlLast = 0;
        while ((urlMatch = urlRegex.exec(after)) !== null) {
          // Eğer bu url markdown linkte geçtiyse tekrar gösterme
          if (markdownLinks.includes(urlMatch[1])) {
            urlLast = urlMatch.index + urlMatch[1].length;
            continue;
          }
          if (urlMatch.index > urlLast) {
            elements.push(after.slice(urlLast, urlMatch.index));
          }
          elements.push(
            <a
              key={i + '-url-rest-' + urlMatch.index}
              href={urlMatch[1]}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#2563eb',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {urlMatch[1]}
            </a>
          );
          urlLast = urlMatch.index + urlMatch[1].length;
        }
        if (urlLast < after.length) {
          elements.push(after.slice(urlLast));
        }
      }
      return <div key={i}>{elements.length > 0 ? elements : line}</div>;
    });
  };

  // Yeni sohbet başlatma
  const handleNewChat = useCallback(async () => {
    if (!auth.currentUser || messageLoading) return;

    try {
      setLoading(true);
      const newSessionId = await createChatSession(auth.currentUser.uid);
      // Dil bilgisini localStorage'dan al
      const lang = localStorage.getItem("language") || "turkish";
      const tNewChat = texts[lang]?.newChat || "Yeni Sohbet";
      const newSession = {
        id: newSessionId,
        title: tNewChat,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSessionId);
      setMessages([]);
      setQuestion("");
      // URL'yi sadece görsel olarak güncelle (gerçek routing yapmadan)
      window.history.replaceState(null, '', `/chat/${newSessionId}`);
      inputRef.current?.focus();
    } catch (error) {
      console.error("Yeni sohbet oluşturma hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [language, messageLoading]);

  // Kullanıcı oturumunu takip etme
  useEffect(() => {
    let unsubscribeMessages;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return navigate("/login");
      try {
        // 1. Tüm session'ları çek
        const userSessions = await getChatSessions(user.uid);
        // 2. Mesajsız session'ları bul ve sil
        for (const session of userSessions) {
          const msgs = await getChatMessages(user.uid, session.id);
          if (msgs.length === 0) {
            await deleteChatSession(user.uid, session.id);
          }
        }
        // 3. Temizlenmiş session'ları tekrar çek
        const cleanedSessions = await getChatSessions(user.uid);
        setSessions(cleanedSessions);
        
        // 4. Yeni sohbet aç
        await handleNewChat();
      } catch (error) {
        console.error("Oturum yükleme hatası:", error);
      }
    });
    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      unsubscribe();
    };
    // eslint-disable-next-line
  }, [navigate]);

  // Farklı bir sohbet oturumuna geçiş
  const handleSessionSelect = async (id) => {
    if (!auth.currentUser || id === activeSessionId) return;
    setLoading(true);
    setActiveSessionId(id);
    // URL'yi sadece görsel olarak güncelle (gerçek routing yapmadan)
    window.history.replaceState(null, '', `/chat/${id}`);
    // Mesajları gerçek zamanlı dinle
    if (window._unsubscribeMessages) window._unsubscribeMessages();
    window._unsubscribeMessages = listenChatMessages(auth.currentUser.uid, id, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
  };

  // Sohbet oturumunu silme
  const handleDeleteSession = (id) => {
    if (messageLoading) return;
    setDeleteConfirmDialog({ show: true, sessionId: id });
  };

  const confirmDelete = async () => {
    if (!auth.currentUser || !deleteConfirmDialog.sessionId) return;
    try {
      setLoading(true);
      await deleteChatSession(auth.currentUser.uid, deleteConfirmDialog.sessionId);
      setSessions(prev => prev.filter(s => s.id !== deleteConfirmDialog.sessionId));
      if (deleteConfirmDialog.sessionId === activeSessionId) {
        if (sessions.length > 1) {
          const newActive = sessions.find(s => s.id !== deleteConfirmDialog.sessionId);
          setActiveSessionId(newActive.id);
          // URL'yi sadece görsel olarak güncelle (gerçek routing yapmadan)
          window.history.replaceState(null, '', `/chat/${newActive.id}`);
          const msgs = await getChatMessages(auth.currentUser.uid, newActive.id);
          setMessages(msgs);
        } else {
          await handleNewChat();
        }
      }
    } catch (error) {
      console.error("Oturum silme hatası:", error);
    } finally {
      setLoading(false);
      setDeleteConfirmDialog({ show: false, sessionId: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmDialog({ show: false, sessionId: null });
  };

  // Kullanıcı sorusunu gönderme
  const askQuestion = async () => {
    const questionText = question.trim();
    if (!questionText || loading || messageLoading) return;

    const currentSessionId = activeSessionId;
    setLoading(true);
    setMessageLoading(true);
    setQuestion('');

    const currentMessages = [...messages];
    const userMessage = { role: 'user', content: questionText };
    const newMessages = [...currentMessages, userMessage];

    // Kullanıcı mesajını hemen göster
    setMessages(newMessages);

    // Scroll işlemini hemen yap
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 50);

    try {
      await saveChatMessage(auth.currentUser.uid, currentSessionId, {
        ...userMessage,
        timestamp: Timestamp.now() 
      });
  
      const BASE = "/api";
      const res = await fetch(`${BASE}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.currentUser.uid}`
        },
        body: JSON.stringify({ query: questionText })
      });
  
      if (!res.ok) throw new Error("API error: " + res.status);
  
      const data = await res.json();
      const botResponse = data.response || t.error;
      
      const botMsg = {
        role: "bot",
        content: String(botResponse),
        timestamp: new Date().toLocaleTimeString() 
      };
      
      setMessages(prev => [...prev, botMsg]);
      
      await saveChatMessage(auth.currentUser.uid, currentSessionId, {
        ...botMsg,
        timestamp: Timestamp.now() 
      });

      // Bot mesajından sonra da scroll yap
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
  
    } catch (error) {
      console.error("Hata:", error);
      const errorMsg = {
        role: "bot",
        content: t.error,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
      await saveChatMessage(auth.currentUser.uid, currentSessionId, {
        ...errorMsg,
        timestamp: Timestamp.now()
      });
    } finally {
      setMessageLoading(false);
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    const updateTitle = async () => {
      // Aktif oturumun başlığını bul
      const activeSession = sessions.find(s => s.id === activeSessionId);
      const currentTitle = activeSession?.title || chatTitle;
      // Sadece başlık 'Yeni Sohbet' veya 'New Chat' ise ve en az 2 kullanıcı mesajı varsa
      const userMessages = messages.filter(m => m.role === "user");
      if ((currentTitle === "Yeni Sohbet" || currentTitle === "New Chat") && userMessages.length >= 2) {
        try {
          // Son 3 kullanıcı mesajını al
          const lastUserMessages = userMessages.slice(-3).map(m => m.content);
          const BASE = "/api";
          const response = await fetch(`${BASE}/generate_title`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: lastUserMessages })
          });
          const data = await response.json();
          
          if (data.title && auth.currentUser) {
            // Firebase'de başlığı güncelle
            await updateSessionTitle(auth.currentUser.uid, activeSessionId, data.title);
            // UI'da başlığı güncelle
            setSessions(prev => prev.map(s => 
              s.id === activeSessionId ? { ...s, title: data.title } : s
            ));
            setChatTitle(data.title);
          }
        } catch (error) {
          console.error("Başlık güncelleme hatası:", error);
        }
      }
    };

    updateTitle();
  }, [messages, sessions, activeSessionId]);

  const handleEditTitle = async (newTitle) => {
    if (!auth.currentUser || !activeSessionId || !newTitle.trim()) return;
    try {
      await updateSessionTitle(auth.currentUser.uid, activeSessionId, newTitle);
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId ? { ...s, title: newTitle } : s
      ));
      setEditTitleDialog({ show: false, title: '' });
    } catch (error) {
      console.error("Başlık güncelleme hatası:", error);
    }
  };

  const handleFAQClick = async (question) => {
    if (!auth.currentUser || !activeSessionId) return;
  
    try {
      setMessageLoading(true);
      setLoading(true);
      
      const userMsg = {
        role: "user",
        content: question,
        timestamp: new Date().toLocaleTimeString() 
      };
      
      setMessages(prev => [...prev, userMsg]);
      
      await saveChatMessage(auth.currentUser.uid, activeSessionId, {
        ...userMsg,
        timestamp: Timestamp.now() 
      });
  
      // Kullanıcı mesajından sonra scroll
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 50);
  
      const BASE = "/api";
      const res = await fetch(`${BASE}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.currentUser.uid}`
        },
        body: JSON.stringify({ query: question })
      });
  
      if (!res.ok) throw new Error("API error: " + res.status);
  
      const data = await res.json();
      const botResponse = data.response || t.error;
      
      const botMsg = {
        role: "bot",
        content: String(botResponse),
        timestamp: new Date().toLocaleTimeString() 
      };
      
      setMessages(prev => [...prev, botMsg]);
      
      await saveChatMessage(auth.currentUser.uid, activeSessionId, {
        ...botMsg,
        timestamp: Timestamp.now() 
      });
  
      // Bot mesajından sonra da scroll yap
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
  
    } catch (error) {
      console.error("Hata:", error);
      const errorMsg = {
        role: "bot",
        content: t.error,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
      await saveChatMessage(auth.currentUser.uid, activeSessionId, {
        ...errorMsg,
        timestamp: Timestamp.now()
      });
    } finally {
      setMessageLoading(false);
      setLoading(false);
    }
  };

  // Logout sırasında boş sohbeti sil
  const handleLogout = async () => {
    if (auth.currentUser && activeSessionId && messages.length === 0) {
      await deleteChatSession(auth.currentUser.uid, activeSessionId);
    }
    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }, [isSidebarOpen]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: theme.background,
      color: theme.text,
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif"
    }}>
      {/* Hamburger Menü - Sadece mobilde göster */}
      {windowWidth < 768 && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="hamburger-menu"
          style={{
            position: 'fixed',
            top: 6,
            left: 15,
            zIndex: 4000,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 28,
            color: theme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '6px'
          }}
          aria-label="Menüyü Aç"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="6" width="28" height="2.5" rx="1.25" fill="currentColor"/>
            <rect y="13" width="28" height="2.5" rx="1.25" fill="currentColor"/>
            <rect y="20" width="28" height="2.5" rx="1.25" fill="currentColor"/>
          </svg>
        </button>
      )}
      {/* Masaüstü hamburger menü (isteğe bağlı, eğer masaüstünde de açılır sidebar isteniyorsa) */}
      {windowWidth >= 768 && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="desktop-hamburger-menu"
          style={{
            position: 'fixed',
            top: 9,
            left: 20,
            zIndex: 4000,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 28,
            color: theme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '6px'
          }}
          aria-label="Menüyü Aç"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="6" width="28" height="2.5" rx="1.25" fill="currentColor"/>
            <rect y="13" width="28" height="2.5" rx="1.25" fill="currentColor"/>
            <rect y="20" width="28" height="2.5" rx="1.25" fill="currentColor"/>
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div className={`sidebar${isSidebarOpen ? ' open' : ''}`} style={{
        backgroundColor: theme.sidebar.background,
        borderRight: undefined,
        display: isSidebarOpen ? 'flex' : 'none',
        flexDirection: 'column',
        padding: '20px',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 3000,
        width: window.innerWidth < 768 ? '100vw' : '320px',
        maxWidth: window.innerWidth < 768 ? '100vw' : '320px',
        height: '100vh',
        boxShadow: undefined,
        overflowY: 'auto',
        transition: 'left 0.3s, width 0.3s',
      }}>
        {/* Close Button (Çarpı) */}
        <button
          className="close-sidebar-btn"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Kapat"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'none',
            border: 'none',
            fontSize: 28,
            color: theme.text,
            cursor: 'pointer',
            zIndex: 4001
          }}
        >
          ×
        </button>
        {/* User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          borderBottom: `1px solid ${theme.sidebar.border}`,
          marginBottom: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: theme.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.button.text,
            fontSize: '18px'
          }}>
            {auth.currentUser?.email?.split('@')[0]?.slice(-2) || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: theme.text }}>{auth.currentUser?.email}</div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: theme.primary,
                cursor: 'pointer',
                fontSize: '12px',
                padding: 0
              }}
            >
              {t.logout}
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          disabled={messageLoading}
          style={{
            backgroundColor: messageLoading ? theme.button.disabled : theme.button.primary,
            color: theme.button.text,
            border: 'none',
            borderRadius: '6px',
            padding: '10px',
            cursor: messageLoading ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: messageLoading ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
        >
          <span>+</span>
          {t.newChat}
        </button>

        {/* Chat Sessions */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          paddingBottom: '32px',
          boxSizing: 'border-box'
        }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => !messageLoading && handleSessionSelect(session.id)}
              style={{
                padding: '12px',
                borderRadius: '6px',
                cursor: messageLoading ? 'not-allowed' : 'pointer',
                backgroundColor: session.id === activeSessionId ? theme.sidebar.active : 'transparent',
                color: session.id === activeSessionId ? theme.sidebar.activeText : theme.sidebar.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                transition: 'background-color 0.2s',
                opacity: messageLoading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (session.id !== activeSessionId && !messageLoading) {
                  e.currentTarget.style.backgroundColor = theme.sidebar.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (session.id !== activeSessionId && !messageLoading) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{
                flex: 1,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                fontSize: '14px'
              }}>
                {session.title}
              </span>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!messageLoading) {
                      setEditTitleDialog({ 
                        show: true, 
                        title: session.title 
                      });
                    }
                  }}
                  disabled={messageLoading}
                  style={{
                    background: messageLoading ? 'transparent' : isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    border: messageLoading ? '1px solid rgba(128,128,128,0.3)' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
                    cursor: messageLoading ? 'not-allowed' : 'pointer',
                    fontSize: '1.2rem',
                    color: messageLoading ? (isDarkMode ? '#666' : '#ccc') : theme.text,
                    padding: '8px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: messageLoading ? 0.4 : 0.9,
                    transition: 'all 0.3s ease',
                    borderRadius: '8px',
                    flexShrink: 0,
                    boxShadow: messageLoading ? 'none' : isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!messageLoading) {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!messageLoading) {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ stroke: 'currentColor', strokeWidth: '2', fill: 'none' }}
                  >
                    <path 
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session.id);
                  }}
                  disabled={messageLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: messageLoading ? (isDarkMode ? '#666' : '#ccc') : theme.error,
                    cursor: messageLoading ? 'not-allowed' : 'pointer',
                    padding: '4px',
                    fontSize: '14px',
                    opacity: messageLoading ? 0.5 : 1
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: isDarkMode ? theme.chat.background : '#ffffff',
          marginLeft: (isSidebarOpen && window.innerWidth >= 768) ? 344 : 0,
          transition: 'margin-left 0.3s',
          overflow: 'hidden',
          minWidth: 0
        }}
      >
        {/* Chat Header */}
        <div className="chat-header" style={{
          borderBottom: `1px solid ${theme.chat.border}`,
          backgroundColor: theme.background,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: `15px 20px 15px ${isSidebarOpen ? '25px' : (windowWidth < 768 ? '60px' : '75px')}`,
          zIndex: 1000,
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
          minWidth: 0
        }}>
          <div style={{
            flex: 1,
            minWidth: 0,
            marginRight: '15px',
            overflow: 'hidden'
          }}>
            <h2 style={{
              margin: 0,
              color: theme.text,
              fontSize: windowWidth < 768 ? '16px' : '18px',
              fontWeight: '500',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
              maxWidth: '100%'
            }}>
              {sessions.find(s => s.id === activeSessionId)?.title || t.newChat}
            </h2>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            flexShrink: 0,
            minWidth: 'auto'
          }}>
            <button
              onClick={() => {
                if (!messageLoading) {
                  setEditTitleDialog({ 
                    show: true, 
                    title: sessions.find(s => s.id === activeSessionId)?.title || t.newChat 
                  });
                }
              }}
              disabled={messageLoading}
              style={{
                background: messageLoading ? 'transparent' : isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                border: messageLoading ? '1px solid rgba(128,128,128,0.3)' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
                cursor: messageLoading ? 'not-allowed' : 'pointer',
                fontSize: '1.2rem',
                color: messageLoading ? (isDarkMode ? '#666' : '#ccc') : theme.text,
                padding: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: messageLoading ? 0.4 : 0.9,
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                flexShrink: 0,
                boxShadow: messageLoading ? 'none' : isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                if (!messageLoading) {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!messageLoading) {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)';
                }
              }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ stroke: 'currentColor', strokeWidth: '2', fill: 'none' }}
              >
                <path 
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: theme.text,
                padding: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.8,
                transition: 'opacity 0.2s',
                borderRadius: '6px',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.backgroundColor = theme.button.hover || 'rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          className="chat-messages"
          ref={messagesContainerRef}
          style={{
            backgroundColor: isDarkMode ? theme.chat.background : '#ffffff',
            paddingBottom: windowWidth < 900 ? '140px' : undefined,
            marginBottom: windowWidth < 900 ? '0' : undefined
          }}
        >
          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme.textSecondary,
              opacity: 0.8
            }}>
              <img src={btuLogo} alt="BTÜ Logo" style={{ width: 120, height: 120, borderRadius: '50%', marginBottom: 24, opacity: 0.92, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }} />
              <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>{t.welcome}</div>
              <div style={{ fontSize: 14, marginBottom: 32 }}>{t.placeholder}</div>
              
              {/* FAQ Section */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '100%',
                maxWidth: '400px',
                padding: '0 20px'
              }}>
                <div style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: theme.text,
                  marginBottom: 8
                }}>
                  {t.faq.title}
                </div>
                <button
                  onClick={() => handleFAQClick(t.faq.imep)}
                  disabled={messageLoading}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: messageLoading ? theme.button.disabled : theme.button.primary,
                    color: theme.button.text,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: messageLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'opacity 0.2s',
                    fontSize: 14,
                    opacity: messageLoading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => !messageLoading && (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => !messageLoading && (e.currentTarget.style.opacity = '1')}
                >
                  {t.faq.imep}
                </button>
                <button
                  onClick={() => handleFAQClick(t.faq.internship)}
                  disabled={messageLoading}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: messageLoading ? theme.button.disabled : theme.button.primary,
                    color: theme.button.text,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: messageLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'opacity 0.2s',
                    fontSize: 14,
                    opacity: messageLoading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => !messageLoading && (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => !messageLoading && (e.currentTarget.style.opacity = '1')}
                >
                  {t.faq.internship}
                </button>
                <button
                  onClick={() => handleFAQClick(t.faq.btu)}
                  disabled={messageLoading}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: messageLoading ? theme.button.disabled : theme.button.primary,
                    color: theme.button.text,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: messageLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'opacity 0.2s',
                    fontSize: 14,
                    opacity: messageLoading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => !messageLoading && (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => !messageLoading && (e.currentTarget.style.opacity = '1')}
                >
                  {t.faq.btu}
                </button>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: '12px',
                  maxWidth: '88%',
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: message.role === 'user' ? '#7c3aed' : theme.primary,
                  color: theme.button.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 20,
                  flexShrink: 0
                }}>
                  {message.role === 'user' ? (auth.currentUser?.email?.split('@')[0]?.slice(-2) || 'U') : 'B'}
                </div>
                {/* Mesaj balonu */}
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: message.role === 'user' 
                    ? theme.message.userBackground 
                    : (isDarkMode 
                        ? theme.message.assistantBackground 
                        : '#f5f7fa'),
                  color: message.role === 'user' 
                    ? theme.message.userText 
                    : (isDarkMode 
                        ? theme.message.assistantText 
                        : '#222'),
                  boxShadow: message.role === 'bot' && !isDarkMode ? '0 1px 4px rgba(0,0,0,0.04)' : undefined,
                  border: message.role === 'bot' && !isDarkMode ? '1px solid #e3e6ea' : undefined,
                  maxWidth: '88%',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line',
                  overflowWrap: 'break-word',
                  marginLeft: message.role === 'user' ? 'auto' : undefined
                }}>
                  {renderMessageContent(message.content)}
                </div>
              </div>
            ))
          )}
          {messageLoading && (
            <div style={{
              display: 'flex',
              gap: '8px',
              alignSelf: 'flex-start',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: theme.message.assistantBackground,
              color: theme.message.assistantText
            }}>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          )}
        </div>
        
        {/* Divider */}
        <div className="input-area-divider"></div>
        {/* Input Area */}
        <div className="input-area" style={{
          backgroundColor: theme.background,
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          width: '100%',
          marginLeft: (isSidebarOpen && windowWidth >= 1300) ? 200 : (isSidebarOpen && windowWidth >= 901) ? 360 :  undefined,
        }}>
          <form onSubmit={(e) => {
            e.preventDefault();
            askQuestion();
          }} style={{
            display: 'flex',
            gap: '10px',
            justifyContent: windowWidth >= 900 ? 'center' : 'flex-start',
            width: (isSidebarOpen && windowWidth >= 1200) ? 'calc(100vw - 320px * 2)' : (isSidebarOpen && windowWidth >= 900) ? 'calc(100vw - 320px - 40px)' : '100%',
            marginLeft: (isSidebarOpen && windowWidth >= 1200) ? 320 : (isSidebarOpen && windowWidth >= 900) ? 360 : undefined,
            marginRight: (isSidebarOpen && windowWidth >= 1200) ? 320 : undefined,
            maxWidth: (isSidebarOpen && windowWidth >= 1200) ? 900 : (windowWidth >= 900 ? 700 : undefined),
            minWidth: 340,
            margin: (!isSidebarOpen && windowWidth >= 900) ? '0 auto' : undefined,
          }}>
            <textarea
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  askQuestion();
                }
              }}
              placeholder={t.placeholder}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: theme.input.background,
                color: theme.input.text,
                fontSize: '16px',
                resize: 'none',
                height: '48px',
                lineHeight: '1.5',
                fontFamily: 'inherit',
                overflowY: 'auto',
                marginLeft: (isSidebarOpen && window.innerWidth >= 768) ? 80 : 0
              }}
            />
            <button
              type="submit"
              disabled={loading || messageLoading || !question.trim()}
              style={{
                padding: '12px 24px',
                backgroundColor: theme.button.primary,
                color: theme.button.text,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                opacity: loading || messageLoading || !question.trim() ? 0.7 : 1,
                transition: 'opacity 0.3s',
                alignSelf: 'flex-end'
              }}
            >
              {loading || messageLoading ? "..." : t.send}
            </button>
          </form>
        </div>
      </div>

      {/* Silme Onay Modalı */}
      {deleteConfirmDialog.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5000
        }}>
          <div style={{
            backgroundColor: theme.background,
            color: theme.text,
            padding: '28px 24px',
            borderRadius: '12px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
            minWidth: 280,
            maxWidth: '90vw',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            position: 'relative'
          }}>
            <div style={{ fontSize: 18, marginBottom: 16 }}>
              {language === 'turkish' ? 'Silmek istediğinize emin misiniz?' : 'Are you sure you want to delete?'}
            </div>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
              <button onClick={confirmDelete} style={{
                background: '#16a085',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 56,
                height: 56,
                fontSize: 28,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }} aria-label={language === 'turkish' ? 'Sil (Onay)' : 'Delete (Confirm)'}>
                {/* Tik SVG */}
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 14.5L12 19.5L21 9.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button onClick={cancelDelete} style={{
                background: '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 56,
                height: 56,
                fontSize: 28,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }} aria-label={language === 'turkish' ? 'İptal (Kapat)' : 'Cancel (Close)'}>
                {/* Çarpı SVG */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Title Modal */}
      {editTitleDialog.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: theme.background,
            color: theme.text,
            padding: '32px 28px',
            borderRadius: '16px',
            boxShadow: isDarkMode ? '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)' : '0 20px 40px rgba(0,0,0,0.15)',
            minWidth: 320,
            maxWidth: '90vw',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            position: 'relative',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ 
              fontSize: 20, 
              fontWeight: 600, 
              marginBottom: 8,
              color: theme.text,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ stroke: theme.primary, strokeWidth: '2', fill: 'none' }}
              >
                <path 
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              {language === 'turkish' ? 'Sohbet Başlığını Düzenle' : 'Edit Chat Title'}
            </div>
            <input
              type="text"
              value={editTitleDialog.title}
              onChange={(e) => setEditTitleDialog(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '12px',
                border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                color: theme.text,
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '8px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: isDarkMode ? 'inset 0 2px 8px rgba(0,0,0,0.2)' : 'inset 0 2px 8px rgba(0,0,0,0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.primary;
                e.target.style.boxShadow = `0 0 0 3px ${theme.primary}20, ${isDarkMode ? 'inset 0 2px 8px rgba(0,0,0,0.2)' : 'inset 0 2px 8px rgba(0,0,0,0.05)'}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
                e.target.style.boxShadow = isDarkMode ? 'inset 0 2px 8px rgba(0,0,0,0.2)' : 'inset 0 2px 8px rgba(0,0,0,0.05)';
              }}
              placeholder={language === 'turkish' ? 'Yeni başlık girin...' : 'Enter new title...'}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button onClick={() => handleEditTitle(editTitleDialog.title)} style={{
                background: 'linear-gradient(135deg, #00a99d 0%, #00897b 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                width: 48,
                height: 48,
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0, 169, 157, 0.3)',
                transition: 'all 0.3s ease',
                transform: 'scale(1)'
              }} 
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05) translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(0, 169, 157, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1) translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(0, 169, 157, 0.3)';
              }}
              aria-label={language === 'turkish' ? 'Kaydet' : 'Save'}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button onClick={() => setEditTitleDialog({ show: false, title: '' })} style={{
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                color: theme.text,
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                borderRadius: '12px',
                width: 48,
                height: 48,
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05) translateY(-2px)';
                e.target.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
                e.target.style.boxShadow = isDarkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1) translateY(0)';
                e.target.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
                e.target.style.boxShadow = 'none';
              }}
              aria-label={language === 'turkish' ? 'İptal' : 'Cancel'}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
