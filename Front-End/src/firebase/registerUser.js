import { createUserWithEmailAndPassword, sendEmailVerification, } from "firebase/auth";
import { auth } from "./authConfig";


const registerUser = async (email, password, language = "turkish") => {
  const translations = {
    turkish: {
      emailInvalid: "Sadece @ogr.btu.edu.tr veya @btu.edu.tr uzantılı e-postalar kabul edilir!",
      emailAlreadyInUse: "Bu e-posta adresi zaten kayıtlı!",
      invalidEmail: "Geçersiz e-posta adresi!",
      weakPassword: "Şifre çok zayıf! En az 6 karakter olmalı.",
      defaultError: "Bir hata oluştu. Lütfen tekrar deneyin.",
      verificationSent: "Doğrulama e-postası gönderildi. Lütfen e-postanızı kontrol edin.",
    },
    english: {
      emailInvalid: "Only emails with @ogr.btu.edu.tr or @btu.edu.tr domains are accepted!",
      emailAlreadyInUse: "This email address is already registered!",
      invalidEmail: "Invalid email address!",
      weakPassword: "The password is too weak! It should be at least 6 characters.",
      defaultError: "An error occurred. Please try again.",
      verificationSent: "Verification email sent. Please check your inbox.",
    }
  };
  
  try {
    const allowedDomains = ["@ogr.btu.edu.tr", "@btu.edu.tr"];
    const isValidEmail = allowedDomains.some(domain => email.endsWith(domain));
    if (!isValidEmail) {
      throw new Error(translations[language].emailInvalid);
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User created:", user);
    
    
    await sendEmailVerification(user);
    
    await auth.signOut();
    
    
    return {
      user,
      message: translations[language].verificationSent
    };
  } catch (error) {
    let errorMessage = translations[language].defaultError;
    // Firebase error code handling with translations
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = translations[language].emailAlreadyInUse;
        break;
      case "auth/invalid-email":
        errorMessage = translations[language].invalidEmail;
        break;
      case "auth/weak-password":
        errorMessage = translations[language].weakPassword;
        break;
      default:
        errorMessage = error.message;
    }
    console.error("Registration error:", error.code);
    throw new Error(errorMessage); // Throwing the localized error message
  }
};

export default registerUser;