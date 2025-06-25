import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./authConfig"; 

const loginUser = async (email, password, language) => {
  const translations = {
    turkish: {
      userNotFound: "Bu e-posta adresine ait kullanıcı bulunamadı.",
      invalidCredential: "Kullanıcı adı veya şifre hatalı.",
      wrongPassword: "Şifre hatalı. Lütfen tekrar deneyin.",
      userDisabled: "Bu hesap devre dışı bırakılmış.",
      emailNotVerified: "E-posta adresiniz doğrulanmamış. Lütfen e-postanızı kontrol edin.",
      defaultError: "Kullanıcı bulunamadı.",
    },
    english: {
      userNotFound: "No user found with this email address.",
      invalidCredential: "Invalid username or password.",
      wrongPassword: "Incorrect password. Please try again.",
      userDisabled: "This account has been disabled.",
      emailNotVerified: "Your email is not verified. Please check your inbox.",
      defaultError: "User not found.",
    },
  };

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    
    if (!user.emailVerified) {
      await signOut(auth); 
      return { success: false, error: translations[language].emailNotVerified };
      
    }

    console.log("Login successful:", user);
    return { success: true, user };
  } catch (error) {
    let errorMessage = translations[language]?.defaultError || "Login error.";

      if (error.code === "auth/user-not-found") {
      errorMessage = translations[language].userNotFound;
    }else if (error.code === "auth/invalid-credential") {
      errorMessage = translations[language].invalidCredential;
    } else if (error.code === "auth/wrong-password") {
      errorMessage = translations[language].wrongPassword;
    } else if (error.code === "auth/user-disabled") {
      errorMessage = translations[language].userDisabled;
    }
      
    

    console.error("Login error:", error.message);
    return { success: false, error: errorMessage };
  }
};

export default loginUser;
