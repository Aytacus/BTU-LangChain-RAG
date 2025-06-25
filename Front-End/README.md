# BTU-LangChain-RAG Frontend - React Chatbot Arayüzü

Bu proje, **BTU-CHATBOT: LANGCHAIN TABANLI ÇOK AJANLI RAG CHATBOTU VE DEĞERLENDİRİLMESİ** sisteminin frontend kısmıdır. Uygulama, öğrencilerin üniversite hakkında sorular sorabilecekleri ve **LangChain ReAct agent** sisteminden güncel bilgilere erişebilecekleri modern bir React 19 chatbot arayüzü sunar.

## Özellikler

### Kimlik Doğrulama
- **Kullanıcı Kaydı**: E-posta ile güvenli hesap oluşturma
- **E-posta Doğrulama**: Hesap aktivasyonu için e-posta onayı
- **Giriş/Çıkış**: Güvenli oturum yönetimi
- **Şifre Sıfırlama**: E-posta ile şifre yenileme

### LangChain ReAct Agent Entegrasyonu
- **Akıllı Chatbot**: FastAPI backend'le `/api/query` endpoint'i üzerinden iletişim
- **Agent Reasoning Display**: LangChain ReAct agent'ın düşünce sürecini görselleştirme
- **Real-time Responses**: RESTful API ile bot yanıtları
- **Source Attribution**: PDF ve web kaynak bilgilerini gösterme
- **Conversation Memory**: Firebase Firestore ile oturum bazlı konuşma hafızası
- **Auto Title Generation**: Son mesajlara göre oturum başlığı üretimi

### Akıllı Chatbot Sistemi
- **GPT-4o-mini Integration**: Backend üzerinden OpenAI API kullanımı
- **RAG System**: PDF dokümanlarından bilgi çekme
- **Multi-language Support**: Türkçe ve İngilizce arayüz
- **Session Management**: Sohbet geçmişi ile bağlamsal yanıtlar
- **FAQ System**: Hızlı soru örnekleri

### Kullanıcı Arayüzü
- **Modern Design**: Tailwind CSS ile responsive tasarım
- **Theme Support**: Açık/Koyu mod geçişi
- **Mobile Responsive**: Tüm cihazlarda optimize edilmiş deneyim
- **Loading States**: Mesaj gönderimi sırasında animasyonlar
- **Sidebar Navigation**: Oturum geçmişi ve yönetimi

### Güvenlik
- **Data Encryption**: Client-side şifreleme ile güvenli veri iletimi
- **Firebase Auth 11.6.0**: Google'ın güvenli kimlik doğrulama sistemi
- **CORS Protection**: Güvenli API erişimi
- **Token-based Authorization**: Firebase Authentication tokens

## Teknolojiler

### Frontend Framework
- **React 19.1.0**: Modern JavaScript UI framework
- **React Router DOM 7.5.1**: Client-side routing
- **React Scripts 5.0.1**: Build araçları

### Styling & UI
- **Tailwind CSS 4.1.1**: Utility-first CSS framework
- **Custom CSS**: Özel stil dosyaları (App.css, Chatbot.css)
- **Responsive Design**: Mobile-first approach

### Authentication & Database
- **Firebase 11.6.0**: Authentication ve Firestore database
- **Firebase Admin 13.3.0**: Backend işlemleri
- **Firebase Functions 6.3.2**: Serverless functions

### HTTP & API
- **Axios 1.8.4**: HTTP client
- **JWT Decode 4.0.0**: Token parsing
- **Fetch API**: Backend iletişimi

### Security & Utils
- **Crypto-JS 4.2.0**: Client-side şifreleme
- **Web Vitals 2.1.4**: Performance monitoring

### Development & Testing
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **ESLint**: Code quality kontrolü

## Kurulum

### Gereksinimler
- **Node.js** (v16 veya üzeri)
- **npm** veya **yarn**
- **Git**

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/Aytacus/BTU-LangChain-RAG.git
cd BTU-LangChain-RAG/Front-End
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
```

### 3. Firebase Konfigürasyonu
Firebase projenizi kurun ve `src/firebase/authConfig.js` dosyasındaki maskelenmiş değerleri kendi Firebase config bilgilerinizle değiştirin:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 4. Backend Bağlantısı
`vercel.json` dosyasında backend URL'ini kendi LangChain agent backend adresinizle güncelleyin:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://your-backend-url:8000/:path*"
    }
  ]
}
```

### 5. Geliştirme Sunucusunu Başlatın
```bash
npm start
# veya
yarn start
```

