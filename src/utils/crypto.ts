export async function encrypt(data: any): Promise<string> {
  const keyString = import.meta.env.VITE_BASE_APP_KEY;
  const IV_LENGTH = Number.parseInt(import.meta.env.VITE_IV_LENGTH || "12") || 12;
  const TAG_LENGTH = Number.parseInt(import.meta.env.VITE_TAG_LENGTH || "16") || 16;

  // Generate SHA-256 hash of the key string
  const rawKey = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(keyString));
  const key = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  // Generate random IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Convert data to string and then to ArrayBuffer
  const dataString = JSON.stringify(data);
  const dataBuffer = new TextEncoder().encode(dataString);

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: TAG_LENGTH * 8,
    },
    key,
    dataBuffer,
  );

  // Extract ciphertext and authentication tag
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedArray.slice(0, encryptedArray.length - TAG_LENGTH);
  const authTag = encryptedArray.slice(encryptedArray.length - TAG_LENGTH);

  // Combine IV + authTag + ciphertext
  const resultArray = new Uint8Array([...iv, ...authTag, ...ciphertext]);

  // Convert to base64 string
  const hashBase64 = btoa(String.fromCharCode(...resultArray));

  return hashBase64;
}

export async function decrypt(hashBase64: string): Promise<any> {
  const keyString = import.meta.env.VITE_BASE_APP_KEY;
  const IV_LENGTH = Number.parseInt(import.meta.env.VITE_IV_LENGTH || "12") || 12;
  const TAG_LENGTH = Number.parseInt(import.meta.env.VITE_TAG_LENGTH || "16") || 16;

  const rawKey = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(keyString));
  const key = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const hashBytes = Uint8Array.from(atob(hashBase64), c => c.charCodeAt(0));
  const iv = hashBytes.slice(0, IV_LENGTH);
  const authTag = hashBytes.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = hashBytes.slice(IV_LENGTH + TAG_LENGTH);

  const cipherWithTag = new Uint8Array([...encrypted, ...authTag]);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv, tagLength: TAG_LENGTH * 8 },
      key,
      cipherWithTag,
    );

    const rawText = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(rawText);
  }
  catch (err) {
    console.error("Decryption failed", err);
    return null;
  }
}
