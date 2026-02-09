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
          sidebar: "var(--sidebar)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
