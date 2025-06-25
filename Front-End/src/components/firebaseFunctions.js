import { db } from "../firebase/authConfig";
import { 
  doc,  
  setDoc,  
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  deleteDoc, 
  writeBatch,
  onSnapshot,
  orderBy
} from "firebase/firestore";
import { encryptText } from "../utils/encryption";
import { decryptText } from "../utils/encryption"; 

// Yeni sohbet oturumu oluştur
const createChatSession = async (userId, initialMessage = null) => {
  try {
    const sessionId = Date.now().toString();
    const sessionRef = doc(db, `users/${userId}/sessions`, sessionId);
    
    const sessionData = {
      id: sessionId,
      title: initialMessage?.content?.substring(0, 30) || "Yeni Sohbet",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(sessionRef, sessionData);
    
    // İlk mesaj varsa kaydet
    if (initialMessage) {
      await saveChatMessage(userId, sessionId, initialMessage);
    }

    return sessionId;
  } catch (error) {
    console.error("Oturum oluşturma hatası:", error);
    throw error;
  }
};

// Tüm sohbet oturumlarını getir
const getChatSessions = async (userId) => {
  try {
    const sessionsRef = collection(db, `users/${userId}/sessions`);
    const querySnapshot = await getDocs(sessionsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => b.updatedAt?.seconds - a.updatedAt?.seconds);
  } catch (error) {
    console.error("Oturumları getirme hatası:", error);
    return [];
  }
};


const saveChatMessage = async (userId, sessionId, message) => {
  try {
    const messagesRef = collection(db, `users/${userId}/messages`);
    const newMessageRef = doc(messagesRef);

    const encryptedContent = await encryptText(message.content, userId); // şifrele

    const messageData = {
      id: newMessageRef.id,
      content: encryptedContent, // artık şifreli
      role: message.role,
      timestamp: Timestamp.now(),
      sessionId: sessionId
    };

    await setDoc(newMessageRef, messageData);
    return messageData;
  } catch (error) {
    console.error("Mesaj kaydetme hatası:", error);
    throw error;
  }
};




const getChatMessages = async (userId, sessionId) => {
  try {
    const messagesRef = collection(db, `users/${userId}/messages`);
    const q = query(messagesRef, where("sessionId", "==", sessionId));
    const querySnapshot = await getDocs(q);

    const decryptedMessages = await Promise.all(
      querySnapshot.docs.map(async doc => {
        const data = doc.data();
        const decryptedContent = await decryptText(data.content, userId); // çöz

        return {
          id: doc.id,
          content: decryptedContent,
          role: data.role,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(0),
          sessionId: data.sessionId
        };
      })
    );

    return decryptedMessages.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error("Mesajları getirme hatası:", error);
    return [];
  }
};


// Sohbet oturumunu ve ilişkili mesajları sil
const deleteChatSession = async (userId, sessionId) => {
  try {
    // 1. Önce oturumu sil
    const sessionRef = doc(db, `users/${userId}/sessions`, sessionId);
    await deleteDoc(sessionRef);
    
    // 2. İlişkili mesajları sil
    const messagesRef = collection(db, `users/${userId}/messages`);
    const q = query(messagesRef, where("sessionId", "==", sessionId));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return true;
  } catch (error) {
    console.error("Oturum silme hatası:", error);
    throw error;
  }
};

// Oturum başlığını güncelle
const updateSessionTitle = async (userId, sessionId, newTitle) => {
  try {
    const sessionRef = doc(db, `users/${userId}/sessions`, sessionId);
    await setDoc(sessionRef, {
      title: newTitle,
      updatedAt: Timestamp.now()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Başlık güncelleme hatası:", error);
    throw error;
  }
};

// Gerçek zamanlı mesaj dinleyici
const listenChatMessages = (userId, sessionId, callback) => {
  const messagesRef = collection(db, `users/${userId}/messages`);
  const q = query(messagesRef, where("sessionId", "==", sessionId), orderBy("timestamp", "asc"));
  return onSnapshot(q, (querySnapshot) => {
    (async () => {
      const decryptedMessages = await Promise.all(
        querySnapshot.docs.map(async doc => {
          const data = doc.data();
          const decryptedContent = await decryptText(data.content, userId);
          return {
            id: doc.id,
            content: decryptedContent,
            role: data.role,
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date(0),
            sessionId: data.sessionId
          };
        })
      );
      callback(decryptedMessages);
    })();
  });
};

export {
  createChatSession,
  getChatSessions,
  saveChatMessage,
  getChatMessages,
  deleteChatSession,
  updateSessionTitle,
  listenChatMessages
};