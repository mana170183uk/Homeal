"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, ClipboardList, Package, Bell, UtensilsCrossed,
  PlusCircle, PoundSterling, Star, BarChart3, Sun, Moon, Settings,
  RefreshCw, Phone, Mail, TrendingUp, TrendingDown, Clock, Users,
  AlertCircle, Wallet, ShoppingBag, ChefHat, Check, Crown, Zap,
  Infinity, Store, Leaf, Award, ShieldCheck, MapPin, Calendar,
  Repeat, Truck, Gift, Sparkles, Heart, Box, Timer, Grip, Cake,
  Navigation, Eye, Menu, X,
} from "lucide-react";

type IconComponent = typeof LayoutDashboard;
interface SidebarItem { icon: IconComponent; label: string; id: string }
interface SidebarGroup { section: string; items: SidebarItem[] }

const SIDEBAR_ITEMS: SidebarGroup[] = [
  { section: "OVERVIEW", items: [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  ]},
  { section: "ORDERS", items: [
    { icon: ClipboardList, label: "Active Orders", id: "active-orders" },
    { icon: Package, label: "Order History", id: "order-history" },
    { icon: Bell, label: "Notifications", id: "notifications" },
  ]},
  { section: "FOOD & MENU", items: [
    { icon: UtensilsCrossed, label: "Menu Management", id: "menu" },
    { icon: PlusCircle, label: "Add Dish", id: "add-dish" },
  ]},
  { section: "HOMEMADE STORE", items: [
    { icon: Store, label: "Products", id: "products" },
  ]},
  { section: "SERVICES", items: [
    { icon: Grip, label: "My Services", id: "my-services" },
    { icon: Calendar, label: "Subscriptions", id: "subscriptions" },
  ]},
  { section: "BUSINESS", items: [
    { icon: PoundSterling, label: "Earnings", id: "earnings" },
    { icon: Star, label: "Reviews", id: "reviews" },
    { icon: BarChart3, label: "Analytics", id: "analytics" },
  ]},
  { section: "ACCOUNT", items: [
    { icon: Settings, label: "Settings", id: "settings" },
  ]},
];

