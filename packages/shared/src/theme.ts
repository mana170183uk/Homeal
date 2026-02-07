// Homeal Vibrant & Glossy Theme Config
// Extracted from Homeal_Vibrant_Theme-4.jsx

export const lightTheme = {
  id: "light" as const,
  // Brand colors
  primary: "#FF5A1F",
  accent: "#00B341",
  alert: "#FF2D55",
  // Gradients
  btnGrad: "linear-gradient(135deg, #FF5A1F 0%, #FF8534 40%, #FFAB5E 100%)",
  btnGlow: "0 4px 24px rgba(255,90,31,0.4), 0 1px 3px rgba(255,90,31,0.2)",
  accentGrad: "linear-gradient(135deg, #00B341 0%, #00D94E 50%, #47ED7A 100%)",
  accentGlow: "0 4px 24px rgba(0,179,65,0.35), 0 1px 3px rgba(0,179,65,0.15)",
  alertGrad: "linear-gradient(135deg, #FF2D55 0%, #FF6B81 100%)",
  alertGlow: "0 4px 20px rgba(255,45,85,0.3)",
  // Surfaces
  bg: "#FFF0F3",
  card: "#FFFFFF",
  input: "#FFF5F7",
  // Text
  text: "#1A1A2E",
  textSoft: "#4A4A65",
  textMuted: "#9595B0",
  // Borders
  border: "#FFD6E0",
  borderSelected: "#FF5A1F",
  selectedGlow:
    "0 0 0 2px #FF5A1F, 0 0 20px rgba(255,90,31,0.15), 0 0 40px rgba(255,90,31,0.05)",
  selectedBottomGrad:
    "linear-gradient(180deg, rgba(255,90,31,0.05) 0%, rgba(255,90,31,0.12) 100%)",
  // Sidebar
  sidebar: "#FFFFFF",
  sidebarText: "#1A1A2E",
  sidebarMuted: "#9595B0",
  sidebarSection: "#AEAEC8",
  sidebarActive:
    "linear-gradient(135deg, rgba(255,90,31,0.08) 0%, rgba(255,133,52,0.04) 100%)",
  sidebarActiveBorder: "#FF5A1F",
  sidebarActiveText: "#FF5A1F",
  sidebarBorder: "#FFE8EE",
  // Tabs
  tabActiveBg: "linear-gradient(135deg, #FF5A1F, #FF8534)",
  tabActiveText: "#fff",
  tabInactiveText: "#9595B0",
  // Glossy effects
  cardShadow:
    "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(255,90,31,0.04)",
  glossHighlight: "inset 0 1px 0 rgba(255,255,255,0.8)",
  shimmer:
    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
  // Stat icon backgrounds
  statIconBg1: "linear-gradient(135deg, #FFF0E6 0%, #FFE0CC 100%)",
  statIconBg2: "linear-gradient(135deg, #E6FFF0 0%, #CCFFE0 100%)",
  statIconBg3: "linear-gradient(135deg, #FFE6F0 0%, #FFCCE0 100%)",
  headerGrad:
    "linear-gradient(135deg, #FFF0F3 0%, #FFE8EE 50%, #FFF0F3 100%)",
};

