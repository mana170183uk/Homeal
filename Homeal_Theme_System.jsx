import { useState } from "react";

const themes = {
  light: {
    name: "Light Mode",
    bg: {
      primary: "#FFFFFF",
      secondary: "#FFF8F0",
      tertiary: "#FFF3E0",
      card: "#FFFFFF",
      input: "#F5F5F5",
      overlay: "rgba(0,0,0,0.5)",
    },
    text: {
      primary: "#1B1B1B",
      secondary: "#666666",
      tertiary: "#999999",
      inverse: "#FFFFFF",
      link: "#E85D04",
    },
    brand: {
      primary: "#E85D04",
      primaryLight: "#FF8A3D",
      primaryDark: "#C44E03",
      secondary: "#F48C06",
      accent: "#2D6A4F",
      accentLight: "#40916C",
    },
    status: {
      success: "#2D6A4F",
      successBg: "#E8F5E9",
      error: "#D32F2F",
      errorBg: "#FFEBEE",
      warning: "#F48C06",
      warningBg: "#FFF3E0",
      info: "#26A69A",
      infoBg: "#E0F2F1",
    },
    border: {
      light: "#F0F0F0",
      medium: "#E0E0E0",
      dark: "#CCCCCC",
    },
    shadow: "0 2px 8px rgba(0,0,0,0.08)",
    shadowMd: "0 4px 16px rgba(0,0,0,0.12)",
    nav: { bg: "#FFFFFF", border: "#F0F0F0", active: "#E85D04", inactive: "#999999" },
    tag: { vegBg: "#E8F5E9", vegText: "#2D6A4F", nonVegBg: "#FFEBEE", nonVegText: "#D32F2F" },
  },
  dark: {
    name: "Dark Mode",
    bg: {
      primary: "#121212",
      secondary: "#1E1E1E",
      tertiary: "#2A2118",
      card: "#1E1E1E",
      input: "#2C2C2C",
      overlay: "rgba(0,0,0,0.7)",
    },
    text: {
      primary: "#F5F5F5",
      secondary: "#B0B0B0",
      tertiary: "#787878",
      inverse: "#1B1B1B",
      link: "#FF8A3D",
    },
    brand: {
      primary: "#FF8A3D",
      primaryLight: "#FFB074",
      primaryDark: "#E85D04",
      secondary: "#FFB347",
      accent: "#40916C",
      accentLight: "#52B788",
    },
    status: {
      success: "#40916C",
      successBg: "#1A2E22",
      error: "#EF5350",
      errorBg: "#2E1A1A",
      warning: "#FFB347",
      warningBg: "#2E2518",
      info: "#4DB6AC",
      infoBg: "#1A2E2C",
    },
    border: {
      light: "#2C2C2C",
      medium: "#3A3A3A",
      dark: "#4A4A4A",
    },
    shadow: "0 2px 8px rgba(0,0,0,0.3)",
    shadowMd: "0 4px 16px rgba(0,0,0,0.4)",
    nav: { bg: "#1E1E1E", border: "#2C2C2C", active: "#FF8A3D", inactive: "#787878" },
    tag: { vegBg: "#1A2E22", vegText: "#52B788", nonVegBg: "#2E1A1A", nonVegText: "#EF5350" },
  },
};

const ColorSwatch = ({ color, name, hex, textColor = "#fff" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
    <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: color, border: "1px solid rgba(128,128,128,0.2)", flexShrink: 0 }} />
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: textColor }}>{name}</div>
      <div style={{ fontSize: 11, color: "rgba(128,128,128,0.8)", fontFamily: "monospace" }}>{hex}</div>
    </div>
  </div>
);

