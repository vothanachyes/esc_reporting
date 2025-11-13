import { ref, computed } from "vue";

/**
 * Global state for maximize mode
 * Tracks whether any slide is currently maximized
 */
const isMaximized = ref(false);
const maximizedSlideId = ref<string | null>(null);

/**
 * Composable for managing maximize mode state
 * Allows components to check if they're in maximize mode
 * and coordinate maximize state across the application
 */
export function useMaximizeMode() {
  /**
   * Check if any slide is currently maximized
   */
  const checkIsMaximized = computed(() => isMaximized.value);

  /**
   * Check if a specific slide is maximized
   */
  const isSlideMaximized = (slideId: string) => {
    return isMaximized.value && maximizedSlideId.value === slideId;
  };

  /**
   * Set maximize state
   */
  const setMaximized = (slideId: string | null) => {
    isMaximized.value = slideId !== null;
    maximizedSlideId.value = slideId;
  };

  /**
   * Clear maximize state
   */
  const clearMaximized = () => {
    isMaximized.value = false;
    maximizedSlideId.value = null;
  };

  return {
    isMaximized: checkIsMaximized,
    maximizedSlideId: computed(() => maximizedSlideId.value),
    isSlideMaximized,
    setMaximized,
    clearMaximized,
  };
}

