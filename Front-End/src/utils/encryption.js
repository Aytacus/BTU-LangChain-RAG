let cachedKey = null;
let cachedSecret = null;

const getCryptoKey = async (secret) => {
  if (cachedKey && cachedSecret === secret) return cachedKey;
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("sohbet-uygulamasi"), 
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  cachedKey = key;
  cachedSecret = secret;
  return key;
};

// Metni şifrele
export const encryptText = async (text, secret) => {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await getCryptoKey(secret);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
};

// Metni çözümler
export const decryptText = async (cipherBase64, secret) => {
  const data = Uint8Array.from(atob(cipherBase64), c => c.charCodeAt(0));
  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);
  const key = await getCryptoKey(secret);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
};
