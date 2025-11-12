/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#045174",
          50: "#e6f2f7",
          100: "#b3d9e8",
          200: "#80c0d9",
          300: "#4da7ca",
          400: "#1a8ebb",
          500: "#045174",
          600: "#03405a",
          700: "#022f40",
          800: "#011e26",
          900: "#000d0c",
        },
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