const PhoneMockup = ({ theme, t }) => (
  <div style={{ width: 280, borderRadius: 28, overflow: "hidden", border: `2px solid ${t.border.medium}`, backgroundColor: t.bg.primary, boxShadow: t.shadowMd }}>
    {/* Status Bar */}
    <div style={{ height: 32, backgroundColor: t.bg.primary, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: t.text.primary }}>9:41</div>
    </div>

    {/* Header */}
    <div style={{ padding: "8px 16px 12px", backgroundColor: t.bg.primary, borderBottom: `1px solid ${t.border.light}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: t.text.tertiary }}>📍 Deliver to</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary }}>Home - Sector 15 ▾</div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: t.brand.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 14 }}>🔔</span>
        </div>
      </div>
      <div style={{ backgroundColor: t.bg.input, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: t.text.tertiary }}>🔍</span>
        <span style={{ fontSize: 12, color: t.text.tertiary }}>Search dishes, chefs, cuisines...</span>
      </div>
    </div>

    {/* Categories */}
    <div style={{ padding: "10px 16px", display: "flex", gap: 10, overflowX: "auto" }}>
      {["🍛 All", "🥗 Veg", "🍗 Non-Veg", "🥑 Vegan"].map((cat, i) => (
        <div key={i} style={{ padding: "5px 12px", borderRadius: 16, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", backgroundColor: i === 0 ? t.brand.primary : t.bg.input, color: i === 0 ? "#fff" : t.text.secondary }}>
          {cat}
        </div>
      ))}
    </div>

    {/* Banner */}
    <div style={{ margin: "4px 16px 10px", borderRadius: 12, padding: "14px 16px", background: `linear-gradient(135deg, ${t.brand.primary}, ${t.brand.secondary})`, position: "relative", overflow: "hidden" }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Today's Special 🔥</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 8 }}>Get 30% off on first order</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: t.brand.primary, backgroundColor: "#fff", display: "inline-block", padding: "3px 10px", borderRadius: 10 }}>
        ORDER NOW
      </div>
    </div>

    {/* Section Title */}
    <div style={{ padding: "4px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary }}>Nearby Home Chefs</div>
      <div style={{ fontSize: 11, color: t.brand.primary, fontWeight: 600 }}>See All →</div>
    </div>

    {/* Chef Cards */}
    {[
      { name: "Anita's Kitchen", cuisine: "North Indian • Punjabi", rating: "4.8", time: "25 min", veg: true },
      { name: "Chef Rahul's", cuisine: "South Indian • Healthy", rating: "4.6", time: "30 min", veg: false },
    ].map((chef, i) => (
      <div key={i} style={{ margin: "0 16px 8px", padding: 10, borderRadius: 12, backgroundColor: t.bg.card, border: `1px solid ${t.border.light}`, display: "flex", gap: 10, boxShadow: t.shadow }}>
        <div style={{ width: 56, height: 56, borderRadius: 10, background: `linear-gradient(135deg, ${t.brand.primary}30, ${t.brand.accent}30)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
          {i === 0 ? "👩‍🍳" : "👨‍🍳"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary }}>{chef.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "1px 6px", borderRadius: 4, backgroundColor: t.status.successBg }}>
              <span style={{ fontSize: 9 }}>⭐</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: t.status.success }}>{chef.rating}</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: t.text.secondary, marginTop: 2 }}>{chef.cuisine}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 10, color: t.text.tertiary }}>🕐 {chef.time}</span>
            <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: chef.veg ? t.status.success : t.status.error }} />
            <span style={{ fontSize: 10, color: chef.veg ? t.status.success : t.status.error, fontWeight: 600 }}>{chef.veg ? "Pure Veg" : "Non-Veg"}</span>
          </div>
        </div>
      </div>
    ))}

    {/* Bottom Nav */}
    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "8px 0 12px", backgroundColor: t.nav.bg, borderTop: `1px solid ${t.nav.border}`, marginTop: 6 }}>
      {[
        { icon: "🏠", label: "Home", active: true },
        { icon: "🔍", label: "Explore", active: false },
        { icon: "📋", label: "Orders", active: false },
        { icon: "❤️", label: "Favorites", active: false },
        { icon: "👤", label: "Profile", active: false },
      ].map((tab, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, marginBottom: 1, opacity: tab.active ? 1 : 0.5 }}>{tab.icon}</div>
          <div style={{ fontSize: 9, fontWeight: tab.active ? 700 : 500, color: tab.active ? t.nav.active : t.nav.inactive }}>{tab.label}</div>
          {tab.active && <div style={{ width: 16, height: 2, borderRadius: 1, backgroundColor: t.nav.active, margin: "2px auto 0" }} />}
        </div>
      ))}
    </div>
  </div>
);

