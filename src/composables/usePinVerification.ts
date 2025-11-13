import { ref, computed } from "vue";
import { decrypt } from "@/utils/crypto";
import { usePinRateLimit } from "./usePinRateLimit";

const SESSION_STORAGE_KEY = "pin-verified-session";
const LOCAL_STORAGE_KEY = "pin-verified-local";

export function usePinVerification() {
  const isVerifying = ref(false);
  const { isLockedOut, remainingLockoutTime, remainingAttempts, recordFailedAttempt, resetAttempts, formatTimeRemaining } = usePinRateLimit();

  // Check if PIN is already verified (sessionStorage or localStorage)
  const isVerified = computed(() => {
    return (
      sessionStorage.getItem(SESSION_STORAGE_KEY) === "true" ||
      localStorage.getItem(LOCAL_STORAGE_KEY) === "true"
    );
  });

  // Verify PIN against encrypted value from environment
  async function verifyPin(enteredPin: string, rememberMe: boolean = false): Promise<boolean> {
    if (isLockedOut.value) {
      return false;
    }

    if (!enteredPin || enteredPin.length !== 6 || !/^\d{6}$/.test(enteredPin)) {
      return false;
    }

    isVerifying.value = true;

    try {
      const encryptedPin = import.meta.env.VITE_PIN_ENCRYPTED;
      if (!encryptedPin) {
        console.error("VITE_PIN_ENCRYPTED not configured");
        return false;
      }

      // Decrypt the stored PIN
      const decryptedPin = await decrypt(encryptedPin);
      if (!decryptedPin) {
        console.error("Failed to decrypt PIN");
        return false;
      }

      // Compare entered PIN with decrypted PIN
      const isValid = decryptedPin === enteredPin;

      if (isValid) {
        // Reset rate limiting on success
        resetAttempts();

        // Store verification based on rememberMe option
        if (rememberMe) {
          localStorage.setItem(LOCAL_STORAGE_KEY, "true");
          // Also set session for current session
          sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
        } else {
          sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
          // Clear localStorage if it was set before
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }

        return true;
      } else {
        // Record failed attempt
        recordFailedAttempt();
        return false;
      }
    } catch (error) {
      console.error("Error verifying PIN:", error);
      recordFailedAttempt();
      return false;
    } finally {
      isVerifying.value = false;
    }
  }

  // Clear verification (for logout or testing)
  function clearVerification(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  return {
    isVerified,
    isVerifying,
    isLockedOut,
    remainingLockoutTime,
    remainingAttempts,
    verifyPin,
    clearVerification,
    formatTimeRemaining,
  };
}

