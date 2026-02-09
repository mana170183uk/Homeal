import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
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
