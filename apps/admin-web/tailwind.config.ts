import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF5A1F",
          light: "#FF8534",
          lighter: "#FFAB5E",
        },
        accent: {
          DEFAULT: "#00B341",
          light: "#00D94E",
          lighter: "#47ED7A",
        },
        alert: {
          DEFAULT: "#FF2D55",
          light: "#FF6B81",
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
