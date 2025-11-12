import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
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

const app = createApp(App);

// Configure PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: Aura,
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