export const darkTheme = {
  id: "dark" as const,
  // Brand colors
  primary: "#B16CFF",
  accent: "#00F5D4",
  alert: "#FF6B9D",
  // Gradients
  btnGrad: "linear-gradient(135deg, #8B3DFF 0%, #B16CFF 40%, #D4A0FF 100%)",
  btnGlow:
    "0 4px 28px rgba(177,108,255,0.5), 0 1px 3px rgba(177,108,255,0.3)",
  accentGrad:
    "linear-gradient(135deg, #00D4B0 0%, #00F5D4 50%, #5BFFE6 100%)",
  accentGlow:
    "0 4px 28px rgba(0,245,212,0.4), 0 1px 3px rgba(0,245,212,0.2)",
  alertGrad:
    "linear-gradient(135deg, #FF4081 0%, #FF6B9D 50%, #FF99BB 100%)",
  alertGlow: "0 4px 24px rgba(255,107,157,0.35)",
  // Surfaces
  bg: "#0D0C1E",
  card: "#171633",
  input: "#1E1D3D",
  // Text
  text: "#F0ECFF",
  textSoft: "#9B95BE",
  textMuted: "#5D5880",
  // Borders
  border: "rgba(177,108,255,0.1)",
  borderSelected: "#00F5D4",
  selectedGlow:
    "0 0 0 2px #00F5D4, 0 0 24px rgba(0,245,212,0.15), 0 0 48px rgba(0,245,212,0.05)",
  selectedBottomGrad:
    "linear-gradient(180deg, rgba(0,245,212,0.04) 0%, rgba(0,245,212,0.12) 100%)",
  // Sidebar
  sidebar: "#110F28",
  sidebarText: "#D0CAED",
  sidebarMuted: "#5D5880",
  sidebarSection: "#5D5880",
  sidebarActive:
    "linear-gradient(135deg, rgba(177,108,255,0.12) 0%, rgba(177,108,255,0.04) 100%)",
  sidebarActiveBorder: "#B16CFF",
  sidebarActiveText: "#D4A0FF",
  sidebarBorder: "rgba(177,108,255,0.06)",
  // Tabs
  tabActiveBg: "linear-gradient(135deg, #8B3DFF, #B16CFF)",
  tabActiveText: "#fff",
  tabInactiveText: "#5D5880",
  // Glossy effects
  cardShadow:
    "0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(177,108,255,0.06)",
  glossHighlight: "inset 0 1px 0 rgba(255,255,255,0.04)",
  shimmer:
    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)",
  // Stat icon backgrounds
  statIconBg1:
    "linear-gradient(135deg, rgba(177,108,255,0.15) 0%, rgba(177,108,255,0.08) 100%)",
  statIconBg2:
    "linear-gradient(135deg, rgba(0,245,212,0.15) 0%, rgba(0,245,212,0.08) 100%)",
  statIconBg3:
    "linear-gradient(135deg, rgba(255,107,157,0.15) 0%, rgba(255,107,157,0.08) 100%)",
  headerGrad:
    "linear-gradient(135deg, #0D0C1E 0%, #151334 50%, #0D0C1E 100%)",
};

export type ThemeMode = "light" | "dark";
export type Theme = typeof lightTheme;

export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};

// Tailwind-compatible color tokens for CSS variables
export const tailwindColors = {
  light: {
    primary: { DEFAULT: "#FF5A1F", light: "#FF8534", lighter: "#FFAB5E" },
    accent: { DEFAULT: "#00B341", light: "#00D94E", lighter: "#47ED7A" },
    alert: { DEFAULT: "#FF2D55", light: "#FF6B81" },
    background: "#FFF0F3",
    card: "#FFFFFF",
    input: "#FFF5F7",
    foreground: "#1A1A2E",
    muted: { DEFAULT: "#9595B0", foreground: "#4A4A65" },
    border: "#FFD6E0",
    sidebar: {
      DEFAULT: "#FFFFFF",
      foreground: "#1A1A2E",
      border: "#FFE8EE",
    },
  },
  dark: {
    primary: { DEFAULT: "#B16CFF", light: "#D4A0FF", dark: "#8B3DFF" },
    accent: { DEFAULT: "#00F5D4", light: "#5BFFE6", dark: "#00D4B0" },
    alert: { DEFAULT: "#FF6B9D", light: "#FF99BB", dark: "#FF4081" },
    background: "#0D0C1E",
    card: "#171633",
    input: "#1E1D3D",
    foreground: "#F0ECFF",
    muted: { DEFAULT: "#5D5880", foreground: "#9B95BE" },
    border: "rgba(177,108,255,0.1)",
    sidebar: {
      DEFAULT: "#110F28",
      foreground: "#D0CAED",
      border: "rgba(177,108,255,0.06)",
    },
  },
};