const AdminMockup = ({ theme, t }) => (
  <div style={{ width: 340, borderRadius: 12, overflow: "hidden", border: `2px solid ${t.border.medium}`, backgroundColor: t.bg.primary, boxShadow: t.shadowMd }}>
    {/* Admin Header */}
    <div style={{ padding: "12px 16px", backgroundColor: t.bg.secondary, borderBottom: `1px solid ${t.border.light}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: t.brand.primary }}>Homeal</div>
        <div style={{ fontSize: 10, color: t.text.tertiary }}>Chef Admin Panel</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <span style={{ fontSize: 16 }}>🔔</span>
          <div style={{ position: "absolute", top: -3, right: -3, width: 12, height: 12, borderRadius: 6, backgroundColor: t.status.error, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 7, color: "#fff", fontWeight: 800 }}>3</span>
          </div>
        </div>
        <div style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.brand.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12 }}>👩‍🍳</span>
        </div>
      </div>
    </div>

    {/* Summary Cards */}
    <div style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
      {[
        { label: "Today's Orders", value: "24", icon: "📦", color: t.brand.primary },
        { label: "Revenue", value: "₹4,280", icon: "💰", color: t.brand.accent },
        { label: "Rating", value: "4.8", icon: "⭐", color: t.brand.secondary },
      ].map((card, i) => (
        <div key={i} style={{ padding: "10px 8px", borderRadius: 10, backgroundColor: t.bg.card, border: `1px solid ${t.border.light}`, textAlign: "center" }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>{card.icon}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: card.color }}>{card.value}</div>
          <div style={{ fontSize: 9, color: t.text.tertiary, marginTop: 2 }}>{card.label}</div>
        </div>
      ))}
    </div>

    {/* New Order Alert */}
    <div style={{ margin: "4px 12px 8px", padding: 10, borderRadius: 10, border: `2px solid ${t.status.error}`, backgroundColor: t.status.errorBg, animation: "pulse 2s infinite" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>🔴</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: t.status.error }}>NEW ORDER!</span>
        </div>
        <span style={{ fontSize: 10, color: t.text.tertiary }}>Just now</span>
      </div>
      <div style={{ fontSize: 11, color: t.text.primary, marginBottom: 2 }}>
        <strong>Priya S.</strong> — 2x Paneer Butter Masala, 3x Roti, 1x Dal
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.text.primary, marginBottom: 8 }}>Total: ₹380</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", backgroundColor: t.brand.accent, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✓ Accept</button>
        <button style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${t.status.error}`, backgroundColor: "transparent", color: t.status.error, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✕ Reject</button>
      </div>
    </div>

    {/* Order Queue */}
    <div style={{ padding: "4px 12px 8px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary, marginBottom: 6 }}>Active Orders</div>
      {[
        { id: "#1042", customer: "Amit K.", items: "1x Thali", status: "Preparing", statusColor: t.brand.secondary, time: "15 min" },
        { id: "#1041", customer: "Sara M.", items: "2x Biryani", status: "Ready", statusColor: t.brand.accent, time: "Done" },
      ].map((order, i) => (
        <div key={i} style={{ padding: 8, borderRadius: 8, backgroundColor: t.bg.card, border: `1px solid ${t.border.light}`, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.text.primary }}>{order.id} • {order.customer}</div>
            <div style={{ fontSize: 10, color: t.text.secondary }}>{order.items}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: order.statusColor, backgroundColor: `${order.statusColor}18`, padding: "2px 8px", borderRadius: 10 }}>{order.status}</div>
            <div style={{ fontSize: 9, color: t.text.tertiary, marginTop: 2 }}>{order.time}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function HomealThemeSystem() {
  const [mode, setMode] = useState("light");
  const t = themes[mode];
  const otherMode = mode === "light" ? "dark" : "light";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: t.bg.primary, transition: "all 0.4s ease", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "24px 24px 16px", borderBottom: `1px solid ${t.border.light}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, background: `linear-gradient(135deg, ${t.brand.primary}, ${t.brand.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Homeal
            </div>
            <div style={{ fontSize: 12, color: t.text.secondary, fontStyle: "italic" }}>Healthy food, from home.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: t.text.secondary }}>☀️</span>
            <div onClick={() => setMode(otherMode)} style={{ width: 52, height: 28, borderRadius: 14, backgroundColor: mode === "dark" ? t.brand.primary : t.border.medium, padding: 3, cursor: "pointer", transition: "all 0.3s" }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", transform: mode === "dark" ? "translateX(24px)" : "translateX(0)", transition: "all 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontSize: 12, color: t.text.secondary }}>🌙</span>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 18, fontWeight: 700, color: t.text.primary }}>
          Complete Theme System — {t.name}
        </div>
        <div style={{ fontSize: 12, color: t.text.secondary, marginTop: 4 }}>
          Toggle the switch above to compare light and dark themes
        </div>
      </div>

      {/* Color Tokens Section */}
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: t.text.primary, marginBottom: 16 }}>🎨 Color Tokens</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {/* Brand Colors */}
          <div style={{ padding: 14, borderRadius: 12, backgroundColor: t.bg.card, border: `1px solid ${t.border.light}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.brand.primary, marginBottom: 10 }}>Brand</div>
            <ColorSwatch color={t.brand.primary} name="Primary" hex={t.brand.primary} textColor={t.text.primary} />
            <ColorSwatch color={t.brand.primaryLight} name="Primary Light" hex={t.brand.primaryLight} textColor={t.text.primary} />
            <ColorSwatch color={t.brand.secondary} name="Secondary" hex={t.brand.secondary} textColor={t.text.primary} />
            <ColorSwatch color={t.brand.accent} name="Accent" hex={t.brand.accent} textColor={t.text.primary} />
            <ColorSwatch color={t.brand.accentLight} name="Accent Light" hex={t.brand.accentLight} textColor={t.text.primary} />
          </div>

          {/* Background Colors */}
          <div style={{ padding: 14, borderRadius: 12, backgroundColor: t.bg.card, border: `1px solid ${t.border.light}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.brand.accent, marginBottom: 10 }}>Backgrounds</div>
            <ColorSwatch color={t.bg.primary} name="Primary BG" hex={t.bg.primary} textColor={t.text.primary} />
            <ColorSwatch color={t.bg.secondary} name="Secondary BG" hex={t.bg.secondary} textColor={t.text.primary} />
            <ColorSwatch color={t.bg.tertiary} name="Tertiary BG" hex={t.bg.tertiary} textColor={t.text.primary} />
            <ColorSwatch color={t.bg.card} name="Card BG" hex={t.bg.card} textColor={t.text.primary} />
            <ColorSwatch color={t.bg.input} name="Input BG" hex={t.bg.input} textColor={t.text.primary} />
          </div>

          {/* Text Colors */}
          <div style={{ padding: 14, borderRadius: 12, backgroundColor: t.bg.card, border: `1px solid ${t.border.light}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary, marginBottom: 10 }}>Text</div>
            <ColorSwatch color={t.text.primary} name="Primary Text" hex={t.text.primary} textColor={t.text.primary} />
            <ColorSwatch color={t.text.secondary} name="Secondary Text" hex={t.text.secondary} textColor={t.text.primary} />
            <ColorSwatch color={t.text.tertiary} name="Tertiary Text" hex={t.text.tertiary} textColor={t.text.primary} />
            <ColorSwatch color={t.text.link} name="Link Text" hex={t.text.link} textColor={t.text.primary} />
          </div>

          {/* Status Colors */}
          <div style={{ padding: 14, borderRadius: 12, backgroundColor: t.bg.card, border: `1px solid ${t.border.light}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.status.info, marginBottom: 10 }}>Status</div>
            <ColorSwatch color={t.status.success} name="Success" hex={t.status.success} textColor={t.text.primary} />
            <ColorSwatch color={t.status.error} name="Error" hex={t.status.error} textColor={t.text.primary} />
            <ColorSwatch color={t.status.warning} name="Warning" hex={t.status.warning} textColor={t.text.primary} />
            <ColorSwatch color={t.status.info} name="Info" hex={t.status.info} textColor={t.text.primary} />
          </div>
        </div>
      </div>

      {/* UI Component Examples */}
      <div style={{ padding: "0 24px 24px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: t.text.primary, marginBottom: 16 }}>🧩 UI Components</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {/* Buttons */}
          <div style={{ padding: 14, borderRadius: 12, backgroundColor: t.bg.card, border: `1px solid ${t.border.light}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.text.secondary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Buttons</div>
            <button style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", backgroundColor: t.brand.primary, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>
              Order Now
            </button>
            <button style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: `2px solid ${t.brand.primary}`, backgroundColor: "transparent", color: t.brand.primary, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>
              View Menu
            </button>
            <button style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", backgroundColor: t.brand.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              ✓ Accept Order
            </button>
          </div>

          {/* Tags & Badges */}
          <div style={{ padding: 14, borderRadius: 12, backgroundColor: t.bg.card, border: `1px solid ${t.border.light}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.text.secondary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Tags & Badges</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: t.tag.vegBg, color: t.tag.vegText }}>● Veg</span>
              <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: t.tag.nonVegBg, color: t.tag.nonVegText }}>▲ Non-Veg</span>
              <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: t.status.infoBg, color: t.status.info }}>🥑 Vegan</span>
              <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: t.status.warningBg, color: t.status.warning }}>⚡ Popular</span>
              <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: t.status.successBg, color: t.status.success }}>🔥 Trending</span>
              <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: `${t.brand.primary}18`, color: t.brand.primary }}>Party Orders</span>
              <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: `${t.brand.accent}18`, color: t.brand.accent }}>Catering</span>
              <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: `${t.brand.secondary}18`, color: t.brand.secondary }}>Tiffin</span>
            </div>
          </div>

          {/* Input Fields */}
          <div style={{ padding: 14, borderRadius: 12, backgroundColor: t.bg.card, border: `1px solid ${t.border.light}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.text.secondary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Inputs</div>
            <input placeholder="Search dishes..." style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${t.border.medium}`, backgroundColor: t.bg.input, color: t.text.primary, fontSize: 12, marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
            <input placeholder="₹ Set price" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${t.border.medium}`, backgroundColor: t.bg.input, color: t.text.primary, fontSize: 12, outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Alert States */}
          <div style={{ padding: 14, borderRadius: 12, backgroundColor: t.bg.card, border: `1px solid ${t.border.light}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.text.secondary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Alerts</div>
            <div style={{ padding: 8, borderRadius: 8, backgroundColor: t.status.successBg, border: `1px solid ${t.status.success}30`, marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.status.success }}>✓ Order Delivered</div>
            </div>
            <div style={{ padding: 8, borderRadius: 8, backgroundColor: t.status.errorBg, border: `1px solid ${t.status.error}30`, marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.status.error }}>✕ Order Cancelled</div>
            </div>
            <div style={{ padding: 8, borderRadius: 8, backgroundColor: t.status.warningBg, border: `1px solid ${t.status.warning}30`, marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.status.warning }}>⚠ Low Stock Alert</div>
            </div>
            <div style={{ padding: 8, borderRadius: 8, backgroundColor: t.status.infoBg, border: `1px solid ${t.status.info}30` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.status.info }}>ℹ New Feature Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Mockups */}
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: t.text.primary, marginBottom: 6 }}>📱 App Preview — {t.name}</div>
        <div style={{ fontSize: 12, color: t.text.secondary, marginBottom: 16 }}>Customer App & Chef Admin Panel side by side</div>
        <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.brand.primary, textAlign: "center", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Customer App</div>
            <PhoneMockup theme={mode} t={t} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.brand.accent, textAlign: "center", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Chef Admin Panel</div>
            <AdminMockup theme={mode} t={t} />
          </div>
        </div>
      </div>

      {/* Implementation Guide */}
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: t.text.primary, marginBottom: 12 }}>⚙️ Implementation Notes</div>
        <div style={{ padding: 16, borderRadius: 12, backgroundColor: t.bg.card, border: `1px solid ${t.border.light}` }}>
          {[
            { title: "Theme Storage", desc: "Save user preference in AsyncStorage (mobile) or localStorage (web). Default to system preference using useColorScheme()." },
            { title: "Dark Mode Warmth", desc: "Dark backgrounds use warm undertones (#2A2118 tertiary) instead of pure grey — maintains the 'homey' feeling." },
            { title: "Brand Color Shift", desc: "Primary orange shifts lighter in dark mode (#FF8A3D vs #E85D04) for WCAG contrast compliance on dark backgrounds." },
            { title: "Status Colors", desc: "All status colors have paired background tokens (e.g., successBg) that work in both themes without transparency issues." },
            { title: "Transition", desc: "Use 400ms ease transition on background-color and color properties for smooth theme switching." },
            { title: "Images", desc: "Food photos remain unchanged. Only UI chrome adapts. Logo: use transparent PNG over both themes." },
          ].map((note, i) => (
            <div key={i} style={{ marginBottom: i < 5 ? 10 : 0, paddingBottom: i < 5 ? 10 : 0, borderBottom: i < 5 ? `1px solid ${t.border.light}` : "none" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.brand.primary }}>{note.title}</div>
              <div style={{ fontSize: 11, color: t.text.secondary, marginTop: 2 }}>{note.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
