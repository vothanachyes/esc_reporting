import { ref, computed, onMounted, onUnmounted, watch, type Ref } from "vue";

/**
 * Composable to measure available card height for image container
 * Accounts for padding, gaps, and other spacing elements
 */
export function useCardHeight(containerRef: Ref<HTMLElement | null>) {
  const cardHeight = ref(0);
  const availableHeight = ref(0);
  let resizeObserver: ResizeObserver | null = null;

  /**
   * Calculate available height for image container
   * The containerRef is the content container which already has h-full,
   * so its height is the available space. We just need to account for
   * the content padding (py-2) to get the actual usable height.
   */
  const calculateAvailableHeight = () => {
    if (!containerRef.value) {
      availableHeight.value = 0;
      return;
    }

    const container = containerRef.value;
    const height = container.clientHeight;
    cardHeight.value = height;

    // Account for content padding: py-2 = 8px top + 8px bottom = 16px
    // The container already accounts for card padding (p-5) since it has h-full
    const contentPadding = 16;
    
    // Calculate available height (container height minus its own padding)
    // The gap and badge don't affect the image container's height since
    // they're either in the flex layout (gap) or absolutely positioned (badge)
    availableHeight.value = Math.max(
      200, // Minimum height to ensure at least one image is visible
      height - contentPadding
    );
  };

  /**
   * Initialize ResizeObserver to watch for container size changes
   */
  const initResizeObserver = () => {
    if (!containerRef.value) return;

    resizeObserver = new ResizeObserver(() => {
      calculateAvailableHeight();
    });

    resizeObserver.observe(containerRef.value);
    
    // Initial calculation
    calculateAvailableHeight();
  };

  /**
   * Clean up ResizeObserver
   */
  const cleanup = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  };

  // Watch for window resize to update gap calculation
  const handleWindowResize = () => {
    calculateAvailableHeight();
  };

  onMounted(() => {
    // Wait for next tick to ensure DOM is ready
    setTimeout(() => {
      initResizeObserver();
      window.addEventListener("resize", handleWindowResize);
    }, 0);
  });

  onUnmounted(() => {
    cleanup();
    window.removeEventListener("resize", handleWindowResize);
  });

  // Watch for containerRef changes
  watch(
    () => containerRef.value,
    (newRef) => {
      cleanup();
      if (newRef) {
        setTimeout(() => {
          initResizeObserver();
        }, 0);
      }
    }
  );

  return {
    cardHeight: computed(() => cardHeight.value),
    availableHeight: computed(() => availableHeight.value),
    recalculate: calculateAvailableHeight,
  };
}