const STATS_ROW1 = [
  { label: "Today's Revenue", value: "£0.00", sub: "Today's earnings", icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  { label: "Today's Expenses", value: "£0.00", sub: "Today's costs", icon: TrendingDown, color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  { label: "Today's Orders", value: "0", sub: "Orders today", icon: Clock, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  { label: "Total Dishes", value: "0", sub: "Listed items", icon: UtensilsCrossed, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
];

const STATS_ROW2 = [
  { label: "Weekly Revenue", value: "£0.00", sub: "This week's revenue", icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  { label: "Weekly Expenses", value: "£0.00", sub: "This week's costs", icon: TrendingDown, color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  { label: "Monthly Earnings", value: "£0.00", sub: "This month's profit", icon: Wallet, color: "#14B8A6", bg: "rgba(20,184,166,0.12)" },
  { label: "Pending Reviews", value: "0", sub: "Awaiting response", icon: AlertCircle, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
];

const PAGE_TITLES: Record<string, string> = {
  "dashboard": "Dashboard",
  "active-orders": "Active Orders",
  "order-history": "Order History",
  "notifications": "Notifications",
  "menu": "Menu Management",
  "add-dish": "Add New Dish",
  "products": "Homemade Products",
  "add-product": "Add New Product",
  "cakes": "Cakes",
  "add-cake": "Add New Cake",
  "my-services": "My Services",
  "subscriptions": "Tiffin Subscriptions",
  "earnings": "Earnings",
  "reviews": "Reviews",
  "analytics": "Analytics",
  "settings": "Settings",
};

const PAGE_META: Record<string, { green: string; red: string; cta?: string }> = {
  "active-orders": { green: "0 Active", red: "0 Preparing" },
  "order-history": { green: "0 Completed", red: "0 Cancelled" },
  "notifications": { green: "0 Unread", red: "0 Read" },
  "menu": { green: "0 Active Items", red: "0 Draft", cta: "Add Dish" },
  "add-dish": { green: "0 Listed", red: "0 Draft" },
  "products": { green: "0 Listed", red: "0 Draft", cta: "Add Product" },
  "add-product": { green: "0 Products", red: "0 Draft" },
  "cakes": { green: "0 Listed", red: "0 Draft", cta: "Add Cake" },
  "add-cake": { green: "0 Cakes", red: "0 Draft" },
  "my-services": { green: "3 Active", red: "1 Inactive" },
  "subscriptions": { green: "0 Active", red: "0 Paused" },
  "earnings": { green: "£0 Today", red: "£0 Pending" },
  "reviews": { green: "0 New", red: "0 Total" },
  "analytics": { green: "0 Views", red: "0 Orders" },
  "settings": { green: "Unlimited Plan", red: "Free Trial" },
};

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    orders: "30",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    borderColor: "rgba(16,185,129,0.25)",
    icon: Zap,
    features: [
      "Up to 30 orders/month",
      "Basic menu listing",
      "1 homemade product",
      "Order notifications",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "£30",
    period: "/month",
    orders: "150",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    borderColor: "rgba(59,130,246,0.25)",
    icon: TrendingUp,
    popular: true,
    features: [
      "Up to 150 orders/month",
      "Featured menu listing",
      "4 homemade products",
      "Priority notifications",
      "Advanced analytics",
      "Promotional tools",
      "Priority email support",
    ],
  },
  {
    name: "Unlimited",
    price: "£45",
    period: "/month",
    orders: "Unlimited",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    borderColor: "rgba(139,92,246,0.25)",
    icon: Crown,
    current: true,
    features: [
      "Unlimited orders",
      "Premium menu placement",
      "Unlimited homemade products",
      "Real-time push notifications",
      "Full analytics suite",
      "Promotional & marketing tools",
      "Dedicated account manager",
      "24/7 priority support",
    ],
  },
];

const SERVICE_TYPES = [
  {
    id: "daily-meals",
    name: "Daily Meals & Tiffin",
    description: "Serve freshly cooked home-style meals, lunch boxes and tiffin service to nearby customers",
    icon: UtensilsCrossed,
    color: "#FF5A1F",
    bg: "rgba(255,90,31,0.08)",
    features: ["Breakfast, Lunch & Dinner", "Tiffin box service", "Daily changing menu", "Scheduled delivery slots"],
  },
  {
    id: "homemade-products",
    name: "Homemade Products",
    description: "Sell homemade pickles, papads, chutneys, masalas, sweets and other preserved items",
    icon: Store,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    features: ["Pickles & Chutneys", "Papads & Snacks", "Masala powders", "Sweets & Bakery items"],
  },
  {
    id: "catering",
    name: "Catering & Bulk Orders",
    description: "Accept large party orders, event catering and bulk meal prep for offices and gatherings",
    icon: Truck,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    features: ["Party orders (50+ servings)", "Office lunch catering", "Wedding & event food", "Custom menu planning"],
  },
  {
    id: "meal-subscriptions",
    name: "Meal Subscriptions",
    description: "Offer weekly and monthly meal subscription plans with flexible customisation",
    icon: Repeat,
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    features: ["Weekly meal plans", "Monthly tiffin subscriptions", "Pause & resume anytime", "Dietary customisation"],
  },
];

const PRODUCT_CATEGORIES = [
  { name: "Pickles", icon: "🫙", count: 0, color: "#EF4444" },
  { name: "Papads", icon: "🫓", count: 0, color: "#F59E0B" },
  { name: "Chutneys", icon: "🥫", count: 0, color: "#10B981" },
  { name: "Masalas", icon: "🌶️", count: 0, color: "#EF4444" },
  { name: "Sweets", icon: "🍬", count: 0, color: "#EC4899" },
  { name: "Snacks", icon: "🥜", count: 0, color: "#F97316" },
  { name: "Bakery", icon: "🍞", count: 0, color: "#8B5CF6" },
  { name: "Cakes", icon: "🎂", count: 0, color: "#EC4899" },
  { name: "Beverages", icon: "🥤", count: 0, color: "#06B6D4" },
];

const CHEF_BADGES = [
  { name: "Verified Kitchen", icon: ShieldCheck, color: "#10B981", bg: "rgba(16,185,129,0.1)", earned: true },
  { name: "Hygiene Certified", icon: Sparkles, color: "#3B82F6", bg: "rgba(59,130,246,0.1)", earned: true },
  { name: "Top Rated", icon: Award, color: "#F59E0B", bg: "rgba(245,158,11,0.1)", earned: false },
  { name: "Community Favourite", icon: Heart, color: "#EC4899", bg: "rgba(236,72,153,0.1)", earned: false },
  { name: "Eco Friendly", icon: Leaf, color: "#10B981", bg: "rgba(16,185,129,0.1)", earned: true },
  { name: "Local Hero", icon: MapPin, color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", earned: false },
];

const CAKE_CATEGORIES = [
  { name: "Birthday Cakes", icon: "🎂", count: 0, color: "#EC4899" },
  { name: "Wedding Cakes", icon: "💒", count: 0, color: "#8B5CF6" },
  { name: "Cupcakes", icon: "🧁", count: 0, color: "#F59E0B" },
  { name: "Pastries", icon: "🥐", count: 0, color: "#F97316" },
  { name: "Cheesecakes", icon: "🍰", count: 0, color: "#EF4444" },
  { name: "Brownies", icon: "🍫", count: 0, color: "#92400E" },
  { name: "Cookies", icon: "🍪", count: 0, color: "#D97706" },
  { name: "Custom Cakes", icon: "🎨", count: 0, color: "#3B82F6" },
];

const ADMIN_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

export default function DashboardPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [serviceToggles, setServiceToggles] = useState<Record<string, boolean>>({
    "daily-meals": true,
    "homemade-products": true,
    "catering": false,
    "meal-subscriptions": true,
  });
  const [cakeFilter, setCakeFilter] = useState<"all" | "egg" | "eggless">("all");
  const [enabledCategories, setEnabledCategories] = useState<Record<string, boolean>>({
    "Pickles": true, "Papads": false, "Chutneys": false, "Masalas": false,
    "Sweets": false, "Snacks": false, "Bakery": false, "Cakes": true, "Beverages": false,
  });
  const [activeProductTab, setActiveProductTab] = useState("all");
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [deliveryRadius, setDeliveryRadius] = useState(10);
  const [minOrderDelivery, setMinOrderDelivery] = useState(10);
  const [deliveryFee, setDeliveryFee] = useState(2);
  const [currentPlan, setCurrentPlan] = useState<"Starter" | "Growth" | "Unlimited">("Unlimited");
  const planCategoryLimit = currentPlan === "Starter" ? 1 : currentPlan === "Growth" ? 4 : 9;
  const enabledCount = Object.values(enabledCategories).filter(Boolean).length;

  // Approval state
  const [approvalStatus, setApprovalStatus] = useState<"loading" | "approved" | "pending" | "rejected">("loading");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [chefName, setChefName] = useState("");

  // Check auth + approval status on load
  useEffect(() => {
    const token = localStorage.getItem("homeal_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    async function checkApproval() {
      try {
        const res = await fetch(`${ADMIN_API_URL}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.role !== "CHEF") {
            window.location.href = "/login";
            return;
          }
          setChefName(data.data.name || "");
          setApprovalStatus(data.data.approvalStatus || "approved");
          setTrialEndsAt(data.data.trialEndsAt || null);
        } else {
          // Token invalid, redirect to login
          localStorage.removeItem("homeal_token");
          localStorage.removeItem("homeal_refresh_token");
          window.location.href = "/login";
        }
      } catch {
        // Fallback: try to decode token locally
        setApprovalStatus("approved");
      }
    }
    checkApproval();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Auto-disable excess categories when plan changes
  useEffect(() => {
    const enabled = Object.entries(enabledCategories).filter(([, v]) => v);
    if (enabled.length > planCategoryLimit) {
      const keep = enabled.slice(0, planCategoryLimit);
      const updated: Record<string, boolean> = {};
      PRODUCT_CATEGORIES.forEach(c => { updated[c.name] = false; });
      keep.forEach(([k]) => { updated[k] = true; });
      setEnabledCategories(updated);
    }
  }, [planCategoryLimit]);

  const toggleService = (id: string) => {
    setServiceToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const customPages = ["dashboard", "settings", "menu", "products", "my-services", "add-product", "add-dish", "add-cake", "active-orders", "order-history", "notifications", "subscriptions", "earnings", "reviews", "analytics"];

  // Trial banner helpers
  const trialDate = trialEndsAt ? new Date(trialEndsAt) : null;
  const trialDaysLeft = trialDate ? Math.max(0, Math.ceil((trialDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  // Blocking overlays for pending/rejected
  if (approvalStatus === "loading") {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "var(--bg)", fontFamily: "var(--font-poppins)" }}>
        <div className="text-center">
          <RefreshCw size={40} className="mx-auto mb-4 animate-spin" style={{ color: "#8B5CF6" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (approvalStatus === "pending") {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #FFF7ED, #FFFBEB, #FFF0F3)", fontFamily: "var(--font-poppins)" }}>
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(245,158,11,0.12)" }}>
            <Clock size={40} style={{ color: "#F59E0B" }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#2D2D3F" }}>
            <span style={{ color: "#2D8B3D" }}>Ho</span><span style={{ color: "#FF8534" }}>me</span><span style={{ color: "#2D8B3D" }}>al</span>
          </h1>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "#F59E0B" }}>Pending Approval</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#4A4A65" }}>
            Your kitchen registration is being reviewed by our team. You&apos;ll receive a welcome email once approved with your free 3-month Unlimited plan.
          </p>
          <div className="rounded-2xl p-5 mb-6" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "#F59E0B" }}>What happens next?</p>
            <ul className="text-xs text-left space-y-2" style={{ color: "#4A4A65" }}>
              <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#10B981" }} /> Our admin reviews your registration</li>
              <li className="flex items-start gap-2"><Clock size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#F59E0B" }} /> You receive an approval email</li>
              <li className="flex items-start gap-2"><Crown size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#8B5CF6" }} /> 3-month free Unlimited plan starts</li>
              <li className="flex items-start gap-2"><ChefHat size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#FF8534" }} /> Start listing your dishes!</li>
            </ul>
          </div>
          <p className="text-xs" style={{ color: "#9595B0" }}>
            Questions? Email us at <a href="mailto:homealforuk@gmail.com" style={{ color: "#8B5CF6", fontWeight: 600 }}>homealforuk@gmail.com</a>
          </p>
        </div>
      </div>
    );
  }

  if (approvalStatus === "rejected") {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #FEF2F2, #FFF0F3)", fontFamily: "var(--font-poppins)" }}>
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
            <AlertCircle size={40} style={{ color: "#EF4444" }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#2D2D3F" }}>
            <span style={{ color: "#2D8B3D" }}>Ho</span><span style={{ color: "#FF8534" }}>me</span><span style={{ color: "#2D8B3D" }}>al</span>
          </h1>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "#EF4444" }}>Registration Not Approved</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#4A4A65" }}>
            Unfortunately, your registration could not be approved at this time. If you believe this was a mistake, please reach out to us.
          </p>
          <a
            href="mailto:homealforuk@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
            style={{ background: "#8B5CF6" }}
          >
            <Mail size={16} /> Contact Support
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full overflow-x-hidden app-height">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-200 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ background: "var(--sidebar-bg)" }}>
        {/* Sidebar branding */}
        <div className="py-3 px-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 px-2.5" aria-label="Homeal - Home">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--logo-bg)" }}>
              <img src="/favicon-final-2.png" alt="" className="w-7 h-7 rounded-lg" />
            </div>
            <img src="/logo-full.png" alt="Homeal - Healthy food, from home" className="h-9 w-auto shrink-0" />
          </a>
          <button className="md:hidden p-1 rounded-lg hover:bg-[var(--sidebar-hover)]" onClick={() => setSidebarOpen(false)}>
            <X size={20} style={{ color: "var(--sidebar-text)" }} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pt-3">
          {SIDEBAR_ITEMS.map((group, gi) => (
            <div key={gi} className="mb-4">
              <div
                className="text-[11px] font-semibold tracking-widest uppercase px-3 mb-2"
                style={{ color: "var(--sidebar-section)" }}
              >
                {group.section}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-[14px] font-medium transition-all mb-0.5"
                    style={{
                      background: isActive ? "var(--sidebar-active-bg)" : "transparent",
                      color: isActive ? "var(--sidebar-active-text)" : "var(--sidebar-text)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = "var(--sidebar-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: isActive ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "transparent",
                      }}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2 : 1.8} style={{ color: isActive ? "#FFFFFF" : "inherit" }} />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="px-3 pb-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all"
            style={{ color: "var(--sidebar-text)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--sidebar-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            {darkMode ? <Sun size={20} strokeWidth={1.8} /> : <Moon size={20} strokeWidth={1.8} />}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        {/* Top bar */}
        <header className="px-4 md:px-6 h-14 border-b border-[var(--border)] flex items-center" style={{ background: "var(--header-bg)" }}>
          <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--input)] transition mr-3" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-[var(--text)]" />
          </button>
          <h1 className="text-lg font-semibold text-[var(--text)] flex-1 min-w-0 truncate">{PAGE_TITLES[activePage] || "Dashboard"}</h1>
          <div className="flex items-center gap-1.5 sm:gap-2 ml-3">
            <button onClick={() => setActivePage("notifications")} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--input)] transition">
              <Bell size={18} className="text-[var(--text-muted)]" />
            </button>
            <button onClick={() => setActivePage("settings")} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--input)] transition">
              <Settings size={18} className="text-[var(--text-muted)]" />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ml-0.5" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>AK</div>
          </div>
        </header>

        {/* Trial Banner */}
        {trialDate && trialDaysLeft !== null && (
          <div className="px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2" style={{
            background: trialDaysLeft > 30 ? "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(255,133,52,0.08))" : trialDaysLeft > 7 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
            borderBottom: `1px solid ${trialDaysLeft > 30 ? "rgba(139,92,246,0.15)" : trialDaysLeft > 7 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}>
            <div className="flex items-center gap-2">
              <Crown size={16} style={{ color: "#8B5CF6" }} />
              <span className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Unlimited Plan — Free Trial</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {trialDaysLeft > 0
                  ? `Ends ${trialDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} (${trialDaysLeft} days left)`
                  : "Trial expired"}
              </span>
            </div>
            {trialDaysLeft <= 7 && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>
                {trialDaysLeft === 0 ? "Expired" : `${trialDaysLeft} days remaining`}
              </span>
            )}
          </div>
        )}

        <div className="p-3 sm:p-6">
          {/* Dashboard */}
          {activePage === "dashboard" && (
            <>
              {/* Kitchen Info Banner */}
              <div
                className="rounded-2xl border border-[var(--border)] px-4 sm:px-6 py-4 sm:py-5 mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                style={{ background: "var(--header-bg)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}
                  >
                    <ChefHat size={28} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">Amma&apos;s Kitchen</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1.5"><Phone size={12} /> +44 7700 900000</span>
                      <span className="flex items-center gap-1.5 hidden sm:flex"><Mail size={12} /> chef@homeal.co.uk</span>
                      <span className="flex items-center gap-1.5"><MapPin size={12} /> London, UK</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border" style={{ color: "#10B981", borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.1)" }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />Active
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border" style={{ color: "#3B82F6", borderColor: "rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)" }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />Home Chef
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border" style={{ color: "#10B981", borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.1)" }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />Online
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-[var(--text-muted)]">Welcome, Chef</p>
                  <span
                    className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-[11px] font-semibold border"
                    style={{ color: "var(--primary)", borderColor: "rgba(255,90,31,0.3)", background: "rgba(255,90,31,0.08)" }}
                  >
                    <ChefHat size={12} /> Admin
                  </span>
                </div>
              </div>

              {/* Chef Badges & Trust Indicators */}
              <div
                className="rounded-2xl border border-[var(--border)] px-5 py-4 mb-5"
                style={{ background: "var(--header-bg)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-[var(--text)] flex items-center gap-2">
                    <Award size={14} style={{ color: "#F59E0B" }} /> Chef Badges & Trust Score
                  </h3>
                  <span className="text-[11px] text-[var(--text-muted)]">3 of 6 earned</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {CHEF_BADGES.map((badge, i) => {
                    const BadgeIcon = badge.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all"
                        style={{
                          background: badge.earned ? badge.bg : "transparent",
                          borderColor: badge.earned ? `${badge.color}30` : "var(--border)",
                          opacity: badge.earned ? 1 : 0.4,
                        }}
                      >
                        <BadgeIcon size={16} style={{ color: badge.color }} />
                        <span className="text-[11px] font-medium" style={{ color: badge.earned ? badge.color : "var(--text-muted)" }}>
                          {badge.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Services Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {SERVICE_TYPES.map((svc) => {
                  const SvcIcon = svc.icon;
                  const isOn = serviceToggles[svc.id];
                  return (
                    <div
                      key={svc.id}
                      className="rounded-2xl border px-4 py-3 flex items-center gap-3 transition-all cursor-pointer"
                      style={{
                        background: isOn ? svc.bg : "var(--header-bg)",
                        borderColor: isOn ? `${svc.color}30` : "var(--border)",
                      }}
                      onClick={() => setActivePage("my-services")}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: isOn ? `${svc.color}20` : "var(--input)" }}>
                        <SvcIcon size={18} style={{ color: isOn ? svc.color : "var(--text-muted)" }} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold" style={{ color: isOn ? svc.color : "var(--text-muted)" }}>
                          {svc.id === "daily-meals" ? "Daily Meals" : svc.id === "homemade-products" ? "Products" : svc.id === "catering" ? "Catering" : "Subscriptions"}
                        </p>
                        <p className="text-[10px]" style={{ color: isOn ? svc.color : "var(--text-muted)" }}>
                          {isOn ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dashboard Welcome Bar */}
              <div
                className="rounded-2xl border border-[var(--border)] px-5 py-4 mb-5 flex items-center justify-between"
                style={{ background: "var(--header-bg)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}
                  >
                    <LayoutDashboard size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Dashboard</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Welcome back, Managobinda Sethi</p>
                  </div>
                </div>
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80"
                  style={{ background: "var(--input)" }}
                >
                  <RefreshCw size={18} className="text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Stats Row 1 - Today */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                {STATS_ROW1.map((s, i) => {
                  const StatIcon = s.icon;
                  return (
                    <div key={i} className="p-4 rounded-2xl border border-[var(--border)] transition-all hover:scale-[1.02]" style={{ background: "var(--header-bg)" }}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <StatIcon size={18} style={{ color: s.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-1">{s.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Stats Row 2 - Weekly/Monthly */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
                {STATS_ROW2.map((s, i) => {
                  const StatIcon = s.icon;
                  return (
                    <div key={i} className="p-4 rounded-2xl border border-[var(--border)] transition-all hover:scale-[1.02]" style={{ background: "var(--header-bg)" }}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <StatIcon size={18} style={{ color: s.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-1">{s.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Active Orders Panel */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] p-6">
                <h2 className="text-sm font-semibold text-[var(--text)] mb-4">Active Orders</h2>
                <div className="text-center py-12 text-[var(--text-muted)]">
                  <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No active orders yet</p>
                  <p className="text-xs mt-1">New orders will appear here with sound alerts</p>
                </div>
              </div>
            </>
          )}

          {/* My Services Page */}
          {activePage === "my-services" && (
            <>
              {/* Services Header */}
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <Grip size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">My Services</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Configure what you offer to customers</p>
                  </div>
                </div>
              </div>

              {/* Service description */}
              <div
                className="rounded-2xl border px-5 py-4 mb-6 flex items-center gap-3"
                style={{ background: "rgba(59,130,246,0.06)", borderColor: "rgba(59,130,246,0.2)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                  <Sparkles size={20} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">Enable the services you want to offer</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Toggle services on/off based on your availability. Customers will only see your active services.</p>
                </div>
              </div>

              {/* Service Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {SERVICE_TYPES.map((svc) => {
                  const SvcIcon = svc.icon;
                  const isOn = serviceToggles[svc.id];
                  return (
                    <div
                      key={svc.id}
                      className="rounded-2xl border p-5 transition-all"
                      style={{
                        background: "var(--header-bg)",
                        borderColor: isOn ? `${svc.color}40` : "var(--border)",
                        boxShadow: isOn ? `0 0 0 1px ${svc.color}20` : "none",
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: svc.bg }}>
                            <SvcIcon size={24} style={{ color: svc.color }} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[var(--text)]">{svc.name}</h3>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 max-w-[220px]">{svc.description}</p>
                          </div>
                        </div>
                        {/* Toggle */}
                        <button
                          onClick={() => toggleService(svc.id)}
                          className="w-12 h-7 rounded-full flex items-center transition-all flex-shrink-0"
                          style={{
                            background: isOn ? svc.color : "var(--border)",
                            padding: "2px",
                            justifyContent: isOn ? "flex-end" : "flex-start",
                          }}
                        >
                          <div className="w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-all" />
                        </button>
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-2">
                        {svc.features.map((f, fi) => (
                          <div key={fi} className="flex items-center gap-2 text-[11px] text-[var(--text-soft)]">
                            <Check size={12} style={{ color: isOn ? svc.color : "var(--text-muted)" }} />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status */}
                      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                        <span className="text-[11px] font-medium" style={{ color: isOn ? svc.color : "var(--text-muted)" }}>
                          {isOn ? "Service Active" : "Service Inactive"}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">0 orders this week</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Homemade Products Page - Tabbed */}
          {activePage === "products" && (
            <>
              {/* Products Header */}
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <Store size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Homemade Products</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />{enabledCount} Active Categories</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full" style={{ background: "#8B5CF6" }} />{currentPlan} Plan ({planCategoryLimit === 9 ? "All" : planCategoryLimit} categories)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setActivePage("settings")} className="px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-80 flex items-center gap-2" style={{ background: "var(--input)", color: "var(--text)" }}>
                    <Settings size={14} /> Manage Categories
                  </button>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveProductTab("all")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
                  style={{
                    background: activeProductTab === "all" ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "var(--header-bg)",
                    color: activeProductTab === "all" ? "#FFFFFF" : "var(--text-muted)",
                    border: activeProductTab === "all" ? "none" : "1px solid var(--border)",
                  }}
                >
                  All Products
                </button>
                {PRODUCT_CATEGORIES.filter(cat => enabledCategories[cat.name]).map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveProductTab(cat.name)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0"
                    style={{
                      background: activeProductTab === cat.name ? `${cat.color}15` : "var(--header-bg)",
                      color: activeProductTab === cat.name ? cat.color : "var(--text-muted)",
                      border: `1px solid ${activeProductTab === cat.name ? `${cat.color}40` : "var(--border)"}`,
                    }}
                  >
                    <span>{cat.icon}</span> {cat.name}
                  </button>
                ))}
              </div>

              {/* Cakes Special: Egg/Eggless Filter */}
              {activeProductTab === "Cakes" && (
                <div
                  className="rounded-2xl border px-5 py-4 mb-6"
                  style={{ background: "var(--header-bg)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                      <Cake size={16} style={{ color: "#EC4899" }} /> Egg / Eggless Filter
                    </h3>
                  </div>
                  <div className="flex gap-3">
                    {([
                      { id: "all" as const, label: "All Cakes", icon: "🎂", color: "#8B5CF6" },
                      { id: "egg" as const, label: "Egg", icon: "🥚", color: "#F59E0B" },
                      { id: "eggless" as const, label: "Eggless", icon: "🌱", color: "#10B981" },
                    ]).map((filter) => {
                      const isActive = cakeFilter === filter.id;
                      return (
                        <button
                          key={filter.id}
                          onClick={() => setCakeFilter(filter.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all"
                          style={{
                            background: isActive ? `${filter.color}10` : "transparent",
                            borderColor: isActive ? `${filter.color}50` : "var(--border)",
                          }}
                        >
                          <span className="text-lg">{filter.icon}</span>
                          <span className="text-xs font-semibold" style={{ color: isActive ? filter.color : "var(--text-muted)" }}>{filter.label}</span>
                          {isActive && <Check size={14} style={{ color: filter.color }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Content based on active tab */}
              {activeProductTab === "all" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {PRODUCT_CATEGORIES.filter(cat => enabledCategories[cat.name]).map((cat) => (
                      <div
                        key={cat.name}
                        onClick={() => setActiveProductTab(cat.name)}
                        className="rounded-2xl border border-[var(--border)] p-4 flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer"
                        style={{ background: "var(--header-bg)" }}
                      >
                        <span className="text-3xl">{cat.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text)]">{cat.name}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{cat.count} items</p>
                        </div>
                        {cat.name === "Cakes" && <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ color: "#EC4899", background: "rgba(236,72,153,0.1)" }}>Egg/Eggless</span>}
                      </div>
                    ))}
                  </div>
                  {enabledCount === 0 && (
                    <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] p-8 text-center">
                      <Store size={40} className="mx-auto mb-3 text-[var(--text-muted)] opacity-20" />
                      <p className="text-sm font-medium text-[var(--text)]">No product categories enabled</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Go to Settings to enable product categories</p>
                      <button onClick={() => setActivePage("settings")} className="mt-4 px-5 py-2 rounded-xl text-white text-xs font-medium inline-flex items-center gap-2" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                        <Settings size={14} /> Open Settings
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Add button for current tab */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                      {PRODUCT_CATEGORIES.find(c => c.name === activeProductTab)?.icon} {activeProductTab}
                    </h3>
                    <button
                      onClick={() => setActivePage(activeProductTab === "Cakes" ? "add-cake" : "add-product")}
                      className="px-4 py-2 rounded-xl text-white text-xs font-medium flex items-center gap-2 transition hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}
                    >
                      <PlusCircle size={14} />
                      Add {activeProductTab === "Cakes" ? "Cake" : activeProductTab.endsWith("s") ? activeProductTab.slice(0, -1) : activeProductTab}
                    </button>
                  </div>

                  {/* Cake sub-categories */}
                  {activeProductTab === "Cakes" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                      {CAKE_CATEGORIES.map((cat, i) => (
                        <div key={i} className="rounded-xl border border-[var(--border)] p-3 text-center transition-all hover:scale-[1.02] cursor-pointer" style={{ background: "var(--header-bg)" }}>
                          <div className="text-2xl mb-1">{cat.icon}</div>
                          <p className="text-[11px] font-semibold text-[var(--text)]">{cat.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{cat.count} items</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Products table for this category */}
                  <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ background: "var(--input)" }}>
                          <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">
                            {activeProductTab === "Cakes" ? "Cake Name" : "Product Name"}
                          </th>
                          {activeProductTab === "Cakes" && (
                            <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">🥚 Egg/Eggless</th>
                          )}
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Price</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">{activeProductTab === "Cakes" ? "Weight" : "Weight/Qty"}</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">{activeProductTab === "Cakes" ? "Serves" : "Shelf Life"}</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={activeProductTab === "Cakes" ? 7 : 6} className="px-5 py-14 text-center text-[var(--text-muted)]">
                            {activeProductTab === "Cakes" ? <Cake size={36} className="mx-auto mb-3 opacity-20" /> : <Store size={36} className="mx-auto mb-3 opacity-20" />}
                            <p className="text-sm font-medium">No {activeProductTab.toLowerCase()} added yet</p>
                            <p className="text-[11px] mt-1">Click the button above to add your first item</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {/* Add Product Form */}
          {activePage === "add-product" && (
            <>
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <Store size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Add New Product</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">List a homemade product in your store</p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePage("products")}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-80"
                  style={{ background: "var(--input)", color: "var(--text)" }}
                >
                  Back to Products
                </button>
              </div>

              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Product Name *</label>
                      <input type="text" placeholder="e.g. Mango Pickle, Masoor Papad" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Category *</label>
                      <select className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[var(--primary)] transition">
                        <option value="">Select a category</option>
                        {PRODUCT_CATEGORIES.map((cat, i) => (
                          <option key={i} value={cat.name}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Description</label>
                      <textarea rows={3} placeholder="Describe your product, ingredients, taste..." className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Ingredients</label>
                      <textarea rows={2} placeholder="List main ingredients..." className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition resize-none" />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Price (&pound;) *</label>
                        <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Weight / Qty *</label>
                        <input type="text" placeholder="e.g. 250g, 500ml, 12pcs" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Shelf Life</label>
                        <input type="text" placeholder="e.g. 6 months, 1 year" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Stock Quantity</label>
                        <input type="number" placeholder="0" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Allergen Info</label>
                      <input type="text" placeholder="e.g. Contains mustard, nuts" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Product Image</label>
                      <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center cursor-pointer hover:border-[var(--primary)] transition">
                        <Package size={28} className="mx-auto mb-2 text-[var(--text-muted)] opacity-40" />
                        <p className="text-xs text-[var(--text-muted)]">Click to upload or drag & drop</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[var(--border)]">
                  <button onClick={() => setActivePage("products")} className="px-5 py-2.5 rounded-xl text-sm font-medium transition hover:opacity-80" style={{ background: "var(--input)", color: "var(--text)" }}>
                    Cancel
                  </button>
                  <button className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text)] border border-[var(--border)] transition hover:opacity-80">
                    Save as Draft
                  </button>
                  <button className="px-6 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    Publish Product
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Add Dish Form */}
          {activePage === "add-dish" && (
            <>
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <UtensilsCrossed size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Add New Dish</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Add a dish to your daily menu</p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePage("menu")}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-80"
                  style={{ background: "var(--input)", color: "var(--text)" }}
                >
                  Back to Menu
                </button>
              </div>

              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Dish Name *</label>
                      <input type="text" placeholder="e.g. Chicken Biryani, Dal Tadka" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Category *</label>
                      <select className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[var(--primary)] transition">
                        <option value="">Select a category</option>
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snacks">Snacks</option>
                        <option value="dessert">Dessert</option>
                        <option value="beverages">Beverages</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Description</label>
                      <textarea rows={3} placeholder="Describe your dish..." className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Diet Type *</label>
                      <div className="flex gap-3">
                        {["Veg", "Non-Veg", "Vegan"].map((diet) => (
                          <label key={diet} className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition">
                            <input type="radio" name="diet" value={diet} className="accent-[var(--primary)]" />
                            <span className="text-sm text-[var(--text)]">{diet}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Price (&pound;) *</label>
                        <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Prep Time</label>
                        <input type="text" placeholder="e.g. 30 mins" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Serves</label>
                        <input type="text" placeholder="e.g. 1-2 persons" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Spice Level</label>
                        <select className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[var(--primary)] transition">
                          <option value="mild">Mild</option>
                          <option value="medium">Medium</option>
                          <option value="hot">Hot</option>
                          <option value="extra-hot">Extra Hot</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Allergen Info</label>
                      <input type="text" placeholder="e.g. Contains dairy, gluten" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Dish Image</label>
                      <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center cursor-pointer hover:border-[var(--primary)] transition">
                        <UtensilsCrossed size={28} className="mx-auto mb-2 text-[var(--text-muted)] opacity-40" />
                        <p className="text-xs text-[var(--text-muted)]">Click to upload or drag & drop</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[var(--border)]">
                  <button onClick={() => setActivePage("menu")} className="px-5 py-2.5 rounded-xl text-sm font-medium transition hover:opacity-80" style={{ background: "var(--input)", color: "var(--text)" }}>
                    Cancel
                  </button>
                  <button className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text)] border border-[var(--border)] transition hover:opacity-80">
                    Save as Draft
                  </button>
                  <button className="px-6 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    Publish Dish
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Add Cake Form */}
          {activePage === "add-cake" && (
            <>
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <Cake size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Add New Cake</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">List a cake with egg or eggless options</p>
                  </div>
                </div>
                <button
                  onClick={() => { setActivePage("products"); setActiveProductTab("Cakes"); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-80"
                  style={{ background: "var(--input)", color: "var(--text)" }}
                >
                  Back to Cakes
                </button>
              </div>

              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Cake Name *</label>
                      <input type="text" placeholder="e.g. Chocolate Truffle, Red Velvet" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Cake Category *</label>
                      <select className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[var(--primary)] transition">
                        <option value="">Select a category</option>
                        {CAKE_CATEGORIES.map((cat, i) => (
                          <option key={i} value={cat.name}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Description</label>
                      <textarea rows={3} placeholder="Describe flavour, layers, frosting..." className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition resize-none" />
                    </div>

                    {/* Egg / Eggless Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-2">Egg / Eggless *</label>
                      <div className="flex gap-3">
                        <label className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] cursor-pointer hover:border-[#F59E0B] transition has-[:checked]:border-[#F59E0B] has-[:checked]:bg-[rgba(245,158,11,0.06)]">
                          <input type="radio" name="eggType" value="egg" className="accent-[#F59E0B]" />
                          <span className="text-xl">🥚</span>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text)]">Egg</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Contains egg</p>
                          </div>
                        </label>
                        <label className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] cursor-pointer hover:border-[#10B981] transition has-[:checked]:border-[#10B981] has-[:checked]:bg-[rgba(16,185,129,0.06)]">
                          <input type="radio" name="eggType" value="eggless" className="accent-[#10B981]" />
                          <span className="text-xl">🌱</span>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text)]">Eggless</p>
                            <p className="text-[10px] text-[var(--text-muted)]">100% eggless</p>
                          </div>
                        </label>
                        <label className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] cursor-pointer hover:border-[#8B5CF6] transition has-[:checked]:border-[#8B5CF6] has-[:checked]:bg-[rgba(139,92,246,0.06)]">
                          <input type="radio" name="eggType" value="both" className="accent-[#8B5CF6]" />
                          <span className="text-xl">🎂</span>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text)]">Both</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Offer both variants</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Price (&pound;) *</label>
                        <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Weight *</label>
                        <select className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[var(--primary)] transition">
                          <option value="">Select weight</option>
                          <option value="0.5">0.5 kg (500g)</option>
                          <option value="1">1 kg</option>
                          <option value="1.5">1.5 kg</option>
                          <option value="2">2 kg</option>
                          <option value="3">3 kg</option>
                          <option value="5">5 kg</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Serves</label>
                        <input type="text" placeholder="e.g. 8-10 persons" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Prep Time</label>
                        <input type="text" placeholder="e.g. 4-6 hours" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Flavour / Frosting</label>
                      <input type="text" placeholder="e.g. Buttercream, Fondant, Whipped cream" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Allergen Info</label>
                      <input type="text" placeholder="e.g. Contains dairy, gluten, nuts" className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Cake Image</label>
                      <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center cursor-pointer hover:border-[#EC4899] transition">
                        <Cake size={28} className="mx-auto mb-2 text-[var(--text-muted)] opacity-40" />
                        <p className="text-xs text-[var(--text-muted)]">Click to upload or drag & drop</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[var(--border)]">
                  <button onClick={() => { setActivePage("products"); setActiveProductTab("Cakes"); }} className="px-5 py-2.5 rounded-xl text-sm font-medium transition hover:opacity-80" style={{ background: "var(--input)", color: "var(--text)" }}>
                    Cancel
                  </button>
                  <button className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text)] border border-[var(--border)] transition hover:opacity-80">
                    Save as Draft
                  </button>
                  <button className="px-6 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    Publish Cake
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Settings Page */}
          {activePage === "settings" && (
            <>
              {/* Settings Header */}
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}
                  >
                    <Settings size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Settings & Subscription</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Manage your plan and kitchen settings</p>
                  </div>
                </div>
              </div>

              {/* Current Plan Badge */}
              {(() => {
                const cp = PLANS.find(p => p.name === currentPlan) || PLANS[2];
                return (
                  <div
                    className="rounded-2xl border px-5 py-4 mb-6 flex items-center justify-between"
                    style={{ background: `${cp.color}08`, borderColor: `${cp.color}30` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cp.color}20` }}>
                        <Crown size={20} style={{ color: cp.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">Current Plan: <span style={{ color: cp.color }}>{currentPlan}</span></p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{cp.orders} orders/month &middot; {planCategoryLimit === 9 ? "All" : planCategoryLimit} product {planCategoryLimit === 1 ? "category" : "categories"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ color: "#10B981", background: "rgba(16,185,129,0.12)" }}>
                        Active
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Subscription Plans */}
              <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Choose Your Plan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-6">
                {PLANS.map((plan, i) => {
                  const PlanIcon = plan.icon;
                  const isCurrent = plan.name === currentPlan;
                  return (
                    <div
                      key={i}
                      className="relative rounded-2xl border p-5 transition-all hover:scale-[1.02]"
                      style={{
                        background: "var(--header-bg)",
                        borderColor: isCurrent ? plan.color : "var(--border)",
                        boxShadow: isCurrent ? `0 0 0 1px ${plan.borderColor}, 0 4px 12px ${plan.bg}` : "none",
                      }}
                    >
                      {"popular" in plan && plan.popular && (
                        <div
                          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white"
                          style={{ background: plan.color }}
                        >
                          MOST POPULAR
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: plan.bg }}>
                          <PlanIcon size={22} style={{ color: plan.color }} />
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-[var(--text)]">{plan.name}</h4>
                          <p className="text-[10px] text-[var(--text-muted)]">{plan.orders} orders/month</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="text-3xl font-bold" style={{ color: plan.color }}>{plan.price}</span>
                        {plan.period && <span className="text-sm text-[var(--text-muted)]">{plan.period}</span>}
                      </div>
                      <ul className="space-y-2.5 mb-5">
                        {plan.features.map((f, fi) => (
                          <li key={fi} className="flex items-start gap-2 text-xs text-[var(--text-soft)]">
                            <Check size={14} style={{ color: plan.color }} className="mt-0.5 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => setCurrentPlan(plan.name as "Starter" | "Growth" | "Unlimited")}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
                        style={
                          isCurrent
                            ? { background: plan.bg, color: plan.color, border: `1px solid ${plan.borderColor}` }
                            : { background: plan.color, color: "#FFFFFF" }
                        }
                      >
                        {isCurrent ? "Current Plan" : `Select ${plan.name}`}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Plan Comparison */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] p-6">
                <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Plan Comparison</h3>
                <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: "var(--input)" }}>
                        <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Feature</th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: "#10B981" }}>Starter</th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: "#3B82F6" }}>Growth</th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: "#8B5CF6" }}>Unlimited</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { feature: "Monthly Orders", starter: "30", growth: "150", unlimited: "Unlimited" },
                        { feature: "Menu Listing", starter: "Basic", growth: "Featured", unlimited: "Premium" },
                        { feature: "Homemade Store", starter: "1 item", growth: "4 items", unlimited: "All" },
                        { feature: "Product Categories", starter: "1 category", growth: "4 categories", unlimited: "All 9" },
                        { feature: "Analytics", starter: "Basic", growth: "Advanced", unlimited: "Full Suite" },
                        { feature: "Notifications", starter: "Email", growth: "Priority", unlimited: "Real-time Push" },
                        { feature: "Tiffin Subscriptions", starter: "\u2014", growth: "Yes", unlimited: "Yes" },
                        { feature: "Catering Orders", starter: "\u2014", growth: "\u2014", unlimited: "Yes" },
                        { feature: "Promotional Tools", starter: "\u2014", growth: "Yes", unlimited: "Yes" },
                        { feature: "Account Manager", starter: "\u2014", growth: "\u2014", unlimited: "Dedicated" },
                        { feature: "Support", starter: "Email", growth: "Priority Email", unlimited: "24/7 Priority" },
                        { feature: "Price", starter: "Free", growth: "\u00a330/mo", unlimited: "\u00a345/mo" },
                      ].map((row, ri) => (
                        <tr key={ri} className="border-t border-[var(--border)]">
                          <td className="px-4 py-2.5 font-medium text-[var(--text)]">{row.feature}</td>
                          <td className="px-4 py-2.5 text-center text-[var(--text-muted)]">{row.starter}</td>
                          <td className="px-4 py-2.5 text-center text-[var(--text-muted)]">{row.growth}</td>
                          <td className="px-4 py-2.5 text-center text-[var(--text-muted)]">{row.unlimited}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Product Category Toggles */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                    <Store size={16} style={{ color: "#8B5CF6" }} /> Product Categories
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: enabledCount >= planCategoryLimit ? "#EF4444" : "#10B981" }}>
                      {enabledCount} of {planCategoryLimit === 9 ? "9" : planCategoryLimit} enabled
                    </span>
                    {enabledCount >= planCategoryLimit && planCategoryLimit < 9 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ color: "#F59E0B", background: "rgba(245,158,11,0.12)" }}>
                        Upgrade for more
                      </span>
                    )}
                  </div>
                </div>

                {/* Plan limit info bar */}
                <div
                  className="rounded-xl border px-4 py-3 mb-4 flex items-center gap-3"
                  style={{
                    background: enabledCount >= planCategoryLimit && planCategoryLimit < 9 ? "rgba(245,158,11,0.06)" : "rgba(16,185,129,0.06)",
                    borderColor: enabledCount >= planCategoryLimit && planCategoryLimit < 9 ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)",
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                    background: enabledCount >= planCategoryLimit && planCategoryLimit < 9 ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
                  }}>
                    {enabledCount >= planCategoryLimit && planCategoryLimit < 9
                      ? <AlertCircle size={16} style={{ color: "#F59E0B" }} />
                      : <Check size={16} style={{ color: "#10B981" }} />
                    }
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text)]">
                      {currentPlan} Plan &mdash; {planCategoryLimit === 9 ? "All categories available" : `${planCategoryLimit} ${planCategoryLimit === 1 ? "category" : "categories"} allowed`}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {planCategoryLimit < 9
                        ? `Enable up to ${planCategoryLimit} product ${planCategoryLimit === 1 ? "category" : "categories"}. Upgrade to ${planCategoryLimit === 1 ? "Growth" : "Unlimited"} for ${planCategoryLimit === 1 ? "4" : "all 9"}.`
                        : "Toggle categories on or off to show them in your Products page."
                      }
                    </p>
                  </div>
                </div>

                {/* Category toggle grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {PRODUCT_CATEGORIES.map((cat) => {
                    const isEnabled = enabledCategories[cat.name];
                    const canEnable = isEnabled || enabledCount < planCategoryLimit;
                    return (
                      <div
                        key={cat.name}
                        className="rounded-2xl border p-4 transition-all"
                        style={{
                          background: isEnabled ? `${cat.color}08` : "var(--header-bg)",
                          borderColor: isEnabled ? `${cat.color}40` : "var(--border)",
                          opacity: canEnable ? 1 : 0.5,
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{cat.icon}</span>
                            <div>
                              <p className="text-sm font-semibold text-[var(--text)]">{cat.name}</p>
                              <p className="text-[10px] text-[var(--text-muted)]">{cat.count} items</p>
                            </div>
                          </div>
                          {/* Toggle switch */}
                          <button
                            onClick={() => {
                              if (!canEnable && !isEnabled) return;
                              setEnabledCategories(prev => ({ ...prev, [cat.name]: !prev[cat.name] }));
                            }}
                            className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                            style={{
                              background: isEnabled ? cat.color : "var(--border)",
                              cursor: canEnable ? "pointer" : "not-allowed",
                            }}
                          >
                            <div
                              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                              style={{ left: isEnabled ? "22px" : "2px" }}
                            />
                          </button>
                        </div>
                        {cat.name === "Cakes" && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ color: "#EC4899", background: "rgba(236,72,153,0.1)" }}>Egg/Eggless</span>
                          </div>
                        )}
                        {isEnabled && (
                          <button
                            onClick={() => { setActivePage("products"); setActiveProductTab(cat.name); }}
                            className="mt-3 w-full py-1.5 rounded-lg text-[11px] font-semibold transition hover:opacity-80"
                            style={{ color: cat.color, background: `${cat.color}12`, border: `1px solid ${cat.color}25` }}
                          >
                            View {cat.name} &rarr;
                          </button>
                        )}
                        {!canEnable && !isEnabled && (
                          <p className="text-[10px] text-[var(--text-muted)] mt-2 flex items-center gap-1">
                            <Crown size={10} style={{ color: "#F59E0B" }} /> Upgrade to enable
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery & Pickup Settings */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  <Truck size={16} style={{ color: "#3B82F6" }} /> Delivery & Pickup Settings
                </h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">Configure how customers receive their orders. These settings are visible on your public profile.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  {/* Delivery Card */}
                  <div
                    className="rounded-2xl border p-5 transition-all"
                    style={{
                      background: deliveryEnabled ? "rgba(59,130,246,0.05)" : "var(--header-bg)",
                      borderColor: deliveryEnabled ? "rgba(59,130,246,0.3)" : "var(--border)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.12)" }}>
                          <Truck size={24} style={{ color: "#3B82F6" }} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[var(--text)]">Home Delivery</h4>
                          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Deliver orders to customer&apos;s doorstep</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDeliveryEnabled(!deliveryEnabled)}
                        className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                        style={{ background: deliveryEnabled ? "#3B82F6" : "var(--border)" }}
                      >
                        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all" style={{ left: deliveryEnabled ? "22px" : "2px" }} />
                      </button>
                    </div>

                    {deliveryEnabled && (
                      <>
                        <div className="mb-3">
                          <label className="block text-xs font-semibold text-[var(--text)] mb-2 flex items-center gap-1.5">
                            <Navigation size={12} style={{ color: "#3B82F6" }} /> Delivery Radius
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={1}
                              max={25}
                              value={deliveryRadius}
                              onChange={(e) => setDeliveryRadius(Number(e.target.value))}
                              className="flex-1 accent-[#3B82F6] h-2"
                            />
                            <span className="text-sm font-bold w-16 text-right" style={{ color: "#3B82F6" }}>{deliveryRadius} miles</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                            <span>1 mile</span>
                            <span>25 miles</span>
                          </div>
                        </div>
                        {/* Min Order & Delivery Fee */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-[var(--text)] mb-1.5 flex items-center gap-1">
                              <PoundSterling size={10} style={{ color: "#3B82F6" }} /> Min Order for Delivery
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">&pound;</span>
                              <input
                                type="number"
                                min={0}
                                step={0.5}
                                value={minOrderDelivery}
                                onChange={(e) => setMinOrderDelivery(Number(e.target.value))}
                                className="w-full pl-7 pr-3 py-2 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[#3B82F6] transition"
                              />
                            </div>
                            <p className="text-[9px] text-[var(--text-muted)] mt-1">Orders below this amount are pickup only</p>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[var(--text)] mb-1.5 flex items-center gap-1">
                              <Truck size={10} style={{ color: "#3B82F6" }} /> Delivery Fee
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">&pound;</span>
                              <input
                                type="number"
                                min={0}
                                step={0.5}
                                value={deliveryFee}
                                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                                className="w-full pl-7 pr-3 py-2 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[#3B82F6] transition"
                              />
                            </div>
                            <p className="text-[9px] text-[var(--text-muted)] mt-1">Set to £0 for free delivery</p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] p-3 flex items-center gap-2" style={{ background: "rgba(59,130,246,0.06)" }}>
                          <MapPin size={14} style={{ color: "#3B82F6" }} />
                          <p className="text-[11px] text-[var(--text-soft)]">
                            Customers within <strong>{deliveryRadius} miles</strong> will see you as nearby. Min order <strong>&pound;{minOrderDelivery.toFixed(2)}</strong>{deliveryFee > 0 ? <> + <strong>&pound;{deliveryFee.toFixed(2)}</strong> delivery fee</> : <>, free delivery</>}.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Pickup Card */}
                  <div
                    className="rounded-2xl border p-5 transition-all"
                    style={{
                      background: pickupEnabled ? "rgba(16,185,129,0.05)" : "var(--header-bg)",
                      borderColor: pickupEnabled ? "rgba(16,185,129,0.3)" : "var(--border)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.12)" }}>
                          <ShoppingBag size={24} style={{ color: "#10B981" }} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[var(--text)]">Pickup Only</h4>
                          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Customers collect from your kitchen</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPickupEnabled(!pickupEnabled)}
                        className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                        style={{ background: pickupEnabled ? "#10B981" : "var(--border)" }}
                      >
                        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all" style={{ left: pickupEnabled ? "22px" : "2px" }} />
                      </button>
                    </div>

                    {pickupEnabled && (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-[var(--border)] p-3 flex items-center gap-2" style={{ background: "rgba(16,185,129,0.06)" }}>
                          <MapPin size={14} style={{ color: "#10B981" }} />
                          <p className="text-[11px] text-[var(--text-soft)]">
                            Your kitchen address will be shown so customers can collect orders in person
                          </p>
                        </div>
                        <div className="rounded-xl border border-[var(--border)] p-3 flex items-center gap-2" style={{ background: "rgba(16,185,129,0.06)" }}>
                          <Clock size={14} style={{ color: "#10B981" }} />
                          <p className="text-[11px] text-[var(--text-soft)]">
                            Set your pickup time slots in your menu to let customers choose a collection time
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Visibility Preview */}
                <div className="rounded-2xl border border-[var(--border)] p-5" style={{ background: "var(--header-bg)" }}>
                  <h4 className="text-xs font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                    <Eye size={14} style={{ color: "#8B5CF6" }} /> How Customers See You
                  </h4>
                  <div className="rounded-xl border border-[var(--border)] p-4" style={{ background: "var(--bg)" }}>
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                        <ChefHat size={24} color="white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-[var(--text)]">Amma&apos;s Kitchen</h5>
                          <span className="text-xs text-[var(--text-muted)]">0.8 miles away</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} size={10} style={{ color: "#F59E0B" }} fill="#F59E0B" />)}
                          <span className="text-[10px] text-[var(--text-muted)] ml-1">5.0 (0 reviews)</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">South Indian, Home-style, Tiffin Service</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {deliveryEnabled && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1" style={{ color: "#3B82F6", background: "rgba(59,130,246,0.1)" }}>
                              <Truck size={10} /> Delivery ({deliveryRadius}mi)
                            </span>
                          )}
                          {deliveryEnabled && minOrderDelivery > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: "#F59E0B", background: "rgba(245,158,11,0.1)" }}>
                              Min &pound;{minOrderDelivery.toFixed(2)}
                            </span>
                          )}
                          {deliveryEnabled && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: deliveryFee > 0 ? "#8B5CF6" : "#10B981", background: deliveryFee > 0 ? "rgba(139,92,246,0.1)" : "rgba(16,185,129,0.1)" }}>
                              {deliveryFee > 0 ? `£${deliveryFee.toFixed(2)} fee` : "Free delivery"}
                            </span>
                          )}
                          {pickupEnabled && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1" style={{ color: "#10B981", background: "rgba(16,185,129,0.1)" }}>
                              <ShoppingBag size={10} /> Pickup
                            </span>
                          )}
                          {!deliveryEnabled && !pickupEnabled && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: "#EF4444", background: "rgba(239,68,68,0.1)" }}>
                              No fulfilment method set
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
                    This is how your kitchen appears to customers searching within {deliveryRadius} miles of your location
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Menu Management Page */}
          {activePage === "menu" && (
            <>
              {/* Menu Header */}
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <UtensilsCrossed size={22} color="white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Menu Management</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />0 Active Items</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-red-400" />0 Draft</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "var(--input)" }}>
                      <RefreshCw size={16} className="text-[var(--text-muted)]" />
                    </button>
                    <button
                      onClick={() => setActivePage("add-dish")}
                      className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}
                    >
                      <PlusCircle size={14} />
                      <span>Add Dish</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Menu Table */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: "var(--input)" }}>
                        <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Dish Name</th>
                        <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Category</th>
                        <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Price</th>
                        <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Prep Time</th>
                        <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                        <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center text-[var(--text-muted)]">
                          <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-20" />
                          <p className="text-sm font-medium">No dishes added yet</p>
                          <p className="text-[11px] mt-1">Click &quot;Add Dish&quot; to create your first menu item</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Active Orders Page */}
          {activePage === "active-orders" && (
            <>
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <ClipboardList size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Active Orders</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />0 Active</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-amber-500" />0 Preparing</span>
                    </div>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "var(--input)" }}>
                  <RefreshCw size={18} className="text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Order Status Tabs */}
              <div className="flex gap-2 mb-6">
                {[
                  { label: "All Orders", count: 0, color: "#8B5CF6" },
                  { label: "New", count: 0, color: "#3B82F6" },
                  { label: "Preparing", count: 0, color: "#F59E0B" },
                  { label: "Ready", count: 0, color: "#10B981" },
                  { label: "Out for Delivery", count: 0, color: "#EC4899" },
                ].map((tab, i) => (
                  <button
                    key={i}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    style={{
                      background: i === 0 ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "var(--header-bg)",
                      color: i === 0 ? "#FFFFFF" : "var(--text-muted)",
                      border: i === 0 ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {tab.label}
                    <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{
                      background: i === 0 ? "rgba(255,255,255,0.2)" : `${tab.color}15`,
                      color: i === 0 ? "#FFFFFF" : tab.color,
                    }}>{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--input)" }}>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Order ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Customer</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Items</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Total</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Time</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-[var(--text-muted)]">
                        <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No active orders</p>
                        <p className="text-[11px] mt-1">New orders will appear here with real-time notifications</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Order History Page */}
          {activePage === "order-history" && (
            <>
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <Package size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Order History</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />0 Completed</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-red-400" />0 Cancelled</span>
                    </div>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "var(--input)" }}>
                  <RefreshCw size={18} className="text-[var(--text-muted)]" />
                </button>
              </div>

              {/* History Filters */}
              <div className="flex gap-2 mb-6">
                {[
                  { label: "All", color: "#8B5CF6" },
                  { label: "Completed", color: "#10B981" },
                  { label: "Cancelled", color: "#EF4444" },
                  { label: "Refunded", color: "#F59E0B" },
                ].map((tab, i) => (
                  <button
                    key={i}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: i === 0 ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "var(--header-bg)",
                      color: i === 0 ? "#FFFFFF" : "var(--text-muted)",
                      border: i === 0 ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Total Orders", value: "0", icon: Package, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Completed", value: "0", icon: Check, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Cancelled", value: "0", icon: AlertCircle, color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
                  { label: "Avg. Order Value", value: "£0.00", icon: PoundSterling, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
                ].map((s, i) => {
                  const SI = s.icon;
                  return (
                    <div key={i} className="p-4 rounded-2xl border border-[var(--border)]" style={{ background: "var(--header-bg)" }}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <SI size={18} style={{ color: s.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* History Table */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--input)" }}>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Order ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Customer</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Items</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Total</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-[var(--text-muted)]">
                        <Package size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No order history yet</p>
                        <p className="text-[11px] mt-1">Completed and cancelled orders will appear here</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Notifications Page */}
          {activePage === "notifications" && (
            <>
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <Bell size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Notifications</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />0 Unread</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-gray-400" />0 Read</span>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl text-xs font-medium transition hover:opacity-80" style={{ background: "var(--input)", color: "var(--text-muted)" }}>
                  Mark All Read
                </button>
              </div>

              {/* Notification Filters */}
              <div className="flex gap-2 mb-6">
                {[
                  { label: "All", icon: Bell },
                  { label: "Orders", icon: ClipboardList },
                  { label: "Reviews", icon: Star },
                  { label: "System", icon: Settings },
                ].map((tab, i) => {
                  const TI = tab.icon;
                  return (
                    <button
                      key={i}
                      className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                      style={{
                        background: i === 0 ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "var(--header-bg)",
                        color: i === 0 ? "#FFFFFF" : "var(--text-muted)",
                        border: i === 0 ? "none" : "1px solid var(--border)",
                      }}
                    >
                      <TI size={13} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Notification Preferences */}
              <div className="rounded-2xl border px-5 py-4 mb-6" style={{ background: "rgba(59,130,246,0.06)", borderColor: "rgba(59,130,246,0.2)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
                    <Bell size={16} style={{ color: "#3B82F6" }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text)]">Notification Preferences</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {currentPlan === "Unlimited" ? "Real-time push notifications enabled" : currentPlan === "Growth" ? "Priority notifications enabled" : "Email notifications enabled"} &middot; {currentPlan} Plan
                    </p>
                  </div>
                </div>
              </div>

              {/* Empty Notification List */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] p-8 text-center">
                <Bell size={40} className="mx-auto mb-3 text-[var(--text-muted)] opacity-20" />
                <p className="text-sm font-medium text-[var(--text)]">No notifications yet</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">You&apos;ll be notified about new orders, reviews and system updates</p>
              </div>
            </>
          )}

          {/* Tiffin Subscriptions Page */}
          {activePage === "subscriptions" && (
            <>
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <Calendar size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Tiffin Subscriptions</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />0 Active</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-amber-500" />0 Paused</span>
                    </div>
                  </div>
                </div>
                <button
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}
                >
                  <PlusCircle size={16} />
                  <span>Create Plan</span>
                </button>
              </div>

              {/* Subscription Plans Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { name: "Weekly Tiffin", price: "£35", period: "/week", meals: "5 meals/week", color: "#10B981", bg: "rgba(16,185,129,0.08)", subscribers: 0 },
                  { name: "Monthly Tiffin", price: "£120", period: "/month", meals: "20 meals/month", color: "#3B82F6", bg: "rgba(59,130,246,0.08)", subscribers: 0 },
                  { name: "Premium Daily", price: "£50", period: "/week", meals: "7 meals/week + snacks", color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", subscribers: 0 },
                ].map((plan, i) => (
                  <div key={i} className="rounded-2xl border border-[var(--border)] p-5" style={{ background: "var(--header-bg)" }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: plan.bg }}>
                        <Repeat size={20} style={{ color: plan.color }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text)]">{plan.name}</h4>
                        <p className="text-[10px] text-[var(--text-muted)]">{plan.meals}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="text-2xl font-bold" style={{ color: plan.color }}>{plan.price}</span>
                      <span className="text-xs text-[var(--text-muted)]">{plan.period}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                      <span className="text-[11px] text-[var(--text-muted)]">{plan.subscribers} subscribers</span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ color: plan.color, background: plan.bg }}>Active</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subscribers Table */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--text)]">Active Subscribers</h3>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--input)" }}>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Customer</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Plan</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Start Date</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Next Delivery</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-[var(--text-muted)]">
                        <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No subscribers yet</p>
                        <p className="text-[11px] mt-1">Customers who subscribe to your tiffin plans will appear here</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Earnings Page */}
          {activePage === "earnings" && (
            <>
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <PoundSterling size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Earnings</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />£0 Today</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-amber-500" />£0 Pending</span>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl text-xs font-medium transition hover:opacity-80" style={{ background: "var(--input)", color: "var(--text)" }}>
                  Download Report
                </button>
              </div>

              {/* Earnings Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Today's Earnings", value: "£0.00", sub: "0 orders", icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "This Week", value: "£0.00", sub: "0 orders", icon: Wallet, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
                  { label: "This Month", value: "£0.00", sub: "0 orders", icon: PoundSterling, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Total Earnings", value: "£0.00", sub: "All time", icon: Crown, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
                ].map((s, i) => {
                  const SI = s.icon;
                  return (
                    <div key={i} className="p-4 rounded-2xl border border-[var(--border)] transition-all hover:scale-[1.02]" style={{ background: "var(--header-bg)" }}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <SI size={18} style={{ color: s.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-1">{s.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Revenue Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Meals & Tiffin", value: "£0.00", icon: UtensilsCrossed, color: "#FF5A1F", pct: "0%" },
                  { label: "Homemade Products", value: "£0.00", icon: Store, color: "#8B5CF6", pct: "0%" },
                  { label: "Subscriptions", value: "£0.00", icon: Repeat, color: "#10B981", pct: "0%" },
                ].map((item, i) => {
                  const II = item.icon;
                  return (
                    <div key={i} className="rounded-2xl border border-[var(--border)] p-4" style={{ background: "var(--header-bg)" }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15` }}>
                          <II size={18} style={{ color: item.color }} />
                        </div>
                        <span className="text-xs font-semibold text-[var(--text)]">{item.label}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-lg font-bold" style={{ color: item.color }}>{item.value}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{item.pct}</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-[var(--input)]">
                        <div className="h-full rounded-full" style={{ background: item.color, width: "0%" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Transactions Table */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--text)]">Recent Transactions</h3>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--input)" }}>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Transaction ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Customer</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Type</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Amount</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-[var(--text-muted)]">
                        <PoundSterling size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No transactions yet</p>
                        <p className="text-[11px] mt-1">Your earnings and payouts will be listed here</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Reviews Page */}
          {activePage === "reviews" && (
            <>
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <Star size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Reviews</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />0 New</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-gray-400" />0 Total</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Overview */}
              <div className="rounded-2xl border border-[var(--border)] p-5 mb-6" style={{ background: "var(--header-bg)" }}>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: "#F59E0B" }}>0.0</div>
                    <div className="flex items-center gap-0.5 mt-1 justify-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className="text-[var(--border)]" fill="var(--border)" />
                      ))}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">0 reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-[11px] font-medium text-[var(--text-muted)] w-4">{rating}</span>
                        <Star size={12} style={{ color: "#F59E0B" }} />
                        <div className="flex-1 h-2 rounded-full bg-[var(--input)]">
                          <div className="h-full rounded-full" style={{ background: "#F59E0B", width: "0%" }} />
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] w-6">0</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Filters */}
              <div className="flex gap-2 mb-6">
                {[
                  { label: "All Reviews", active: true },
                  { label: "Needs Reply", active: false },
                  { label: "5 Stars", active: false },
                  { label: "1-3 Stars", active: false },
                ].map((tab, i) => (
                  <button
                    key={i}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: tab.active ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "var(--header-bg)",
                      color: tab.active ? "#FFFFFF" : "var(--text-muted)",
                      border: tab.active ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Empty Reviews */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] p-8 text-center">
                <Star size={40} className="mx-auto mb-3 text-[var(--text-muted)] opacity-20" />
                <p className="text-sm font-medium text-[var(--text)]">No reviews yet</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Customer reviews and ratings will appear here once you start receiving orders</p>
              </div>
            </>
          )}

          {/* Analytics Page */}
          {activePage === "analytics" && (
            <>
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <BarChart3 size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Analytics</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />0 Profile Views</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full" style={{ background: "#8B5CF6" }} />{currentPlan} Plan</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {["7D", "30D", "90D"].map((p, i) => (
                    <button
                      key={p}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition"
                      style={{
                        background: i === 0 ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "var(--input)",
                        color: i === 0 ? "#FFFFFF" : "var(--text-muted)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analytics Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Profile Views", value: "0", icon: Users, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Menu Views", value: "0", icon: UtensilsCrossed, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
                  { label: "Conversion Rate", value: "0%", icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Avg. Rating", value: "0.0", icon: Star, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
                ].map((s, i) => {
                  const SI = s.icon;
                  return (
                    <div key={i} className="p-4 rounded-2xl border border-[var(--border)] transition-all hover:scale-[1.02]" style={{ background: "var(--header-bg)" }}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <SI size={18} style={{ color: s.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Chart Placeholders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div className="rounded-2xl border border-[var(--border)] p-5" style={{ background: "var(--header-bg)" }}>
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Orders Overview</h3>
                  <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-lg" style={{ background: "var(--border)", height: "8px" }} />
                        <span className="text-[9px] text-[var(--text-muted)]">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--border)] p-5" style={{ background: "var(--header-bg)" }}>
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Revenue Trend</h3>
                  <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-lg" style={{ background: "var(--border)", height: "8px" }} />
                        <span className="text-[9px] text-[var(--text-muted)]">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Popular Items */}
              <div className="rounded-2xl border border-[var(--border)] p-5" style={{ background: "var(--header-bg)" }}>
                <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Top Performing Items</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--input)" }}>
                      <th className="text-left px-4 py-2.5 font-semibold text-[var(--text)] rounded-l-lg">#</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-[var(--text)]">Item Name</th>
                      <th className="text-center px-4 py-2.5 font-semibold text-[var(--text)]">Orders</th>
                      <th className="text-center px-4 py-2.5 font-semibold text-[var(--text)]">Revenue</th>
                      <th className="text-center px-4 py-2.5 font-semibold text-[var(--text)] rounded-r-lg">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-[var(--text-muted)]">
                        <BarChart3 size={36} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-medium">No data yet</p>
                        <p className="text-[11px] mt-1">Analytics data will populate once you start receiving orders</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Non-dashboard/non-settings/non-menu/non-products/non-services pages */}
          {!customPages.includes(activePage) && (() => {
            const found = SIDEBAR_ITEMS.flatMap(g => g.items).find(i => i.id === activePage);
            const PageIcon = found?.icon || ClipboardList;
            const meta = PAGE_META[activePage] || { green: "0 Active", red: "0 Pending" };
            return (
              <>
                {/* Module Header Bar */}
                <div
                  className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}
                    >
                      <PageIcon size={24} color="white" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-[var(--text)]">{PAGE_TITLES[activePage]}</h2>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {meta.green}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          {meta.red}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80"
                      style={{ background: "var(--input)" }}
                    >
                      <RefreshCw size={18} className="text-[var(--text-muted)]" />
                    </button>
                    {meta.cta && (
                      <button
                        onClick={() => {
                          if (meta.cta === "Add Product") setActivePage("add-product");
                        }}
                        className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition hover:opacity-90 shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}
                      >
                        <PlusCircle size={16} />
                        <span>{meta.cta}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Panel */}
                <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] p-6">
                  <h2 className="text-sm font-semibold text-[var(--text)] mb-4">{PAGE_TITLES[activePage]}</h2>
                  <div className="text-center py-12 text-[var(--text-muted)]">
                    <PageIcon size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Coming soon</p>
                    <p className="text-xs mt-1">This section is under development</p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
