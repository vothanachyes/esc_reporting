import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createHash, createCipheriv, randomBytes } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
  const envPath = resolve(__dirname, "..", ".env");
  if (!existsSync(envPath)) {
    console.error("Error: .env file not found. Please create it first.");
    process.exit(1);
  }

  const envContent = readFileSync(envPath, "utf-8");
  const env = {};
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim();
      }
    }
  });
  return env;
}

// Encrypt PIN using the same logic as crypto.ts
async function encryptPin(pin) {
  const env = loadEnv();
  const keyString = env.VITE_BASE_APP_KEY;
  const IV_LENGTH = Number.parseInt(env.VITE_IV_LENGTH) || 12;
  const TAG_LENGTH = Number.parseInt(env.VITE_TAG_LENGTH) || 16;

  if (!keyString) {
    console.error("Error: VITE_BASE_APP_KEY not found in .env file.");
    process.exit(1);
  }

  // Generate SHA-256 hash of the key string
  const rawKey = createHash("sha256").update(keyString).digest();

  // Generate random IV
  const iv = randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = createCipheriv("aes-256-gcm", rawKey, iv);
  cipher.setAAD(Buffer.alloc(0)); // No additional authenticated data

  // Encrypt the PIN (as JSON string to match crypto.ts behavior)
  const dataString = JSON.stringify(pin);
  let encrypted = cipher.update(dataString, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  // Combine IV + authTag + ciphertext (matching crypto.ts format)
  const resultArray = Buffer.concat([iv, authTag, encrypted]);

  // Convert to base64 string
  const hashBase64 = resultArray.toString("base64");

  return hashBase64;
}

// Main execution
const pin = process.argv[2];

if (!pin) {
  console.error("Usage: node scripts/generatePinEncryption.js <6-digit-pin>");
  process.exit(1);
}

if (!/^\d{6}$/.test(pin)) {
  console.error("Error: PIN must be exactly 6 digits.");
  process.exit(1);
}

encryptPin(pin)
  .then((encrypted) => {
    console.log("\n✅ PIN encrypted successfully!\n");
    console.log("Add this to your .env file:");
    console.log(`VITE_PIN_ENCRYPTED=${encrypted}\n`);
  })
  .catch((error) => {
    console.error("Error encrypting PIN:", error);
    process.exit(1);
  });

