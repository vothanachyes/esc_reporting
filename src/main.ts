import { createApp } from "vue";
import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import App from "./App.vue";
import "./assets/css/main.css";

// Initialize dark mode from localStorage before app mounts
const stored = window.localStorage.getItem("app-color-scheme");
const prefersDark = stored ? stored === "true" : true; // Default to dark
if (prefersDark) {
  window.document.documentElement.classList.add("dark");
} else {
  window.document.documentElement.classList.remove("dark");
}

const Noir = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#e0f2f5",
      100: "#b3d9e0",
      200: "#80bfcb",
      300: "#4da5b6",
      400: "#2692a1",
      500: "#027f8c",
      600: "#026d78",
      700: "#025b64",
      800: "#024950",
      900: "#022f40",
      950: "#011e26",
    },
    colorScheme: {
      light: {
        primary: {
          color: "{primary.950}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.800}",
          activeColor: "{primary.700}",
        },
        highlight: {
          background: "{primary.950}",
          focusBackground: "{primary.700}",
          color: "#ffffff",
          focusColor: "#ffffff",
        },
      },
      dark: {
        primary: {
          color: "{surface.300}",
          contrastColor: "{primary.950}",
          hoverColor: "{surface.200}",
          activeColor: "{primary.300}",
        },
        highlight: {
          background: "{primary.50}",
          focusBackground: "{primary.300}",
          color: "{primary.950}",
          focusColor: "{primary.950}",
        },
      },
    },
  },
});

const app = createApp(App);

// Configure PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: Noir,
    options: {
      darkModeSelector: ".dark",
      cssLayer: {
        name: "primevue",
        order: "theme, base, primevue",
      },
    },
  },
  ripple: true,
});

// Register Tooltip directive globally
app.directive("tooltip", Tooltip);

app.mount("#app");

