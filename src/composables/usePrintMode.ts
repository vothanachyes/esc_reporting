import { ref } from "vue";

const isPrintMode = ref(false);
let listenersAttached = false;

/**
 * Handle beforeprint event
 */
const handleBeforePrint = () => {
  isPrintMode.value = true;
};

/**
 * Handle afterprint event
 */
const handleAfterPrint = () => {
  // Small delay to ensure print dialog is fully closed
  setTimeout(() => {
    isPrintMode.value = false;
  }, 100);
};

/**
 * Attach print event listeners (only once)
 */
const attachListeners = () => {
  if (listenersAttached) return;
  
  window.addEventListener("beforeprint", handleBeforePrint);
  window.addEventListener("afterprint", handleAfterPrint);
  listenersAttached = true;
};

/**
 * Composable for managing print mode state
 * Handles print dialog events and state management
 */
export function usePrintMode() {
  // Attach listeners on first use
  if (typeof window !== "undefined") {
    attachListeners();
  }

  /**
   * Enable print mode
   */
  const enablePrintMode = () => {
    isPrintMode.value = true;
  };

  /**
   * Disable print mode
   */
  const disablePrintMode = () => {
    isPrintMode.value = false;
  };

  /**
   * Toggle print mode
   */
  const togglePrintMode = () => {
    isPrintMode.value = !isPrintMode.value;
  };

  return {
    isPrintMode,
    enablePrintMode,
    disablePrintMode,
    togglePrintMode,
  };
}

