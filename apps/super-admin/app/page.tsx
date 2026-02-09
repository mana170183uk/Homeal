"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, ChefHat, Users, ClipboardList, Tag,
  FolderOpen, Settings, BarChart3, PoundSterling, FileText,
  Bell, Sun, Moon, Package, RefreshCw, PlusCircle, TrendingUp,
  TrendingDown, ShoppingBag, AlertCircle, Wallet, Globe, Shield,
  Check, Crown, Zap, Edit3, Store, Truck, Repeat, UtensilsCrossed,
  Grip, Award, Sparkles, MapPin, Heart, Leaf, ShieldCheck, Box, Cake,
  Navigation, Eye, Star, Search, Download, Filter, Clock, Calendar,
  Menu, X,
} from "lucide-react";

type IconComponent = typeof LayoutDashboard;
interface SidebarItem { icon: IconComponent; label: string; id: string }
interface SidebarGroup { section: string; items: SidebarItem[] }

const SIDEBAR_ITEMS: SidebarGroup[] = [
  { section: "OVERVIEW", items: [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  ]},
  { section: "MANAGEMENT", items: [
    { icon: ChefHat, label: "Chefs", id: "chefs" },
    { icon: Users, label: "Customers", id: "customers" },
    { icon: ClipboardList, label: "Orders", id: "orders" },
  ]},
  { section: "PLATFORM", items: [
    { icon: Grip, label: "Service Types", id: "service-types" },
    { icon: Store, label: "Product Categories", id: "product-categories" },
    { icon: Tag, label: "Promo Codes", id: "promos" },
    { icon: FolderOpen, label: "Food Categories", id: "categories" },
    { icon: Settings, label: "Settings", id: "settings" },
  ]},
  { section: "REPORTS", items: [
    { icon: BarChart3, label: "Analytics", id: "analytics" },
    { icon: PoundSterling, label: "Revenue", id: "revenue" },
    { icon: FileText, label: "Reports", id: "reports" },
  ]},
];

