import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--primary-rgb) / <alpha-value>)",
          light: "var(--primary-light)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          light: "var(--accent-light)",
        },
        alert: {
          DEFAULT: "rgb(var(--alert-rgb) / <alpha-value>)",
          light: "var(--alert-light)",
        },
        surface: {
          bg: "var(--bg)",
          card: "var(--card)",
          input: "var(--input)",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        display: ["var(--font-fredoka)", "Fredoka", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
