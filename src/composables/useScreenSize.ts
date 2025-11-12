import { computed } from "vue";
import { useBreakpoints, useWindowSize } from "@vueuse/core";

export function useScreenSize() {
  const breakpoints = useBreakpoints({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  });

  const { width } = useWindowSize();

  const isSmallScreen = computed(() => width.value < 640); // Below sm breakpoint

  return {
    isSmallScreen,
    width,
    breakpoints,
  };
}