Chatbot uygulaması [http://localhost:3000](http://localhost:3000) adresinde çalışmaya başlayacak.

## Build ve Deployment

### Local Build
```bash
npm run build
# veya
yarn build
```

### Vercel Deployment
1. Vercel hesabınızı bağlayın
2. Repository'yi Vercel'e import edin
3. Environment variables'ları ayarlayın
4. Deploy edin

### Firebase Hosting
```bash
# Firebase CLI'yi yükleyin
npm install -g firebase-tools

# Login olun
firebase login

# Build alın
npm run build

# Deploy edin
firebase deploy
```

## Proje Yapısı

```
Front-End/
├── public/                 # Static dosyalar
├── src/
│   ├── components/         # React bileşenleri
│   │   ├── Chatbot.js     # Ana chatbot sohbet arayüzü
│   │   ├── Login.js       # Giriş sayfası
│   │   ├── Signup.js      # Kayıt sayfası
│   │   ├── Register.js    # Alternatif kayıt komponenti
│   │   ├── HomePage.js    # Ana sayfa
│   │   ├── ForgotPassword.js # Şifre sıfırlama
│   │   ├── firebaseFunctions.js # Firebase operasyonları
│   │   └── Chatbot.css    # Chatbot özel stilleri
│   ├── firebase/          # Firebase konfigürasyonu
│   │   ├── authConfig.js  # Auth ayarları
│   │   ├── loginUser.js   # Giriş fonksiyonları
│   │   └── registerUser.js # Kayıt fonksiyonları
│   ├── utils/             # Yardımcı fonksiyonlar
│   │   ├── encryption.js  # Şifreleme utilities
│   │   ├── ThemeContext.js # Tema yönetimi
│   │   └── theme.js       # Tema konfigürasyonu
│   ├── assets/            # Görseller (BTU logo vs.)
│   ├── App.js             # Ana uygulama komponenti
│   ├── App.css            # Ana stil dosyası
│   └── index.js           # Uygulama giriş noktası
├── functions/             # Firebase Cloud Functions
├── package.json           # Proje bağımlılıkları
├── firebase.json          # Firebase konfigürasyonu
└── vercel.json           # Vercel deployment ayarları
```

## Ana Bileşenler

### `<Chatbot />` - Ana Chatbot Sohbet Arayüzü
- **RESTful API** ile LangChain backend iletişimi
- **Real-time messaging**: Kullanıcı ve bot mesajları
- **Agent reasoning display**: LangChain ReAct agent düşünce süreci
- **Session management**: Firebase Firestore ile oturum yönetimi
- **Auto-scrolling**: Mesaj akışında otomatik kaydırma
- **FAQ integration**: Hazır soru örnekleri

```javascript
// LangChain Agent API query örneği
const askQuestion = async () => {
  const BASE = "/api";
  const res = await fetch(`${BASE}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.currentUser.uid}`
    },
    body: JSON.stringify({ query: questionText })
  });
  
  const data = await res.json();
  const botResponse = data.response || t.error;
};
```

### `<Login />` - Giriş Sayfası
- E-posta/şifre ile giriş
- Şifre sıfırlama bağlantısı
- Dil değişimi
- Form validasyonu

### `<Signup />` - Kayıt Sayfası
- Yeni hesap oluşturma
- E-posta doğrulama
- Şifre güçlülük kontrolü
- Kullanıcı sözleşmesi

### `<HomePage />` - Ana Sayfa
- LangChain chatbot sisteminin tanıtımı
- Hızlı başlangıç
- System overview

### `<ForgotPassword />` - Şifre Sıfırlama
- E-posta ile şifre yenileme
- Güvenli recovery process

## API Endpoints

LangChain backend ile iletişim kurulan ana endpoint'ler:

- `POST /api/query` - LangChain ReAct agent'a soru gönderme
- `POST /api/generate_title` - Oturum başlıkları
- `GET /api/` - Sistem durumu kontrolü

```javascript
// Başlık üretimi örneği
const updateTitle = async () => {
  const BASE = "/api";
  const response = await fetch(`${BASE}/generate_title`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: lastUserMessages })
  });
  const data = await response.json();
};
```

## Test

```bash
# Tüm testleri çalıştır
npm test

# Test coverage
npm test -- --coverage

# Specific test file
npm test Chatbot.test.js
```

## Firebase Entegrasyonu

### Firestore Collections
```javascript
// Chatbot sohbet oturumları
const getChatSessions = async (userId) => {
  // collection: /users/{userId}/sessions
};

// Chatbot mesajları
const getChatMessages = async (userId, sessionId) => {
  // collection: /users/{userId}/sessions/{sessionId}/messages
};
```

### Authentication Flow
```javascript
// Email verification required
const routes = user ? (
  user.emailVerified ? (
    <Chatbot />
  ) : (
    <Navigate to="/login" />
  )
) : (
  <Navigate to="/" />
);
```

## Çoklu Dil Desteği

Chatbot uygulaması Türkçe ve İngilizce dillerini destekler:

```javascript
const texts = {
  turkish: {
    title: "BTÜ Chatbot",
    welcome: "BTÜ Chatbot'a hoş geldiniz!",
    placeholder: "Mesaj yazın...",
  },
  english: {
    title: "BTU Chatbot",
    welcome: "Welcome to BTU Chatbot!",
    placeholder: "Type a message...",
  }
};
```

## Performans İzleme

Web Vitals ile chatbot performans metrikleri:
- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint)  
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)

## Sorun Giderme

### Yaygın Problemler

**LangChain backend bağlantı hatası:**
```bash
# Backend URL'ini kontrol edin (vercel.json)
# LangChain agent servisinin çalıştığından emin olun
# CORS ayarlarını doğrulayın
```

**Firebase bağlantı hatası:**
```bash
# Firebase config'i kontrol edin (authConfig.js)
# Internet bağlantınızı kontrol edin
# API anahtarlarınızı doğrulayın
```

**Build hatası:**
```bash
# Node modules'ı temizleyin: rm -rf node_modules && npm install
# Cache'i temizleyin: npm start -- --reset-cache
```

---

> **Not**: Bu frontend, LangChain ReAct agent tabanlı FastAPI backend ile entegre çalışan modern bir React 19 chatbot uygulamasıdır. RESTful API üzerinden AI agent sistemi ile iletişim kurarak kullanıcılara akıllı soru-cevap deneyimi sunar.