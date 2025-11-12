import { createApp } from "vue";
import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
import PrimeVue from "primevue/config";
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
      50: "{sky.50}",
      100: "{sky.100}",
      200: "{sky.200}",
      300: "{sky.300}",
      400: "{sky.400}",
      500: "{sky.500}",
      600: "{sky.600}",
      700: "{sky.700}",
      800: "{sky.800}",
      900: "{sky.900}",
      950: "{sky.950}",
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

app.mount("#app");

