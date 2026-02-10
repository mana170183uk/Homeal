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
        sans: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        display: ["var(--font-fredoka)", "Fredoka", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(177, 108, 255, 0.15)",
        "glow-lg": "0 0 40px rgba(177, 108, 255, 0.2)",
      },
      animation: {
        "bounce-in": "bounceIn 0.4s ease-out",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
