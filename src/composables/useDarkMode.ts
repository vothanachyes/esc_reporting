import { useDark, useToggle } from "@vueuse/core";

export function useDarkMode() {
  // Use VueUse's useDark with minimal config (matches parent project approach)
  // VueUse handles: html element, class attribute, "dark" class, localStorage persistence
  const isDark = useDark({
    initialValue: "dark", // Default to dark mode
    storageKey: "app-color-scheme",
  });

  const toggle = useToggle(isDark);

  return {
    isDark,
    toggle,
  };
}