const STATS_ROW1 = [
  { label: "Today's Revenue", value: "£0.00", sub: "Today's earnings", icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  { label: "Today's Expenses", value: "£0.00", sub: "Today's costs", icon: TrendingDown, color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  { label: "Today's Orders", value: "0", sub: "Orders today", icon: ShoppingBag, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  { label: "Total Users", value: "1", sub: "Registered users", icon: Users, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
];

const STATS_ROW2 = [
  { label: "Weekly Revenue", value: "£0.00", sub: "This week's revenue", icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  { label: "Weekly Expenses", value: "£0.00", sub: "This week's costs", icon: TrendingDown, color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  { label: "Monthly Profit", value: "£0.00", sub: "This month's profit/loss", icon: Wallet, color: "#14B8A6", bg: "rgba(20,184,166,0.12)" },
  { label: "Pending Tasks", value: "0", sub: "Awaiting action", icon: AlertCircle, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
];

const PAGE_TITLES: Record<string, string> = {
  "dashboard": "Super Admin Dashboard",
  "chefs": "Chef Management",
  "customers": "Customer Management",
  "orders": "All Orders",
  "service-types": "Service Types",
  "product-categories": "Product Categories",
  "promos": "Promo Codes",
  "categories": "Food Categories",
  "settings": "Platform Settings",
  "analytics": "Analytics",
  "revenue": "Revenue",
  "reports": "Reports",
};

const PAGE_META: Record<string, { green: string; red: string; cta?: string }> = {
  "chefs": { green: "0 Approved", red: "0 Pending", cta: "Add Chef" },
  "customers": { green: "0 Active", red: "0 Inactive" },
  "orders": { green: "0 Completed", red: "0 Cancelled" },
  "service-types": { green: "4 Types", red: "0 Disabled" },
  "product-categories": { green: "9 Active", red: "0 Hidden", cta: "Add Category" },
  "promos": { green: "0 Active", red: "0 Expired", cta: "Add Promo" },
  "categories": { green: "0 Listed", red: "0 Hidden", cta: "Add Category" },
  "settings": { green: "System", red: "0 Pending" },
  "analytics": { green: "0 Views", red: "0 Events" },
  "revenue": { green: "£0 Earned", red: "£0 Pending" },
  "reports": { green: "0 Generated", red: "0 Pending", cta: "Generate Report" },
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
    chefs: 0,
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
    chefs: 0,
    features: [
      "Up to 150 orders/month",
      "Featured menu listing",
      "4 homemade products",
      "Tiffin subscriptions",
      "Advanced analytics",
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
    chefs: 0,
    active: true,
    features: [
      "Unlimited orders",
      "Premium menu placement",
      "Unlimited products",
      "All service types",
      "Full analytics suite",
      "Dedicated account manager",
      "24/7 priority support",
    ],
  },
];

const PLATFORM_SERVICES = [
  {
    id: "daily-meals",
    name: "Daily Meals & Tiffin",
    description: "Home-style cooked meals, lunch boxes and tiffin service",
    icon: UtensilsCrossed,
    color: "#FF5A1F",
    bg: "rgba(255,90,31,0.08)",
    chefs: 0,
    orders: 0,
    planAccess: "All plans",
  },
  {
    id: "homemade-products",
    name: "Homemade Products Store",
    description: "Pickles, papads, chutneys, masalas, sweets and preserved items",
    icon: Store,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    chefs: 0,
    orders: 0,
    planAccess: "All plans (limited on Starter)",
  },
  {
    id: "catering",
    name: "Catering & Bulk Orders",
    description: "Party orders, event catering and office meal prep",
    icon: Truck,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    chefs: 0,
    orders: 0,
    planAccess: "Unlimited plan only",
  },
  {
    id: "meal-subscriptions",
    name: "Meal Subscriptions",
    description: "Weekly and monthly recurring meal plans with customisation",
    icon: Repeat,
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    chefs: 0,
    orders: 0,
    planAccess: "Growth & Unlimited plans",
  },
];

const PRODUCT_CATEGORIES_ADMIN = [
  { name: "Pickles", icon: "🫙", products: 0, chefs: 0, color: "#EF4444" },
  { name: "Papads", icon: "🫓", products: 0, chefs: 0, color: "#F59E0B" },
  { name: "Chutneys", icon: "🥫", products: 0, chefs: 0, color: "#10B981" },
  { name: "Masalas", icon: "🌶️", products: 0, chefs: 0, color: "#EF4444" },
  { name: "Sweets", icon: "🍬", products: 0, chefs: 0, color: "#EC4899" },
  { name: "Snacks", icon: "🥜", products: 0, chefs: 0, color: "#F97316" },
  { name: "Bakery", icon: "🍞", products: 0, chefs: 0, color: "#8B5CF6" },
  { name: "Cakes", icon: "🎂", products: 0, chefs: 0, color: "#EC4899" },
  { name: "Beverages", icon: "🥤", products: 0, chefs: 0, color: "#06B6D4" },
];

const BADGE_SYSTEM = [
  { name: "Verified Kitchen", icon: ShieldCheck, color: "#10B981", description: "Kitchen passes video verification and hygiene standards" },
  { name: "Hygiene Certified", icon: Sparkles, color: "#3B82F6", description: "Holds valid food safety certification (Level 2+)" },
  { name: "Top Rated", icon: Award, color: "#F59E0B", description: "Maintains 4.5+ average rating with 50+ reviews" },
  { name: "Community Favourite", icon: Heart, color: "#EC4899", description: "Receives 100+ repeat orders from unique customers" },
  { name: "Eco Friendly", icon: Leaf, color: "#10B981", description: "Uses sustainable packaging and eco-friendly practices" },
  { name: "Local Hero", icon: MapPin, color: "#8B5CF6", description: "Top chef in their locality with 200+ orders/month" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

interface ChefData {
  id: string;
  kitchenName: string;
  isVerified: boolean;
  isOnline: boolean;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  trialEndsAt: string | null;
  plan: string;
  avgRating: number;
  totalReviews: number;
  deliveryRadius: number;
  user: { id: string; name: string; email: string | null; phone: string | null; createdAt: string };
  _count: { orders: number; menus: number; reviews: number };
}

interface ChefStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export default function SuperAdminPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingPlans, setEditingPlans] = useState(false);
  const [serviceEnabled, setServiceEnabled] = useState<Record<string, boolean>>({
    "daily-meals": true,
    "homemade-products": true,
    "catering": true,
    "meal-subscriptions": true,
  });

  // Chef management state
  const [chefs, setChefs] = useState<ChefData[]>([]);
  const [chefStats, setChefStats] = useState<ChefStats>({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [chefFilter, setChefFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [chefLoading, setChefLoading] = useState(false);
  const [chefActionLoading, setChefActionLoading] = useState<string | null>(null);
  const [rejectModalChef, setRejectModalChef] = useState<ChefData | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("");

  // Check auth on load - redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem("homeal_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    // Verify the token is valid and user is SUPER_ADMIN
    async function verifyAuth() {
      try {
        const res = await fetch(`${API_URL}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data && (data.data.role === "SUPER_ADMIN" || data.data.role === "ADMIN")) {
          setAuthToken(token);
          setAdminName(data.data.name || "Admin");
        } else {
          localStorage.removeItem("homeal_token");
          localStorage.removeItem("homeal_refresh_token");
          window.location.href = "/login";
        }
      } catch {
        // Token might still work for API calls, try using it
        setAuthToken(token);
      }
    }
    verifyAuth();
  }, []);

  // Fetch chefs when on chefs page OR dashboard (for stats)
  useEffect(() => {
    if (!authToken) return;
    if (activePage === "chefs" || activePage === "dashboard") {
      fetchChefs();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, authToken, chefFilter]);

  async function fetchChefs() {
    setChefLoading(true);
    try {
      const statusParam = chefFilter === "all" ? "" : `?status=${chefFilter}`;
      const res = await fetch(`${API_URL}/api/v1/admin/chefs${statusParam}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setChefs(data.data.chefs);
        setChefStats(data.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch chefs:", err);
    } finally {
      setChefLoading(false);
    }
  }

  async function handleApproveChef(chefId: string) {
    setChefActionLoading(chefId);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/chefs/${chefId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) fetchChefs();
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setChefActionLoading(null);
    }
  }

  async function handleRejectChef(chefId: string, reason: string) {
    setChefActionLoading(chefId);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/chefs/${chefId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setRejectModalChef(null);
        setRejectReason("");
        fetchChefs();
      }
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setChefActionLoading(null);
    }
  }

  async function handleExtendTrial(chefId: string) {
    setChefActionLoading(chefId);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/chefs/${chefId}/extend-trial`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ months: 3 }),
      });
      const data = await res.json();
      if (data.success) fetchChefs();
    } catch (err) {
      console.error("Extend trial failed:", err);
    } finally {
      setChefActionLoading(null);
    }
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const customPages = ["dashboard", "settings", "service-types", "product-categories", "chefs", "customers", "orders", "promos", "categories", "analytics", "revenue", "reports"];

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
            <button onClick={() => setActivePage("settings")} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--input)] transition">
              <Bell size={18} className="text-[var(--text-muted)]" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--input)] transition">
              <Settings size={18} className="text-[var(--text-muted)]" />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ml-0.5" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>SA</div>
          </div>
        </header>

        <div className="p-3 sm:p-6">
          {/* Dashboard */}
          {activePage === "dashboard" && (
            <>
              {/* Platform Info Banner */}
              <div
                className="rounded-2xl border border-[var(--border)] px-4 sm:px-6 py-4 sm:py-5 mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                style={{ background: "var(--header-bg)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}
                  >
                    <Globe size={28} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">Homeal Platform</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1.5"><Shield size={12} /> Super Admin Control</span>
                      <span className="flex items-center gap-1.5"><Users size={12} /> {chefStats.total} Chef{chefStats.total !== 1 ? "s" : ""} Registered</span>
                      <span className="flex items-center gap-1.5 hidden sm:flex"><MapPin size={12} /> UK Region</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border" style={{ color: "#10B981", borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.1)" }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />Active
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border" style={{ color: "#8B5CF6", borderColor: "rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.1)" }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500 mr-1.5" />Enterprise Plan
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border" style={{ color: "#10B981", borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.1)" }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />Online
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-[var(--text-muted)]">Welcome, {adminName || "Admin"}</p>
                  <span
                    className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-[11px] font-semibold border"
                    style={{ color: "var(--primary)", borderColor: "rgba(255,90,31,0.3)", background: "rgba(255,90,31,0.08)" }}
                  >
                    <Shield size={12} /> Super Admin
                  </span>
                </div>
              </div>

              {/* Platform Services Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {PLATFORM_SERVICES.map((svc) => {
                  const SvcIcon = svc.icon;
                  const isOn = serviceEnabled[svc.id];
                  return (
                    <div
                      key={svc.id}
                      className="rounded-2xl border px-4 py-3 transition-all cursor-pointer"
                      style={{
                        background: isOn ? svc.bg : "var(--header-bg)",
                        borderColor: isOn ? `${svc.color}30` : "var(--border)",
                      }}
                      onClick={() => setActivePage("service-types")}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${svc.color}20` }}>
                          <SvcIcon size={18} style={{ color: svc.color }} />
                        </div>
                        <p className="text-[11px] font-semibold" style={{ color: svc.color }}>
                          {svc.id === "daily-meals" ? "Daily Meals" : svc.id === "homemade-products" ? "Products" : svc.id === "catering" ? "Catering" : "Subscriptions"}
                        </p>
                      </div>
                      <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                        <span>{svc.chefs} chefs</span>
                        <span>{svc.orders} orders</span>
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
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Welcome back, {adminName || "Admin"}</p>
                  </div>
                </div>
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80"
                  style={{ background: "var(--input)" }}
                >
                  <RefreshCw size={18} className="text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Stats Row 1 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                {[
                  { ...STATS_ROW1[0] },
                  { ...STATS_ROW1[1] },
                  { ...STATS_ROW1[2] },
                  { ...STATS_ROW1[3], value: String(chefStats.total), sub: `${chefStats.approved} approved, ${chefStats.pending} pending` },
                ].map((s, i) => {
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

              {/* Stats Row 2 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
                {[
                  { ...STATS_ROW2[0] },
                  { ...STATS_ROW2[1] },
                  { ...STATS_ROW2[2] },
                  { ...STATS_ROW2[3], value: String(chefStats.pending), sub: `${chefStats.pending} chef${chefStats.pending !== 1 ? "s" : ""} awaiting approval` },
                ].map((s, i) => {
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

              {/* Recent Activity Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-[var(--text)]">Recent Chefs</h2>
                    <div className="flex gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>{chefStats.approved} approved</span>
                      <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>{chefStats.pending} pending</span>
                    </div>
                  </div>
                  {chefs.length > 0 ? (
                    <div className="space-y-3">
                      {chefs.slice(0, 5).map((chef) => (
                        <div key={chef.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                              <ChefHat size={14} color="white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[var(--text)] truncate">{chef.kitchenName}</p>
                              <p className="text-[10px] text-[var(--text-muted)] truncate">{chef.user?.name || "Unknown"}</p>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{
                            background: chef.isVerified ? "rgba(16,185,129,0.1)" : chef.rejectedAt ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                            color: chef.isVerified ? "#10B981" : chef.rejectedAt ? "#EF4444" : "#F59E0B",
                          }}>
                            {chef.isVerified ? "Approved" : chef.rejectedAt ? "Rejected" : "Pending"}
                          </span>
                        </div>
                      ))}
                      {chefs.length > 5 && (
                        <button onClick={() => setActivePage("chefs")} className="text-xs font-medium w-full text-center py-2 rounded-lg hover:opacity-80 transition" style={{ color: "var(--primary)" }}>
                          View all {chefStats.total} chefs
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[var(--text-muted)]">
                      <ChefHat size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No chefs registered yet</p>
                      <p className="text-xs mt-1">Approved and pending chefs will appear here</p>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] p-6">
                  <h2 className="text-sm font-semibold text-[var(--text)] mb-4">Recent Orders</h2>
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No orders yet</p>
                    <p className="text-xs mt-1">Platform-wide orders will be shown here</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Service Types Management */}
          {activePage === "service-types" && (
            <>
              {/* Header */}
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <Grip size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Platform Service Types</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Manage which services chefs can offer on the platform</p>
                  </div>
                </div>
              </div>

              {/* Info Banner */}
              <div
                className="rounded-2xl border px-5 py-4 mb-6 flex items-center gap-3"
                style={{ background: "rgba(139,92,246,0.06)", borderColor: "rgba(139,92,246,0.2)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.15)" }}>
                  <Sparkles size={20} style={{ color: "#8B5CF6" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">Homeal is more than food delivery</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Enable service types to let chefs sell daily meals, homemade products (pickles, papads, sweets), accept catering orders, and offer meal subscriptions.</p>
                </div>
              </div>

              {/* Service Type Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                {PLATFORM_SERVICES.map((svc) => {
                  const SvcIcon = svc.icon;
                  const isOn = serviceEnabled[svc.id];
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
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 max-w-[240px]">{svc.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setServiceEnabled(prev => ({ ...prev, [svc.id]: !prev[svc.id] }))}
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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        <div className="text-center p-2 rounded-lg" style={{ background: svc.bg }}>
                          <p className="text-lg font-bold" style={{ color: svc.color }}>{svc.chefs}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">Active Chefs</p>
                        </div>
                        <div className="text-center p-2 rounded-lg" style={{ background: svc.bg }}>
                          <p className="text-lg font-bold" style={{ color: svc.color }}>{svc.orders}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">Total Orders</p>
                        </div>
                        <div className="text-center p-2 rounded-lg" style={{ background: svc.bg }}>
                          <p className="text-lg font-bold" style={{ color: svc.color }}>£0</p>
                          <p className="text-[10px] text-[var(--text-muted)]">Revenue</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                        <span className="text-[11px] font-medium" style={{ color: isOn ? svc.color : "var(--text-muted)" }}>
                          {isOn ? "Enabled on Platform" : "Disabled"}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">{svc.planAccess}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Badge System Management */}
              <h3 className="text-sm font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                <Award size={16} style={{ color: "#F59E0B" }} /> Chef Badge System
              </h3>
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: "var(--input)" }}>
                        <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Badge</th>
                        <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Criteria</th>
                        <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Chefs Earned</th>
                        <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BADGE_SYSTEM.map((badge, i) => {
                        const BadgeIcon = badge.icon;
                        return (
                          <tr key={i} className="border-t border-[var(--border)]">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${badge.color}15` }}>
                                  <BadgeIcon size={16} style={{ color: badge.color }} />
                                </div>
                                <span className="font-medium text-[var(--text)]">{badge.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[var(--text-muted)] max-w-[250px]">{badge.description}</td>
                            <td className="px-4 py-3 text-center font-semibold" style={{ color: badge.color }}>0</td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: "#10B981", background: "rgba(16,185,129,0.1)" }}>
                                Active
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Product Categories Management */}
          {activePage === "product-categories" && (
            <>
              {/* Header */}
              <div
                className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <Store size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Homemade Product Categories</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />9 Active</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-red-400" />0 Hidden</span>
                    </div>
                  </div>
                </div>
                <button
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}
                >
                  <PlusCircle size={16} />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {PRODUCT_CATEGORIES_ADMIN.map((cat, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[var(--border)] p-5 transition-all hover:scale-[1.02]"
                    style={{ background: "var(--header-bg)" }}
                  >
                    <div className="text-4xl mb-3 text-center">{cat.icon}</div>
                    <h4 className="text-sm font-bold text-[var(--text)] text-center">{cat.name}</h4>
                    <div className="flex justify-between mt-3 text-[11px] text-[var(--text-muted)]">
                      <span>{cat.products} products</span>
                      <span>{cat.chefs} chefs</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: "#10B981", background: "rgba(16,185,129,0.1)" }}>
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info */}
              <div
                className="rounded-2xl border px-5 py-4 flex items-center gap-3"
                style={{ background: "rgba(59,130,246,0.06)", borderColor: "rgba(59,130,246,0.2)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                  <Box size={20} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">Homemade products are a key differentiator</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Chefs can list pickles, papads, chutneys, masalas, sweets, cakes (with egg/eggless options) and more. Each product includes shelf life, weight, ingredients and allergen info.</p>
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
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Platform Settings & Plans</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Manage subscription plans and platform configuration</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingPlans(!editingPlans)}
                  className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition hover:opacity-90"
                  style={
                    editingPlans
                      ? { background: "var(--input)", color: "var(--text)", border: "1px solid var(--border)" }
                      : { background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))", color: "#FFFFFF" }
                  }
                >
                  <Edit3 size={14} />
                  <span>{editingPlans ? "Done Editing" : "Edit Plans"}</span>
                </button>
              </div>

              {/* Free Trial Notice */}
              <div
                className="rounded-2xl border px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.2)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}>
                    <Crown size={20} style={{ color: "#F59E0B" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">Free Trial Active &mdash; All chefs on <span style={{ color: "#8B5CF6" }}>Unlimited Plan</span></p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Platform is free for 3 months. All chefs get unlimited orders until trial ends.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ color: "#F59E0B", background: "rgba(245,158,11,0.12)" }}>
                    3 months left
                  </div>
                  <div className="px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ color: "#10B981", background: "rgba(16,185,129,0.12)" }}>
                    Active
                  </div>
                </div>
              </div>

              {/* Plan Stats Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {PLANS.map((plan, i) => {
                  const PlanIcon = plan.icon;
                  const isActive = "active" in plan && plan.active;
                  return (
                    <div key={i} className="p-4 rounded-2xl border transition-all hover:scale-[1.02]" style={{ background: "var(--header-bg)", borderColor: isActive ? plan.color : plan.borderColor }}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-[var(--text-muted)]">{plan.name} Plan</p>
                            {isActive && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white" style={{ background: plan.color }}>DEFAULT</span>
                            )}
                          </div>
                          <p className="text-lg font-bold mt-1" style={{ color: plan.color }}>{plan.price}{plan.period}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: plan.bg }}>
                          <PlanIcon size={20} style={{ color: plan.color }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-muted)]">{plan.orders} orders/mo</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: plan.color, background: plan.bg }}>
                          {plan.chefs} chefs
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subscription Plans Detail */}
              <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Chef Subscription Plans</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-6">
                {PLANS.map((plan, i) => {
                  const PlanIcon = plan.icon;
                  return (
                    <div
                      key={i}
                      className="relative rounded-2xl border p-5 transition-all hover:scale-[1.02]"
                      style={{ background: "var(--header-bg)", borderColor: "var(--border)" }}
                    >
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
                      <div className="py-2 px-3 rounded-xl text-center text-xs font-medium" style={{ background: plan.bg, color: plan.color }}>
                        {"active" in plan && plan.active ? "Default Plan (Free Trial)" : `${plan.chefs} active subscribers`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Plan Comparison Table */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] p-6">
                <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Plan Comparison</h3>
                <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: "var(--input)" }}>
                        <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Feature</th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: "#10B981" }}>Starter (Free)</th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: "#3B82F6" }}>Growth (£30)</th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: "#8B5CF6" }}>Unlimited (£45)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { feature: "Monthly Orders", starter: "30", growth: "150", unlimited: "Unlimited" },
                        { feature: "Menu Listing", starter: "Basic", growth: "Featured", unlimited: "Premium" },
                        { feature: "Homemade Products", starter: "1 item", growth: "4 items", unlimited: "All" },
                        { feature: "Tiffin Subscriptions", starter: "\u2014", growth: "Yes", unlimited: "Yes" },
                        { feature: "Catering Orders", starter: "\u2014", growth: "\u2014", unlimited: "Yes" },
                        { feature: "Analytics", starter: "Basic", growth: "Advanced", unlimited: "Full Suite" },
                        { feature: "Notifications", starter: "Email", growth: "Priority", unlimited: "Real-time Push" },
                        { feature: "Promotional Tools", starter: "\u2014", growth: "Yes", unlimited: "Yes" },
                        { feature: "Account Manager", starter: "\u2014", growth: "\u2014", unlimited: "Dedicated" },
                        { feature: "Support", starter: "Email", growth: "Priority Email", unlimited: "24/7 Priority" },
                        { feature: "Platform Commission", starter: "15%", growth: "10%", unlimited: "5%" },
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
            </>
          )}

          {/* Chef Management Page */}
          {activePage === "chefs" && (
            <>
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <ChefHat size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Chef Management</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />{chefStats.approved} Approved</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-amber-500" />{chefStats.pending} Pending</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-red-500" />{chefStats.rejected} Rejected</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => fetchChefs()} className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "var(--input)" }}>
                  <RefreshCw size={18} className={`text-[var(--text-muted)] ${chefLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Chef Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Total Chefs", value: String(chefStats.total), icon: ChefHat, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Approved", value: String(chefStats.approved), icon: Check, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Pending Approval", value: String(chefStats.pending), icon: AlertCircle, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
                  { label: "Rejected", value: String(chefStats.rejected), icon: Shield, color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
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

              {/* Filter Tabs */}
              <div className="flex gap-2 mb-4">
                {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setChefFilter(f)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: chefFilter === f ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "var(--input)",
                      color: chefFilter === f ? "#fff" : "var(--text-muted)",
                    }}
                  >
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === "pending" && chefStats.pending > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white">{chefStats.pending}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Chefs Table */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--input)" }}>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Chef / Kitchen</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Email</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Plan</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Trial Ends</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Orders</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Rating</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chefLoading ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-16 text-center text-[var(--text-muted)]">
                          <RefreshCw size={32} className="mx-auto mb-3 opacity-30 animate-spin" />
                          <p className="text-sm font-medium">Loading chefs...</p>
                        </td>
                      </tr>
                    ) : chefs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-16 text-center text-[var(--text-muted)]">
                          <ChefHat size={40} className="mx-auto mb-3 opacity-20" />
                          <p className="text-sm font-medium">{chefFilter === "all" ? "No chefs registered yet" : `No ${chefFilter} chefs`}</p>
                          <p className="text-[11px] mt-1">Chefs who register will appear here for approval</p>
                        </td>
                      </tr>
                    ) : chefs.map((c) => {
                      const isPending = !c.isVerified && !c.rejectedAt;
                      const isApproved = c.isVerified;
                      const isRejected = !!c.rejectedAt;
                      const trialEnd = c.trialEndsAt ? new Date(c.trialEndsAt) : null;
                      const trialExpired = trialEnd ? trialEnd < new Date() : false;

                      return (
                        <tr key={c.id} className="border-t border-[var(--border)] hover:bg-[var(--input)] transition">
                          <td className="px-5 py-3">
                            <div className="font-semibold text-[var(--text)]">{c.kitchenName}</div>
                            <div className="text-[11px] text-[var(--text-muted)]">{c.user.name}</div>
                          </td>
                          <td className="px-4 py-3 text-[var(--text-muted)]">{c.user.email || "—"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{
                              background: c.plan === "UNLIMITED" ? "rgba(139,92,246,0.12)" : "rgba(16,185,129,0.12)",
                              color: c.plan === "UNLIMITED" ? "#8B5CF6" : "#10B981",
                            }}>
                              {c.plan || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-[var(--text-muted)]">
                            {trialEnd ? (
                              <span className={trialExpired ? "text-red-500 font-semibold" : ""}>
                                {trialEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                {trialExpired && <span className="block text-[10px]">Expired</span>}
                              </span>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-[var(--text)]">{c._count.orders}</td>
                          <td className="px-4 py-3 text-center">
                            {c.avgRating > 0 ? (
                              <span className="flex items-center justify-center gap-1">
                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                <span className="font-semibold text-[var(--text)]">{c.avgRating.toFixed(1)}</span>
                                <span className="text-[var(--text-muted)]">({c.totalReviews})</span>
                              </span>
                            ) : <span className="text-[var(--text-muted)]">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isPending && (
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>
                                Pending
                              </span>
                            )}
                            {isApproved && (
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>
                                Approved
                              </span>
                            )}
                            {isRejected && !isApproved && (
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleApproveChef(c.id)}
                                    disabled={chefActionLoading === c.id}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                                    style={{ background: "#10B981" }}
                                  >
                                    {chefActionLoading === c.id ? "..." : "Approve"}
                                  </button>
                                  <button
                                    onClick={() => { setRejectModalChef(c); setRejectReason(""); }}
                                    disabled={chefActionLoading === c.id}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                                    style={{ background: "#EF4444" }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {isApproved && trialEnd && (
                                <button
                                  onClick={() => handleExtendTrial(c.id)}
                                  disabled={chefActionLoading === c.id}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition hover:opacity-90 disabled:opacity-50"
                                  style={{ background: "rgba(139,92,246,0.12)", color: "#8B5CF6" }}
                                >
                                  {chefActionLoading === c.id ? "..." : "+3 Months"}
                                </button>
                              )}
                              {isRejected && !isApproved && (
                                <button
                                  onClick={() => handleApproveChef(c.id)}
                                  disabled={chefActionLoading === c.id}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                                  style={{ background: "#10B981" }}
                                >
                                  {chefActionLoading === c.id ? "..." : "Approve"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Reject Modal */}
              {rejectModalChef && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                  <div className="rounded-2xl p-6 w-[440px] border border-[var(--border)]" style={{ background: "var(--header-bg)" }}>
                    <h3 className="text-base font-semibold text-[var(--text)] mb-1">Reject Chef</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-4">Rejecting <strong>{rejectModalChef.kitchenName}</strong> ({rejectModalChef.user.email})</p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection (optional)..."
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm resize-none"
                      style={{ background: "var(--input)", color: "var(--text)" }}
                      rows={3}
                    />
                    <div className="flex gap-3 mt-4 justify-end">
                      <button
                        onClick={() => { setRejectModalChef(null); setRejectReason(""); }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRejectChef(rejectModalChef.id, rejectReason)}
                        disabled={chefActionLoading === rejectModalChef.id}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                        style={{ background: "#EF4444" }}
                      >
                        {chefActionLoading === rejectModalChef.id ? "Rejecting..." : "Confirm Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery/Pickup Info */}
              <div className="rounded-2xl border px-5 py-4 mt-6 flex items-center gap-3" style={{ background: "rgba(59,130,246,0.06)", borderColor: "rgba(59,130,246,0.2)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                  <Navigation size={20} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">Approval Workflow</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">New chefs who register are automatically set to &quot;Pending&quot; status. You&apos;ll receive an email notification at homealforuk@gmail.com with one-click approve/reject buttons. Approved chefs get a 3-month free Unlimited plan. You can extend trials by 3 months at a time.</p>
                </div>
              </div>
            </>
          )}

          {/* Customer Management Page */}
          {activePage === "customers" && (
            <>
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <Users size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Customer Management</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />0 Active</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-gray-400" />0 Inactive</span>
                    </div>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "var(--input)" }}>
                  <RefreshCw size={18} className="text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Total Customers", value: "0", icon: Users, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Active (30d)", value: "0", icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "New This Week", value: "0", icon: PlusCircle, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
                  { label: "With Subscriptions", value: "0", icon: Calendar, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
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

              {/* How Customers Find Nearby Chefs */}
              <div className="rounded-2xl border px-5 py-4 mb-6 flex items-center gap-3" style={{ background: "rgba(139,92,246,0.06)", borderColor: "rgba(139,92,246,0.2)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.15)" }}>
                  <MapPin size={20} style={{ color: "#8B5CF6" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">Nearby Tiffin Provider Discovery</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Customers see chefs within <strong>10 miles</strong> of their location by default. Each chef can set their own delivery radius (1&ndash;25 miles). Listings show whether a chef offers <span style={{ color: "#3B82F6" }}>Delivery</span>, <span style={{ color: "#10B981" }}>Pickup</span>, or both.</p>
                </div>
              </div>

              {/* Customers Table */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--input)" }}>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Customer</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Email</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Location</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Orders</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Spent</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Nearby Chefs</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-[var(--text-muted)]">
                        <Users size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No customers registered yet</p>
                        <p className="text-[11px] mt-1">Customers will appear here after signing up on the mobile app</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* All Orders Page */}
          {activePage === "orders" && (
            <>
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <ClipboardList size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">All Orders</h2>
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

              {/* Order Filters */}
              <div className="flex gap-2 mb-6">
                {[
                  { label: "All", active: true },
                  { label: "Active", active: false },
                  { label: "Completed", active: false },
                  { label: "Cancelled", active: false },
                ].map((tab, i) => (
                  <button key={i} className="px-4 py-2 rounded-xl text-xs font-semibold transition-all" style={{
                    background: tab.active ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "var(--header-bg)",
                    color: tab.active ? "#FFFFFF" : "var(--text-muted)",
                    border: tab.active ? "none" : "1px solid var(--border)",
                  }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Order Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Total Orders", value: "0", icon: ClipboardList, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Delivery Orders", value: "0", icon: Truck, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
                  { label: "Pickup Orders", value: "0", icon: Package, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Total Revenue", value: "£0.00", icon: PoundSterling, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
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

              {/* Orders Table */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--input)" }}>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Order ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Customer</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Chef</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Type</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Total</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-[var(--text-muted)]">
                        <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No orders yet</p>
                        <p className="text-[11px] mt-1">Platform-wide orders (delivery &amp; pickup) will appear here</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Promo Codes Page */}
          {activePage === "promos" && (
            <>
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <Tag size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Promo Codes</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />0 Active</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-red-400" />0 Expired</span>
                    </div>
                  </div>
                </div>
                <button className="px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                  <PlusCircle size={16} /> Create Promo
                </button>
              </div>

              {/* Promo Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Active Promos", value: "0", icon: Tag, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Total Redemptions", value: "0", icon: Check, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Discount Given", value: "£0.00", icon: PoundSterling, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
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

              {/* Promo Table */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--input)" }}>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Code</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Description</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Discount</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Uses</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Expiry</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-[var(--text-muted)]">
                        <Tag size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No promo codes created</p>
                        <p className="text-[11px] mt-1">Create promotional codes for customer discounts</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Food Categories Page */}
          {activePage === "categories" && (
            <>
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <FolderOpen size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Food Categories</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />0 Listed</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-gray-400" />0 Hidden</span>
                    </div>
                  </div>
                </div>
                <button className="px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                  <PlusCircle size={16} /> Add Category
                </button>
              </div>

              {/* Default Categories Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { name: "South Indian", icon: "🍛", dishes: 0, color: "#FF5A1F" },
                  { name: "North Indian", icon: "🥘", dishes: 0, color: "#EF4444" },
                  { name: "Chinese", icon: "🥡", dishes: 0, color: "#F59E0B" },
                  { name: "Continental", icon: "🍝", dishes: 0, color: "#3B82F6" },
                  { name: "Bengali", icon: "🐟", dishes: 0, color: "#10B981" },
                  { name: "Gujarati", icon: "🥗", dishes: 0, color: "#8B5CF6" },
                  { name: "Street Food", icon: "🌮", dishes: 0, color: "#F97316" },
                  { name: "Healthy & Diet", icon: "🥑", dishes: 0, color: "#10B981" },
                  { name: "Desserts", icon: "🍨", dishes: 0, color: "#EC4899" },
                  { name: "Breakfast", icon: "🥞", dishes: 0, color: "#F59E0B" },
                  { name: "Vegan", icon: "🌱", dishes: 0, color: "#10B981" },
                  { name: "Kids Meals", icon: "🧸", dishes: 0, color: "#3B82F6" },
                ].map((cat, i) => (
                  <div key={i} className="rounded-2xl border border-[var(--border)] p-4 text-center transition-all hover:scale-[1.02]" style={{ background: "var(--header-bg)" }}>
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <h4 className="text-sm font-bold text-[var(--text)]">{cat.name}</h4>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{cat.dishes} dishes</p>
                    <div className="mt-2 pt-2 border-t border-[var(--border)]">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: "#10B981", background: "rgba(16,185,129,0.1)" }}>Active</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border px-5 py-4 flex items-center gap-3" style={{ background: "rgba(59,130,246,0.06)", borderColor: "rgba(59,130,246,0.2)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                  <FolderOpen size={20} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">Food categories help customers discover chefs</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Chefs assign food categories to their dishes. Customers browse by category to find nearby kitchens that match their cravings.</p>
                </div>
              </div>
            </>
          )}

          {/* Analytics Page */}
          {activePage === "analytics" && (
            <>
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <BarChart3 size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Platform Analytics</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Platform-wide performance metrics</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {["7D", "30D", "90D", "1Y"].map((p, i) => (
                    <button key={p} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition" style={{
                      background: i === 0 ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "var(--input)",
                      color: i === 0 ? "#FFFFFF" : "var(--text-muted)",
                    }}>{p}</button>
                  ))}
                </div>
              </div>

              {/* Analytics Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Total Users", value: "1", icon: Users, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Active Chefs", value: "0", icon: ChefHat, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
                  { label: "Orders (30d)", value: "0", icon: ClipboardList, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Revenue (30d)", value: "£0.00", icon: PoundSterling, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
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
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-4">User Growth</h3>
                  <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {["Jan","Feb","Mar","Apr","May","Jun"].map((m) => (
                      <div key={m} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-lg" style={{ background: "var(--border)", height: "8px" }} />
                        <span className="text-[9px] text-[var(--text-muted)]">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--border)] p-5" style={{ background: "var(--header-bg)" }}>
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Order Volume</h3>
                  <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {["Jan","Feb","Mar","Apr","May","Jun"].map((m) => (
                      <div key={m} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-lg" style={{ background: "var(--border)", height: "8px" }} />
                        <span className="text-[9px] text-[var(--text-muted)]">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery vs Pickup Breakdown */}
              <div className="rounded-2xl border border-[var(--border)] p-5" style={{ background: "var(--header-bg)" }}>
                <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Fulfilment Method Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Delivery Orders", value: "0", pct: "0%", icon: Truck, color: "#3B82F6" },
                    { label: "Pickup Orders", value: "0", pct: "0%", icon: Package, color: "#10B981" },
                    { label: "Avg Delivery Radius", value: "0 mi", pct: "", icon: Navigation, color: "#8B5CF6" },
                  ].map((item, i) => {
                    const II = item.icon;
                    return (
                      <div key={i} className="rounded-xl border border-[var(--border)] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <II size={16} style={{ color: item.color }} />
                          <span className="text-xs font-semibold text-[var(--text)]">{item.label}</span>
                        </div>
                        <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
                        {item.pct && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{item.pct} of total</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Revenue Page */}
          {activePage === "revenue" && (
            <>
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <PoundSterling size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Revenue</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />£0 Earned</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-amber-500" />£0 Pending</span>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl text-xs font-medium transition hover:opacity-80 flex items-center gap-2" style={{ background: "var(--input)", color: "var(--text)" }}>
                  <Download size={14} /> Export
                </button>
              </div>

              {/* Revenue Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Total Revenue", value: "£0.00", icon: PoundSterling, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Platform Commission", value: "£0.00", icon: Wallet, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Chef Payouts", value: "£0.00", icon: TrendingUp, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
                  { label: "Avg Order Value", value: "£0.00", icon: Crown, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
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

              {/* Revenue by Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Meals & Tiffin", value: "£0.00", icon: UtensilsCrossed, color: "#FF5A1F" },
                  { label: "Homemade Products", value: "£0.00", icon: Store, color: "#8B5CF6" },
                  { label: "Subscriptions", value: "£0.00", icon: Calendar, color: "#10B981" },
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
                      <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-[var(--input)]">
                        <div className="h-full rounded-full" style={{ background: item.color, width: "0%" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Revenue Table */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--border)]">
                  <h3 className="text-sm font-semibold text-[var(--text)]">Recent Transactions</h3>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--input)" }}>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Transaction</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Chef</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Amount</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Commission</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Type</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-[var(--text-muted)]">
                        <PoundSterling size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No transactions yet</p>
                        <p className="text-[11px] mt-1">Revenue data will appear once orders start flowing</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Reports Page */}
          {activePage === "reports" && (
            <>
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                    <FileText size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Reports</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />0 Generated</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-amber-500" />0 Pending</span>
                    </div>
                  </div>
                </div>
                <button className="px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}>
                  <PlusCircle size={16} /> Generate Report
                </button>
              </div>

              {/* Report Types */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                {[
                  { name: "Chef Performance Report", desc: "Detailed overview of each chef's orders, revenue, ratings and delivery/pickup stats", icon: ChefHat, color: "#8B5CF6" },
                  { name: "Revenue Report", desc: "Platform revenue breakdown by service type, commission earned, and chef payouts", icon: PoundSterling, color: "#10B981" },
                  { name: "Customer Report", desc: "Customer acquisition, retention, order frequency and location distribution", icon: Users, color: "#3B82F6" },
                  { name: "Delivery & Pickup Report", desc: "Fulfilment method analytics — delivery vs pickup split, average radius, completion rates", icon: Truck, color: "#F59E0B" },
                ].map((report, i) => {
                  const RI = report.icon;
                  return (
                    <div key={i} className="rounded-2xl border border-[var(--border)] p-5 flex items-start gap-4 transition-all hover:scale-[1.01]" style={{ background: "var(--header-bg)" }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${report.color}12` }}>
                        <RI size={24} style={{ color: report.color }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[var(--text)]">{report.name}</h4>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">{report.desc}</p>
                        <button className="mt-3 px-4 py-1.5 rounded-lg text-[11px] font-semibold transition hover:opacity-80" style={{ color: report.color, background: `${report.color}10`, border: `1px solid ${report.color}25` }}>
                          Generate &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Generated Reports Table */}
              <div className="rounded-2xl bg-[var(--header-bg)] border border-[var(--border)] overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--border)]">
                  <h3 className="text-sm font-semibold text-[var(--text)]">Generated Reports</h3>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--input)" }}>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Report Name</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Type</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Date Range</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Generated</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center text-[var(--text-muted)]">
                        <FileText size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No reports generated yet</p>
                        <p className="text-[11px] mt-1">Use the report templates above to generate platform reports</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Generic pages */}
          {!customPages.includes(activePage) && (() => {
            const found = SIDEBAR_ITEMS.flatMap(g => g.items).find(i => i.id === activePage);
            const PageIcon = found?.icon || ClipboardList;
            const meta = PAGE_META[activePage] || { green: "0 Active", red: "0 Pending" };
            return (
              <>
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
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
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
                        className="px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, var(--badge-from), var(--badge-to))" }}
                      >
                        <PlusCircle size={16} />
                        <span>{meta.cta}</span>
                      </button>
                    )}
                  </div>
                </div>

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
