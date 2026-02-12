"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, ChefHat, Users, ClipboardList, Tag,
  FolderOpen, Settings, BarChart3, PoundSterling, FileText,
  Bell, Sun, Moon, Package, RefreshCw, PlusCircle, TrendingUp,
  TrendingDown, ShoppingBag, AlertCircle, Wallet, Globe, Shield,
  Check, Crown, Zap, Edit3, Store, Truck, Repeat, UtensilsCrossed,
  Grip, Award, Sparkles, MapPin, Heart, Leaf, ShieldCheck, Cake,
  Navigation, Eye, Star, Search, Download, Filter, Clock, Calendar,
  Menu, X, ChevronDown,
} from "lucide-react";

type IconComponent = typeof LayoutDashboard;
interface SidebarItem { icon: IconComponent; label: string; id: string }
interface SidebarGroup { section: string; items: SidebarItem[] }

const SIDEBAR_ITEMS: SidebarGroup[] = [
  { section: "OVERVIEW", items: [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  ]},
  { section: "MANAGEMENT", items: [
    { icon: ChefHat, label: "Home Makers", id: "chefs" },
    { icon: Users, label: "Customers", id: "customers" },
    { icon: ClipboardList, label: "Orders", id: "orders" },
  ]},
  { section: "PLATFORM", items: [
    { icon: Grip, label: "Service Types", id: "service-types" },
    { icon: Tag, label: "Promo Codes", id: "promos" },
    { icon: FolderOpen, label: "Categories", id: "categories" },
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
  "chefs": "Home Maker Management",
  "customers": "Customer Management",
  "orders": "All Orders",
  "service-types": "Service Types",
  "promos": "Promo Codes",
  "categories": "Categories",
  "settings": "Platform Settings",
  "analytics": "Analytics",
  "revenue": "Revenue",
  "reports": "Reports",
};

const PAGE_META: Record<string, { green: string; red: string; cta?: string }> = {
  "chefs": { green: "0 Approved", red: "0 Pending", cta: "Add Home Maker" },
  "customers": { green: "0 Active", red: "0 Inactive" },
  "orders": { green: "0 Completed", red: "0 Cancelled" },
  "service-types": { green: "4 Types", red: "0 Disabled" },
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

const BADGE_SYSTEM = [
  { name: "Verified Kitchen", icon: ShieldCheck, color: "#10B981", description: "Kitchen passes video verification and hygiene standards" },
  { name: "Hygiene Certified", icon: Sparkles, color: "#3B82F6", description: "Holds valid food safety certification (Level 2+)" },
  { name: "Top Rated", icon: Award, color: "#F59E0B", description: "Maintains 4.5+ average rating with 50+ reviews" },
  { name: "Community Favourite", icon: Heart, color: "#EC4899", description: "Receives 100+ repeat orders from unique customers" },
  { name: "Eco Friendly", icon: Leaf, color: "#10B981", description: "Uses sustainable packaging and eco-friendly practices" },
  { name: "Local Hero", icon: MapPin, color: "#8B5CF6", description: "Top Home Maker in their locality with 200+ orders/month" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

// Safe JSON parser: prevents SyntaxError when API returns HTML (e.g. 404 pages)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeJson(res: Response): Promise<any> {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return { success: false, error: `Unexpected response (${res.status})` };
  }
  return res.json();
}

interface ChefData {
  id: string;
  kitchenName: string;
  description: string | null;
  cuisineTypes: string | null;
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
  commissionRate: number;
  createdAt: string;
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
  const [expandedChefId, setExpandedChefId] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState("All");
  const [refreshingPage, setRefreshingPage] = useState(false);

  // Platform orders state
  const [platformOrders, setPlatformOrders] = useState<any[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Categories state
  const [adminCategories, setAdminCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '', sortOrder: 0, type: 'FOOD' as 'FOOD' | 'PRODUCT' });
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Promos state
  const [promos, setPromos] = useState<any[]>([]);
  const [promoStats, setPromoStats] = useState<any>({});
  const [promosLoading, setPromosLoading] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', maxDiscount: '', usageLimit: '', validFrom: '', validUntil: '' });
  const [editingPromo, setEditingPromo] = useState<any>(null);

  // Customers state
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Revenue state
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);

  // Commission editing state
  const [editingCommission, setEditingCommission] = useState<string | null>(null);
  const [commissionValue, setCommissionValue] = useState('');

  // Notification state
  interface NotifItem { id: string; type: string; title: string; message: string; time: string; actionId?: string }
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  function handlePageRefresh() {
    setRefreshingPage(true);
    setTimeout(() => setRefreshingPage(false), 800);
  }

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
        const data = await safeJson(res);
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

  // Fetch notifications on load and poll every 30 seconds
  useEffect(() => {
    if (!authToken) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  async function fetchNotifications() {
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/notifications`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await safeJson(res);
      if (data.success) {
        setNotifications(data.data.notifications);
        setNotifCount(data.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }

  async function fetchChefs() {
    setChefLoading(true);
    try {
      const statusParam = chefFilter === "all" ? "" : `?status=${chefFilter}`;
      const res = await fetch(`${API_URL}/api/v1/admin/chefs${statusParam}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await safeJson(res);
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
      const data = await safeJson(res);
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
      const data = await safeJson(res);
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
      const data = await safeJson(res);
      if (data.success) fetchChefs();
    } catch (err) {
      console.error("Extend trial failed:", err);
    } finally {
      setChefActionLoading(null);
    }
  }

  // Fetch platform orders
  async function fetchPlatformOrders() {
    if (!authToken) return;
    setOrderLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/orders`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await safeJson(res);
      if (data.success) setPlatformOrders(data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setOrderLoading(false);
    }
  }

  // Fetch dashboard stats
  async function fetchDashboardStats() {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await safeJson(res);
      if (data.success && data.data) setDashboardStats(data.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  }

  // Fetch categories
  async function fetchCategories() {
    if (!authToken) return;
    setCategoriesLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/categories`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await safeJson(res);
      if (data.success) setAdminCategories(data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function handleCreateCategory() {
    if (!authToken || !categoryForm.name) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/categories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      const data = await safeJson(res);
      if (data.success) {
        setShowCategoryModal(false);
        setCategoryForm({ name: '', icon: '', sortOrder: 0, type: 'FOOD' });
        fetchCategories();
      }
    } catch (err) {
      console.error("Failed to create category:", err);
    }
  }

  async function handleUpdateCategory(id: string, updates: any) {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/categories/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await safeJson(res);
      if (data.success) {
        setEditingCategory(null);
        setCategoryForm({ name: '', icon: '', sortOrder: 0, type: 'FOOD' });
        setShowCategoryModal(false);
        fetchCategories();
      }
    } catch (err) {
      console.error("Failed to update category:", err);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await safeJson(res);
      if (data.success) fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  }

  // Fetch promos
  async function fetchPromos() {
    if (!authToken) return;
    setPromosLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/promos`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await safeJson(res);
      if (data.success) {
        setPromos(data.data?.promos || []);
        setPromoStats(data.data?.stats || {});
      }
    } catch (err) {
      console.error("Failed to fetch promos:", err);
    } finally {
      setPromosLoading(false);
    }
  }

  async function handleCreatePromo() {
    if (!authToken || !promoForm.code) return;
    try {
      const body: any = {
        code: promoForm.code,
        description: promoForm.description,
        discountType: promoForm.discountType,
        discountValue: parseFloat(promoForm.discountValue) || 0,
      };
      if (promoForm.minOrderValue) body.minOrderValue = parseFloat(promoForm.minOrderValue);
      if (promoForm.maxDiscount) body.maxDiscount = parseFloat(promoForm.maxDiscount);
      if (promoForm.usageLimit) body.usageLimit = parseInt(promoForm.usageLimit);
      if (promoForm.validFrom) body.validFrom = promoForm.validFrom;
      if (promoForm.validUntil) body.validUntil = promoForm.validUntil;

      const res = await fetch(`${API_URL}/api/v1/admin/promos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await safeJson(res);
      if (data.success) {
        setShowPromoModal(false);
        setPromoForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', maxDiscount: '', usageLimit: '', validFrom: '', validUntil: '' });
        fetchPromos();
      }
    } catch (err) {
      console.error("Failed to create promo:", err);
    }
  }

  async function handleUpdatePromo(id: string, updates: any) {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/promos/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await safeJson(res);
      if (data.success) {
        setEditingPromo(null);
        setPromoForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', maxDiscount: '', usageLimit: '', validFrom: '', validUntil: '' });
        setShowPromoModal(false);
        fetchPromos();
      }
    } catch (err) {
      console.error("Failed to update promo:", err);
    }
  }

  async function handleDeletePromo(id: string) {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/promos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await safeJson(res);
      if (data.success) fetchPromos();
    } catch (err) {
      console.error("Failed to delete promo:", err);
    }
  }

  // Fetch customers
  async function fetchCustomers() {
    if (!authToken) return;
    setCustomersLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/customers`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await safeJson(res);
      if (data.success) setCustomers(data.data || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setCustomersLoading(false);
    }
  }

  // Fetch revenue stats
  async function fetchRevenueStats() {
    if (!authToken) return;
    setRevenueLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/revenue-stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await safeJson(res);
      if (data.success) setRevenueStats(data.data || null);
    } catch (err) {
      console.error("Failed to fetch revenue stats:", err);
    } finally {
      setRevenueLoading(false);
    }
  }

  // Update chef commission rate
  async function handleUpdateCommission(chefId: string, rate: number) {
    if (!authToken) return;
    setChefActionLoading(chefId);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/chefs/${chefId}/commission`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ commissionRate: rate }),
      });
      const data = await safeJson(res);
      if (data.success) {
        setEditingCommission(null);
        setCommissionValue('');
        fetchChefs();
      }
    } catch (err) {
      console.error("Failed to update commission:", err);
    } finally {
      setChefActionLoading(null);
    }
  }

  // Fetch dashboard stats when auth is ready
  useEffect(() => {
    if (!authToken) return;
    fetchDashboardStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  // Fetch orders when on orders page, poll every 15s
  useEffect(() => {
    if (!authToken) return;
    if (activePage === "orders" || activePage === "dashboard") {
      fetchPlatformOrders();
    }
    if (activePage === "orders") {
      const interval = setInterval(fetchPlatformOrders, 15000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, authToken]);

  // Fetch categories when on categories page
  useEffect(() => {
    if (!authToken) return;
    if (activePage === "categories") fetchCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, authToken]);

  // Fetch promos when on promos page
  useEffect(() => {
    if (!authToken) return;
    if (activePage === "promos") fetchPromos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, authToken]);

  // Fetch customers when on customers page
  useEffect(() => {
    if (!authToken) return;
    if (activePage === "customers") fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, authToken]);

  // Fetch revenue stats when on revenue page
  useEffect(() => {
    if (!authToken) return;
    if (activePage === "revenue") fetchRevenueStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, authToken]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const customPages = ["dashboard", "settings", "service-types", "chefs", "customers", "orders", "promos", "categories", "analytics", "revenue", "reports"];

  return (
    <div className="flex w-full overflow-x-hidden app-height">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-200 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ background: "var(--sidebar-bg)" }}>
        {/* Sidebar branding */}
        <div className="py-3 px-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 px-2.5" aria-label="Homeal - Home">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--logo-bg)" }}>
                <img src="/favicon-final-2.png" alt="" className="w-7 h-7 rounded-lg" />
              </div>
              <img src="/logo-full.png" alt="Homeal" className="h-9 w-auto shrink-0" />
            </a>
            <button className="md:hidden p-1 rounded-lg hover:bg-[var(--sidebar-hover)]" onClick={() => setSidebarOpen(false)}>
              <X size={20} style={{ color: "var(--sidebar-text)" }} />
            </button>
          </div>
          <div className="px-2.5 py-2">
            <p className="text-xs text-[var(--sidebar-muted)]">Welcome back</p>
            <p className="text-sm font-semibold text-[var(--sidebar-text)]">{adminName || "Super Admin"}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pt-1">
          {SIDEBAR_ITEMS.map((group, gi) => (
            <div key={gi} className="mb-4">
              <div
                className="text-[10px] font-bold tracking-[0.15em] uppercase px-3 mb-2 mt-2"
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
                    className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[14px] font-medium transition-all mb-0.5 active:scale-[0.98]"
                    style={{
                      background: isActive ? "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.15))" : "transparent",
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
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
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
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 pb-20 md:pb-0">
        {/* Top bar */}
        <header className="px-4 md:px-6 h-14 border-b border-[var(--border)] flex items-center" style={{ background: "var(--header-bg)" }}>
          <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--input)] transition mr-3" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-[var(--text)]" />
          </button>
          <h1 className="text-lg gradient-text font-bold flex-1 min-w-0 truncate">{PAGE_TITLES[activePage] || "Dashboard"}</h1>
          <div className="flex items-center gap-1.5 sm:gap-2 ml-3">
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--input)] transition relative">
                <Bell size={18} className="text-[var(--text-muted)]" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1" style={{ background: "#EF4444" }}>
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>
              {/* Notification Dropdown */}
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-11 w-80 sm:w-96 max-h-[70vh] rounded-2xl border border-[var(--border)] overflow-hidden z-50" style={{ background: "var(--header-bg)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
                    <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[var(--text)]">Notifications</h3>
                      {notifCount > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                          {notifCount} pending
                        </span>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-[60vh]">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <Bell size={28} className="mx-auto mb-2 opacity-20" style={{ color: "var(--text-muted)" }} />
                          <p className="text-xs text-[var(--text-muted)]">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const isAction = n.type === "chef_pending" || n.type === "admin_request";
                          const iconColor = n.type === "chef_pending" ? "#F59E0B" : n.type === "admin_request" ? "#EF4444" : n.type === "customer_joined" ? "#3B82F6" : "#10B981";
                          const iconBg = n.type === "chef_pending" ? "rgba(245,158,11,0.12)" : n.type === "admin_request" ? "rgba(239,68,68,0.12)" : n.type === "customer_joined" ? "rgba(59,130,246,0.12)" : "rgba(16,185,129,0.12)";
                          const timeAgo = (() => {
                            const diff = Date.now() - new Date(n.time).getTime();
                            const mins = Math.floor(diff / 60000);
                            if (mins < 1) return "just now";
                            if (mins < 60) return `${mins}m ago`;
                            const hrs = Math.floor(mins / 60);
                            if (hrs < 24) return `${hrs}h ago`;
                            const days = Math.floor(hrs / 24);
                            return `${days}d ago`;
                          })();
                          return (
                            <div
                              key={n.id}
                              className="px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--input)] transition cursor-pointer"
                              onClick={() => {
                                setNotifOpen(false);
                                if (n.type === "chef_pending") setActivePage("chefs");
                                else if (n.type === "admin_request") setActivePage("settings");
                                else if (n.type === "customer_joined") setActivePage("customers");
                              }}
                            >
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: iconBg }}>
                                  {n.type === "chef_pending" && <ChefHat size={14} style={{ color: iconColor }} />}
                                  {n.type === "admin_request" && <Shield size={14} style={{ color: iconColor }} />}
                                  {n.type === "customer_joined" && <Users size={14} style={{ color: iconColor }} />}
                                  {n.type === "chef_approved" && <Check size={14} style={{ color: iconColor }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-[var(--text)]">{n.title}</p>
                                    <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0 ml-2">{timeAgo}</span>
                                  </div>
                                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">{n.message}</p>
                                  {isAction && (
                                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                                      Action required
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setActivePage("settings")} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--input)] transition">
              <Settings size={18} className="text-[var(--text-muted)]" />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ml-0.5 badge-gradient">
              {adminName ? adminName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "SA"}
            </div>
          </div>
        </header>

        <div className="p-3 sm:p-6">
          {/* Dashboard */}
          {activePage === "dashboard" && (
            <>
              {/* Platform Info Banner */}
              <div
                className="glass-card rounded-2xl px-4 sm:px-6 py-4 sm:py-5 mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient"
                  >
                    <Globe size={28} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">Homeal Platform</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1.5"><Shield size={12} /> Super Admin Control</span>
                      <span className="flex items-center gap-1.5"><Users size={12} /> {chefStats.total} Home Maker{chefStats.total !== 1 ? "s" : ""} Registered</span>
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
                className="glass-card rounded-2xl px-5 py-4 mb-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient"
                  >
                    <LayoutDashboard size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Dashboard</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Welcome back, {adminName || "Admin"}</p>
                  </div>
                </div>
                <button
                  onClick={() => { handlePageRefresh(); fetchDashboardStats(); fetchPlatformOrders(); fetchChefs(); }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80"
                  style={{ background: "var(--input)" }}
                >
                  <RefreshCw size={18} className={`text-[var(--text-muted)] ${refreshingPage ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Stats Row 1 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                {[
                  { ...STATS_ROW1[0], value: `£${(dashboardStats?.todayRevenue || 0).toFixed(2)}`, sub: "Today's earnings" },
                  { ...STATS_ROW1[1] },
                  { ...STATS_ROW1[2], value: String(dashboardStats?.todayOrders || 0), sub: "Orders today" },
                  { ...STATS_ROW1[3], value: String(dashboardStats?.totalCustomers || chefStats.total), sub: `${dashboardStats?.totalCustomers || 0} customers, ${chefStats.total} chefs` },
                ].map((s, i) => {
                  const StatIcon = s.icon;
                  return (
                    <div key={i} className="glass-card p-4 rounded-2xl transition-all hover:scale-[1.02] duration-300 hover:shadow-xl">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <StatIcon size={18} style={{ color: s.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-1">{s.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Stats Row 2 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
                {[
                  { ...STATS_ROW2[0], value: `£${(dashboardStats?.totalRevenue || 0).toFixed(2)}`, sub: `${dashboardStats?.totalOrders || 0} total orders` },
                  { ...STATS_ROW2[1] },
                  { ...STATS_ROW2[2] },
                  { ...STATS_ROW2[3], value: String(chefStats.pending), sub: `${chefStats.pending} chef${chefStats.pending !== 1 ? "s" : ""} awaiting approval` },
                ].map((s, i) => {
                  const StatIcon = s.icon;
                  return (
                    <div key={i} className="glass-card p-4 rounded-2xl transition-all hover:scale-[1.02] duration-300 hover:shadow-xl">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <StatIcon size={18} style={{ color: s.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-1">{s.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Activity Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-6">
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
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 badge-gradient">
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
                    <div className="text-center py-16 animate-fade-in-up">
                      <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                        <ChefHat size={36} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-[var(--text)] mb-1">No chefs registered yet</h3>
                      <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Approved and pending chefs will appear here</p>
                    </div>
                  )}
                </div>
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-[var(--text)]">Recent Orders</h2>
                    {platformOrders.length > 0 && (
                      <div className="flex gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>{platformOrders.filter((o) => o.status === "DELIVERED").length} delivered</span>
                        <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}>{platformOrders.filter((o) => ["PLACED","ACCEPTED","PREPARING","READY"].includes(o.status)).length} active</span>
                      </div>
                    )}
                  </div>
                  {platformOrders.length > 0 ? (
                    <div className="space-y-3">
                      {platformOrders.slice(0, 5).map((order) => {
                        const statusColor: Record<string, string> = { PLACED: "#3B82F6", ACCEPTED: "#6366F1", PREPARING: "#F59E0B", READY: "#10B981", OUT_FOR_DELIVERY: "#8B5CF6", DELIVERED: "#059669", CANCELLED: "#EF4444", REJECTED: "#EF4444" };
                        const sc = statusColor[order.status] || "#6B7280";
                        return (
                          <div key={order.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${sc}15` }}>
                                <ClipboardList size={14} style={{ color: sc }} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-[var(--text)] truncate">{order.chef?.kitchenName || "Unknown Chef"}</p>
                                <p className="text-[10px] text-[var(--text-muted)] truncate">{order.user?.name || "Unknown"} - {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end flex-shrink-0 ml-2">
                              <span className="text-xs font-semibold text-[var(--text)]">£{parseFloat(order.total || 0).toFixed(2)}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full mt-0.5" style={{ background: `${sc}15`, color: sc }}>
                                {order.status.replace(/_/g, " ")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {platformOrders.length > 5 && (
                        <button onClick={() => setActivePage("orders")} className="text-xs font-medium w-full text-center py-2 rounded-lg hover:opacity-80 transition" style={{ color: "var(--primary)" }}>
                          View all {platformOrders.length} orders
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16 animate-fade-in-up">
                      <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                        <ClipboardList size={36} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-[var(--text)] mb-1">No orders yet</h3>
                      <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Platform-wide orders will be shown here</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Service Types Management */}
          {activePage === "service-types" && (
            <>
              {/* Header */}
              <div
                className="glass-card rounded-2xl px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
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
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="hidden md:table w-full text-xs">
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
                {/* Mobile card view */}
                <div className="md:hidden divide-y divide-[var(--border)]">
                  {BADGE_SYSTEM.map((badge, i) => {
                    const BadgeIcon = badge.icon;
                    return (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${badge.color}15` }}>
                          <BadgeIcon size={20} style={{ color: badge.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[var(--text)]">{badge.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0" style={{ color: "#10B981", background: "rgba(16,185,129,0.1)" }}>Active</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] mt-1">{badge.description}</p>
                          <p className="text-[11px] font-semibold mt-1.5" style={{ color: badge.color }}>0 chefs earned</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Settings Page */}
          {activePage === "settings" && (
            <>
              {/* Settings Header */}
              <div
                className="glass-card rounded-2xl px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient"
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
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition hover:opacity-90 ${editingPlans ? "" : "btn-premium text-white"}`}
                  style={
                    editingPlans
                      ? { background: "var(--input)", color: "var(--text)", border: "1px solid var(--border)" }
                      : undefined
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
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:overflow-visible mb-6">
                {PLANS.map((plan, i) => {
                  const PlanIcon = plan.icon;
                  const isActive = "active" in plan && plan.active;
                  return (
                    <div key={i} className="min-w-[280px] sm:min-w-0 flex-shrink-0 sm:flex-shrink p-4 rounded-2xl border transition-all hover:scale-[1.02] duration-300 hover:shadow-xl" style={{ background: "var(--header-bg)", borderColor: isActive ? plan.color : plan.borderColor }}>
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
              <div className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-2 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:overflow-visible mb-6">
                {PLANS.map((plan, i) => {
                  const PlanIcon = plan.icon;
                  return (
                    <div
                      key={i}
                      className="min-w-[280px] sm:min-w-0 flex-shrink-0 sm:flex-shrink relative rounded-2xl border p-5 transition-all hover:scale-[1.02] duration-300 hover:shadow-xl"
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
              {(() => {
                const plans = PLANS;
                const comparisonFeatures = [
                  { name: "Monthly Orders", values: ["30", "150", "Unlimited"] },
                  { name: "Menu Listing", values: ["Basic", "Featured", "Premium"] },
                  { name: "Homemade Products", values: ["1 item", "4 items", "All"] },
                  { name: "Tiffin Subscriptions", values: ["\u2014", "Yes", "Yes"] },
                  { name: "Catering Orders", values: ["\u2014", "\u2014", "Yes"] },
                  { name: "Analytics", values: ["Basic", "Advanced", "Full Suite"] },
                  { name: "Notifications", values: ["Email", "Priority", "Real-time Push"] },
                  { name: "Promotional Tools", values: ["\u2014", "Yes", "Yes"] },
                  { name: "Account Manager", values: ["\u2014", "\u2014", "Dedicated"] },
                  { name: "Support", values: ["Email", "Priority Email", "24/7 Priority"] },
                  { name: "Platform Commission", values: ["15%", "10%", "5%"] },
                ];
                return (
                  <>
                    {/* Mobile plan comparison */}
                    <div className="sm:hidden space-y-4 mb-6">
                      {plans.map((plan, i) => (
                        <div key={i} className="glass-card rounded-2xl p-4">
                          <h4 className="text-sm font-bold mb-3" style={{ color: plan.color }}>{plan.name} — {plan.price}{plan.period}</h4>
                          <div className="space-y-2.5">
                            {comparisonFeatures.map((feat, fi) => (
                              <div key={fi} className="flex justify-between text-xs">
                                <span className="text-[var(--text-muted)]">{feat.name}</span>
                                <span className="font-semibold text-[var(--text)]">{feat.values[i]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="hidden sm:block glass-card rounded-2xl p-6">
                      <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Plan Comparison</h3>
                      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                        <table className="min-w-[520px] w-full text-xs">
                          <thead>
                            <tr style={{ background: "var(--input)" }}>
                              <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Feature</th>
                              <th className="text-center px-4 py-3 font-semibold" style={{ color: "#10B981" }}>Starter (Free)</th>
                              <th className="text-center px-4 py-3 font-semibold" style={{ color: "#3B82F6" }}>Growth (£30)</th>
                              <th className="text-center px-4 py-3 font-semibold" style={{ color: "#8B5CF6" }}>Unlimited (£45)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparisonFeatures.map((row, ri) => (
                              <tr key={ri} className="border-t border-[var(--border)]">
                                <td className="px-4 py-2.5 font-medium text-[var(--text)]">{row.name}</td>
                                <td className="px-4 py-2.5 text-center text-[var(--text-muted)]">{row.values[0]}</td>
                                <td className="px-4 py-2.5 text-center text-[var(--text-muted)]">{row.values[1]}</td>
                                <td className="px-4 py-2.5 text-center text-[var(--text-muted)]">{row.values[2]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          )}

          {/* Chef Management Page */}
          {activePage === "chefs" && (
            <>
              <div className="glass-card rounded-2xl px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
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
                    <div key={i} className="glass-card p-4 rounded-2xl">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <SI size={18} style={{ color: s.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:overflow-x-visible mb-4">
                {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setChefFilter(f)}
                    className="whitespace-nowrap shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
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
              <div className="glass-card rounded-2xl overflow-hidden">
                {/* Desktop table */}
                <table className="w-full text-xs hidden md:table">
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
                        <td colSpan={8} className="px-5 py-16 text-center">
                          <div className="text-center py-4 animate-fade-in-up">
                            <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                              <ChefHat size={36} className="text-white" />
                            </div>
                            <h3 className="text-base font-bold text-[var(--text)] mb-1">{chefFilter === "all" ? "No chefs registered yet" : `No ${chefFilter} chefs`}</h3>
                            <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Chefs who register will appear here for approval</p>
                          </div>
                        </td>
                      </tr>
                    ) : chefs.map((c) => {
                      const isPending = !c.isVerified && !c.rejectedAt;
                      const isApproved = c.isVerified;
                      const isRejected = !!c.rejectedAt;
                      const trialEnd = c.trialEndsAt ? new Date(c.trialEndsAt) : null;
                      const trialExpired = trialEnd ? trialEnd < new Date() : false;
                      const isExpanded = expandedChefId === c.id;

                      return (
                        <React.Fragment key={c.id}>
                        <tr className="border-t border-[var(--border)] hover:bg-[var(--input)] transition cursor-pointer" onClick={() => setExpandedChefId(isExpanded ? null : c.id)}>
                          <td className="px-5 py-3">
                            <div className="font-semibold text-[var(--text)]">{c.kitchenName}</div>
                            <div className="text-[11px] text-[var(--text-muted)]">{c.user.name}</div>
                          </td>
                          <td className="px-4 py-3 text-[var(--text-muted)]">{c.user.email || "\u2014"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{
                              background: c.plan === "UNLIMITED" ? "rgba(139,92,246,0.12)" : "rgba(16,185,129,0.12)",
                              color: c.plan === "UNLIMITED" ? "#8B5CF6" : "#10B981",
                            }}>
                              {c.plan || "\u2014"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-[var(--text-muted)]">
                            {trialEnd ? (
                              <span className={trialExpired ? "text-red-500 font-semibold" : ""}>
                                {trialEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                {trialExpired && <span className="block text-[10px]">Expired</span>}
                              </span>
                            ) : "\u2014"}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-[var(--text)]">{c._count.orders}</td>
                          <td className="px-4 py-3 text-center">
                            {c.avgRating > 0 ? (
                              <span className="flex items-center justify-center gap-1">
                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                <span className="font-semibold text-[var(--text)]">{c.avgRating.toFixed(1)}</span>
                                <span className="text-[var(--text-muted)]">({c.totalReviews})</span>
                              </span>
                            ) : <span className="text-[var(--text-muted)]">\u2014</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isPending && <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>Pending</span>}
                            {isApproved && <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>Approved</span>}
                            {isRejected && !isApproved && <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>Rejected</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {isPending && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); handleApproveChef(c.id); }} disabled={chefActionLoading === c.id} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#10B981" }}>
                                    {chefActionLoading === c.id ? "..." : "Approve"}
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); setRejectModalChef(c); setRejectReason(""); }} disabled={chefActionLoading === c.id} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#EF4444" }}>
                                    Reject
                                  </button>
                                </>
                              )}
                              {isApproved && trialEnd && (
                                <button onClick={(e) => { e.stopPropagation(); handleExtendTrial(c.id); }} disabled={chefActionLoading === c.id} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition hover:opacity-90 disabled:opacity-50" style={{ background: "rgba(139,92,246,0.12)", color: "#8B5CF6" }}>
                                  {chefActionLoading === c.id ? "..." : "+3 Months"}
                                </button>
                              )}
                              {isRejected && !isApproved && (
                                <button onClick={(e) => { e.stopPropagation(); handleApproveChef(c.id); }} disabled={chefActionLoading === c.id} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#10B981" }}>
                                  {chefActionLoading === c.id ? "..." : "Approve"}
                                </button>
                              )}
                              <ChevronDown size={14} className={`ml-1 text-[var(--text-muted)] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </td>
                        </tr>
                        {/* Expandable detail panel */}
                        {isExpanded && (
                          <tr className="border-t border-[var(--border)]">
                            <td colSpan={8} className="px-0 py-0">
                              <div className="px-5 py-5" style={{ background: "var(--input)" }}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                  {/* Profile */}
                                  <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
                                      <ChefHat size={14} style={{ color: "var(--primary)" }} /> Profile
                                    </h4>
                                    <div className="glass-card rounded-xl p-4 space-y-2.5">
                                      <div><span className="text-[10px] text-[var(--text-muted)]">Kitchen Name</span><p className="text-xs font-semibold text-[var(--text)]">{c.kitchenName}</p></div>
                                      <div><span className="text-[10px] text-[var(--text-muted)]">Chef Name</span><p className="text-xs font-semibold text-[var(--text)]">{c.user.name}</p></div>
                                      <div><span className="text-[10px] text-[var(--text-muted)]">Email</span><p className="text-xs text-[var(--text)]">{c.user.email || "\u2014"}</p></div>
                                      <div><span className="text-[10px] text-[var(--text-muted)]">Phone</span><p className="text-xs text-[var(--text)]">{c.user.phone || "\u2014"}</p></div>
                                      <div><span className="text-[10px] text-[var(--text-muted)]">Registered</span><p className="text-xs text-[var(--text)]">{new Date(c.user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p></div>
                                      {c.description && <div><span className="text-[10px] text-[var(--text-muted)]">Description</span><p className="text-xs text-[var(--text)]">{c.description}</p></div>}
                                      {c.cuisineTypes && <div><span className="text-[10px] text-[var(--text-muted)]">Cuisine Types</span><p className="text-xs text-[var(--text)]">{c.cuisineTypes}</p></div>}
                                    </div>
                                  </div>
                                  {/* Stats */}
                                  <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
                                      <BarChart3 size={14} style={{ color: "#3B82F6" }} /> Statistics
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2.5">
                                      {[
                                        { label: "Orders", value: String(c._count.orders), color: "#8B5CF6" },
                                        { label: "Menu Items", value: String(c._count.menus), color: "#3B82F6" },
                                        { label: "Reviews", value: String(c._count.reviews), color: "#F59E0B" },
                                        { label: "Rating", value: c.avgRating > 0 ? c.avgRating.toFixed(1) : "\u2014", color: "#F59E0B" },
                                        { label: "Delivery Radius", value: `${c.deliveryRadius} mi`, color: "#10B981" },
                                      ].map((stat, si) => (
                                        <div key={si} className="glass-card rounded-lg p-3 text-center">
                                          <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                                          <p className="text-[10px] text-[var(--text-muted)]">{stat.label}</p>
                                        </div>
                                      ))}
                                      {/* Commission - editable */}
                                      <div className="glass-card rounded-lg p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        {editingCommission === c.id ? (
                                          <div className="flex items-center justify-center gap-1">
                                            <input
                                              type="number"
                                              value={commissionValue}
                                              onChange={(e) => setCommissionValue(e.target.value)}
                                              className="w-14 text-center text-sm font-bold rounded-md border border-[var(--border)] py-0.5"
                                              style={{ background: "var(--input)", color: "#EF4444" }}
                                              min="0"
                                              max="100"
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") handleUpdateCommission(c.id, parseFloat(commissionValue) || 0);
                                                if (e.key === "Escape") { setEditingCommission(null); setCommissionValue(''); }
                                              }}
                                            />
                                            <span className="text-sm font-bold" style={{ color: "#EF4444" }}>%</span>
                                            <button onClick={() => handleUpdateCommission(c.id, parseFloat(commissionValue) || 0)} className="ml-1 p-0.5 rounded" style={{ background: "rgba(16,185,129,0.15)" }} disabled={chefActionLoading === c.id}>
                                              <Check size={12} style={{ color: "#10B981" }} />
                                            </button>
                                            <button onClick={() => { setEditingCommission(null); setCommissionValue(''); }} className="p-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)" }}>
                                              <X size={12} style={{ color: "#EF4444" }} />
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="cursor-pointer group" onClick={() => { setEditingCommission(c.id); setCommissionValue(String(c.commissionRate || 15)); }}>
                                            <p className="text-lg font-bold group-hover:underline" style={{ color: "#EF4444" }}>{c.commissionRate || 15}%</p>
                                            <p className="text-[10px] text-[var(--text-muted)] flex items-center justify-center gap-1">Commission <Edit3 size={8} className="opacity-0 group-hover:opacity-100 transition" /></p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {/* Plan & Status */}
                                  <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
                                      <Crown size={14} style={{ color: "#8B5CF6" }} /> Plan & Status
                                    </h4>
                                    <div className="glass-card rounded-xl p-4 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-[var(--text-muted)]">Current Plan</span>
                                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: c.plan === "UNLIMITED" ? "rgba(139,92,246,0.12)" : "rgba(16,185,129,0.12)", color: c.plan === "UNLIMITED" ? "#8B5CF6" : "#10B981" }}>{c.plan || "\u2014"}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-[var(--text-muted)]">Status</span>
                                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: isApproved ? "rgba(16,185,129,0.12)" : isPending ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)", color: isApproved ? "#10B981" : isPending ? "#F59E0B" : "#EF4444" }}>{isApproved ? "Approved" : isPending ? "Pending" : "Rejected"}</span>
                                      </div>
                                      {trialEnd && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] text-[var(--text-muted)]">Trial Ends</span>
                                          <span className={`text-xs font-medium ${trialExpired ? "text-red-500" : "text-[var(--text)]"}`}>{trialEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}{trialExpired && " (Expired)"}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-[var(--text-muted)]">Online</span>
                                        <span className="flex items-center gap-1.5 text-xs"><span className={`w-2 h-2 rounded-full ${c.isOnline ? "bg-emerald-500" : "bg-gray-400"}`} />{c.isOnline ? "Online" : "Offline"}</span>
                                      </div>
                                      {isRejected && c.rejectionReason && (
                                        <div className="pt-2 border-t border-[var(--border)]">
                                          <span className="text-[10px] text-red-500 font-medium">Rejection Reason</span>
                                          <p className="text-xs text-[var(--text-muted)] mt-0.5">{c.rejectionReason}</p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {isPending && (
                                        <>
                                          <button onClick={(e) => { e.stopPropagation(); handleApproveChef(c.id); }} disabled={chefActionLoading === c.id} className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#10B981" }}>{chefActionLoading === c.id ? "..." : "Approve Chef"}</button>
                                          <button onClick={(e) => { e.stopPropagation(); setRejectModalChef(c); setRejectReason(""); }} disabled={chefActionLoading === c.id} className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#EF4444" }}>Reject</button>
                                        </>
                                      )}
                                      {isApproved && trialEnd && (
                                        <button onClick={(e) => { e.stopPropagation(); handleExtendTrial(c.id); }} disabled={chefActionLoading === c.id} className="px-4 py-2 rounded-lg text-xs font-semibold transition hover:opacity-90 disabled:opacity-50" style={{ background: "rgba(139,92,246,0.12)", color: "#8B5CF6" }}>{chefActionLoading === c.id ? "..." : "Extend Trial +3 Months"}</button>
                                      )}
                                      {isRejected && !isApproved && (
                                        <button onClick={(e) => { e.stopPropagation(); handleApproveChef(c.id); }} disabled={chefActionLoading === c.id} className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#10B981" }}>{chefActionLoading === c.id ? "..." : "Approve Chef"}</button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>

                {/* Mobile card view */}
                <div className="md:hidden">
                  {chefLoading ? (
                    <div className="px-5 py-16 text-center text-[var(--text-muted)]">
                      <RefreshCw size={32} className="mx-auto mb-3 opacity-30 animate-spin" />
                      <p className="text-sm font-medium">Loading chefs...</p>
                    </div>
                  ) : chefs.length === 0 ? (
                    <div className="text-center py-16 animate-fade-in-up">
                      <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                        <ChefHat size={36} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-[var(--text)] mb-1">{chefFilter === "all" ? "No chefs registered yet" : `No ${chefFilter} chefs`}</h3>
                      <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Chefs who register will appear here for approval</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {chefs.map((c) => {
                        const isPending = !c.isVerified && !c.rejectedAt;
                        const isApproved = c.isVerified;
                        const isRejected = !!c.rejectedAt;
                        const trialEnd = c.trialEndsAt ? new Date(c.trialEndsAt) : null;
                        const trialExpired = trialEnd ? trialEnd < new Date() : false;
                        const isExpanded = expandedChefId === c.id;
                        return (
                          <div key={c.id} className="p-4 space-y-3 cursor-pointer" onClick={() => setExpandedChefId(isExpanded ? null : c.id)}>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-semibold text-sm text-[var(--text)]">{c.kitchenName}</div>
                                <div className="text-xs text-[var(--text-muted)]">{c.user.name}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isPending && <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>Pending</span>}
                                {isApproved && <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>Approved</span>}
                                {isRejected && !isApproved && <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>Rejected</span>}
                                <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </div>
                            </div>
                            <div className="text-xs text-[var(--text-muted)] truncate">{c.user.email || "\u2014"}</div>
                            <div className="flex flex-wrap gap-3 text-xs">
                              <span className="text-[var(--text-muted)]">Plan: <span className="font-semibold text-[var(--text)]">{c.plan || "\u2014"}</span></span>
                              <span className="text-[var(--text-muted)]">Orders: <span className="font-semibold text-[var(--text)]">{c._count.orders}</span></span>
                              {c.avgRating > 0 && (
                                <span className="flex items-center gap-1">
                                  <Star size={12} className="text-amber-500 fill-amber-500" />
                                  <span className="font-semibold text-[var(--text)]">{c.avgRating.toFixed(1)}</span>
                                </span>
                              )}
                            </div>
                            {trialEnd && (
                              <div className="text-xs text-[var(--text-muted)]">
                                Trial ends: {trialEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                {trialExpired && <span className="ml-1.5 text-red-500 font-semibold">Expired</span>}
                              </div>
                            )}
                            <div className="flex gap-2">
                              {isPending && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); handleApproveChef(c.id); }} disabled={chefActionLoading === c.id} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#10B981" }}>
                                    {chefActionLoading === c.id ? "..." : "Approve"}
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); setRejectModalChef(c); setRejectReason(""); }} disabled={chefActionLoading === c.id} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#EF4444" }}>
                                    Reject
                                  </button>
                                </>
                              )}
                              {isApproved && trialEnd && (
                                <button onClick={(e) => { e.stopPropagation(); handleExtendTrial(c.id); }} disabled={chefActionLoading === c.id} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90 disabled:opacity-50" style={{ background: "rgba(139,92,246,0.12)", color: "#8B5CF6" }}>
                                  {chefActionLoading === c.id ? "..." : "+3 Months"}
                                </button>
                              )}
                              {isRejected && !isApproved && (
                                <button onClick={(e) => { e.stopPropagation(); handleApproveChef(c.id); }} disabled={chefActionLoading === c.id} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#10B981" }}>
                                  {chefActionLoading === c.id ? "..." : "Approve"}
                                </button>
                              )}
                            </div>
                            {/* Expanded detail */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2.5" onClick={(e) => e.stopPropagation()}>
                                <div className="grid grid-cols-3 gap-2">
                                  {[
                                    { label: "Orders", value: String(c._count.orders), color: "#8B5CF6" },
                                    { label: "Menus", value: String(c._count.menus), color: "#3B82F6" },
                                    { label: "Reviews", value: String(c._count.reviews), color: "#F59E0B" },
                                  ].map((stat, si) => (
                                    <div key={si} className="glass-card rounded-lg p-2 text-center">
                                      <p className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</p>
                                      <p className="text-[9px] text-[var(--text-muted)]">{stat.label}</p>
                                    </div>
                                  ))}
                                </div>
                                <div className="text-xs space-y-1">
                                  <p className="text-[var(--text-muted)]">Phone: <span className="text-[var(--text)]">{c.user.phone || "\u2014"}</span></p>
                                  <p className="text-[var(--text-muted)]">Radius: <span className="text-[var(--text)]">{c.deliveryRadius} miles</span></p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[var(--text-muted)]">Commission:</span>
                                    {editingCommission === c.id ? (
                                      <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <input
                                          type="number"
                                          value={commissionValue}
                                          onChange={(e) => setCommissionValue(e.target.value)}
                                          className="w-12 text-center text-xs font-bold rounded border border-[var(--border)] py-0.5"
                                          style={{ background: "var(--input)", color: "#EF4444" }}
                                          min="0" max="100" autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") handleUpdateCommission(c.id, parseFloat(commissionValue) || 0);
                                            if (e.key === "Escape") { setEditingCommission(null); setCommissionValue(''); }
                                          }}
                                        />
                                        <span style={{ color: "#EF4444" }}>%</span>
                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateCommission(c.id, parseFloat(commissionValue) || 0); }} className="p-0.5 rounded" style={{ background: "rgba(16,185,129,0.15)" }}>
                                          <Check size={10} style={{ color: "#10B981" }} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setEditingCommission(null); setCommissionValue(''); }} className="p-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)" }}>
                                          <X size={10} style={{ color: "#EF4444" }} />
                                        </button>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); setEditingCommission(c.id); setCommissionValue(String(c.commissionRate || 15)); }}>
                                        <span style={{ color: "#EF4444" }} className="font-semibold">{c.commissionRate || 15}%</span>
                                        <Edit3 size={10} className="text-[var(--text-muted)]" />
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[var(--text-muted)]">Registered: <span className="text-[var(--text)]">{new Date(c.user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></p>
                                  <p className="text-[var(--text-muted)]">Status: <span className={c.isOnline ? "text-emerald-500" : "text-gray-400"}>{c.isOnline ? "Online" : "Offline"}</span></p>
                                  {c.description && <p className="text-[var(--text-muted)]">Bio: <span className="text-[var(--text)]">{c.description}</span></p>}
                                  {c.cuisineTypes && <p className="text-[var(--text-muted)]">Cuisine: <span className="text-[var(--text)]">{c.cuisineTypes}</span></p>}
                                </div>
                                {isRejected && c.rejectionReason && (
                                  <div className="rounded-lg p-2.5 border" style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.15)" }}>
                                    <p className="text-[10px] font-medium text-red-500">Rejection Reason</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{c.rejectionReason}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Reject Modal */}
              {rejectModalChef && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                  <div className="glass-card rounded-2xl p-6 w-[440px]">
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
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">New Home Makers who register are automatically set to &quot;Pending&quot; status. You&apos;ll receive an email notification from the Homeal Admin with one-click approve/reject buttons. Approved Home Makers get a 3-month free Unlimited plan. You can extend trials by 3 months at a time.</p>
                </div>
              </div>
            </>
          )}

          {/* Customer Management Page */}
          {activePage === "customers" && (
            <>
              <div className="glass-card rounded-2xl px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <Users size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Customer Management</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />{customers.length} Active</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-gray-400" />0 Inactive</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => { handlePageRefresh(); fetchCustomers(); }} className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "var(--input)" }}>
                  <RefreshCw size={18} className={`text-[var(--text-muted)] transition-transform ${customersLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Total Customers", value: String(customers.length), icon: Users, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Total Orders", value: String(customers.reduce((sum: number, c: any) => sum + (c._count?.orders || 0), 0)), icon: ClipboardList, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Total Spent", value: `£${customers.reduce((sum: number, c: any) => sum + (parseFloat(c.totalSpent) || 0), 0).toFixed(2)}`, icon: PoundSterling, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
                  { label: "Avg Spend", value: customers.length > 0 ? `£${(customers.reduce((sum: number, c: any) => sum + (parseFloat(c.totalSpent) || 0), 0) / customers.length).toFixed(2)}` : "£0.00", icon: TrendingUp, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
                ].map((s, i) => {
                  const SI = s.icon;
                  return (
                    <div key={i} className="glass-card p-4 rounded-2xl">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <SI size={18} style={{ color: s.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
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
              <div className="glass-card rounded-2xl overflow-hidden">
                {customersLoading && customers.length === 0 ? (
                  <div className="text-center py-16">
                    <RefreshCw size={28} className="mx-auto mb-3 animate-spin text-[var(--text-muted)]" />
                    <p className="text-sm text-[var(--text-muted)]">Loading customers...</p>
                  </div>
                ) : customers.length === 0 ? (
                  <>
                    <table className="hidden md:table w-full text-xs">
                      <thead>
                        <tr style={{ background: "var(--input)" }}>
                          <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Customer</th>
                          <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Email</th>
                          <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Phone</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Orders</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Total Spent</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Joined</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={7} className="px-5 py-16 text-center">
                            <div className="text-center py-4 animate-fade-in-up">
                              <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                                <Users size={36} className="text-white" />
                              </div>
                              <h3 className="text-base font-bold text-[var(--text)] mb-1">No customers yet</h3>
                              <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">When customers sign up on homeal.uk they&apos;ll appear here with their order history, location, and nearby chef matches.</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="md:hidden text-center py-16 animate-fade-in-up">
                      <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                        <Users size={36} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-[var(--text)] mb-1">No customers yet</h3>
                      <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">When customers sign up on homeal.uk they&apos;ll appear here with their order history and nearby chef matches.</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Desktop table */}
                    <table className="hidden md:table w-full text-xs">
                      <thead>
                        <tr style={{ background: "var(--input)" }}>
                          <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Customer</th>
                          <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Email</th>
                          <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Phone</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Orders</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Total Spent</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Joined</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer: any) => (
                          <tr key={customer.id} className="border-t border-[var(--border)] hover:bg-[var(--input)] transition">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.12)" }}>
                                  <Users size={14} style={{ color: "#8B5CF6" }} />
                                </div>
                                <span className="font-semibold text-[var(--text)]">{customer.name || "Unknown"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[var(--text-muted)]">{customer.email || "\u2014"}</td>
                            <td className="px-4 py-3 text-[var(--text-muted)]">{customer.phone || "\u2014"}</td>
                            <td className="px-4 py-3 text-center font-semibold text-[var(--text)]">{customer._count?.orders || 0}</td>
                            <td className="px-4 py-3 text-center font-semibold" style={{ color: "#10B981" }}>£{parseFloat(customer.totalSpent || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-center text-[var(--text-muted)]">
                              {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "\u2014"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>Active</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile card view */}
                    <div className="md:hidden divide-y divide-[var(--border)]">
                      {customers.map((customer: any) => (
                        <div key={customer.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.12)" }}>
                                <Users size={14} style={{ color: "#8B5CF6" }} />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[var(--text)]">{customer.name || "Unknown"}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">{customer.email || "\u2014"}</p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>Active</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] mt-2">
                            <span className="text-[var(--text-muted)]">Phone: <span className="text-[var(--text)]">{customer.phone || "\u2014"}</span></span>
                            <span className="text-[var(--text-muted)]">Orders: <span className="font-semibold text-[var(--text)]">{customer._count?.orders || 0}</span></span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] mt-1">
                            <span className="text-[var(--text-muted)]">Spent: <span className="font-semibold" style={{ color: "#10B981" }}>£{parseFloat(customer.totalSpent || 0).toFixed(2)}</span></span>
                            <span className="text-[var(--text-muted)]">Joined: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "\u2014"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* All Orders Page */}
          {activePage === "orders" && (() => {
            const STATUS_COLORS: Record<string, string> = {
              PLACED: "#3B82F6", ACCEPTED: "#6366F1", PREPARING: "#F59E0B", READY: "#10B981",
              OUT_FOR_DELIVERY: "#8B5CF6", DELIVERED: "#059669", CANCELLED: "#EF4444", REJECTED: "#EF4444",
            };
            const filteredOrders = platformOrders.filter((o) => {
              if (orderFilter === "All") return true;
              if (orderFilter === "Placed") return o.status === "PLACED";
              if (orderFilter === "Accepted") return o.status === "ACCEPTED";
              if (orderFilter === "Preparing") return o.status === "PREPARING";
              if (orderFilter === "Ready") return o.status === "READY";
              if (orderFilter === "Delivered") return o.status === "DELIVERED";
              if (orderFilter === "Cancelled") return o.status === "CANCELLED" || o.status === "REJECTED";
              return true;
            });
            const completedCount = platformOrders.filter((o) => o.status === "DELIVERED").length;
            const cancelledCount = platformOrders.filter((o) => o.status === "CANCELLED" || o.status === "REJECTED").length;
            const totalRevenue = platformOrders.reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0);
            const formatOrderTime = (dateStr: string) => {
              const diff = Date.now() - new Date(dateStr).getTime();
              const mins = Math.floor(diff / 60000);
              if (mins < 1) return "just now";
              if (mins < 60) return `${mins}m ago`;
              const hrs = Math.floor(mins / 60);
              if (hrs < 24) return `${hrs}h ago`;
              const days = Math.floor(hrs / 24);
              if (days < 7) return `${days}d ago`;
              return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
            };
            return (
            <>
              <div className="glass-card rounded-2xl px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <ClipboardList size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">All Orders</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />{completedCount} Completed</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-red-400" />{cancelledCount} Cancelled</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => { handlePageRefresh(); fetchPlatformOrders(); }} className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "var(--input)" }}>
                  <RefreshCw size={18} className={`text-[var(--text-muted)] transition-transform ${refreshingPage || orderLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Order Filters */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:overflow-x-visible mb-6">
                {["All", "Placed", "Accepted", "Preparing", "Ready", "Delivered", "Cancelled"].map((tab) => {
                  const isActive = orderFilter === tab;
                  return (
                    <button key={tab} onClick={() => setOrderFilter(tab)} className="whitespace-nowrap shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all" style={{
                      background: isActive ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "var(--header-bg)",
                      color: isActive ? "#FFFFFF" : "var(--text-muted)",
                      border: isActive ? "none" : "1px solid var(--border)",
                    }}>
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Order Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Total Orders", value: String(platformOrders.length), icon: ClipboardList, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Active Orders", value: String(platformOrders.filter((o) => ["PLACED","ACCEPTED","PREPARING","READY","OUT_FOR_DELIVERY"].includes(o.status)).length), icon: Truck, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
                  { label: "Completed", value: String(completedCount), icon: Package, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Total Revenue", value: `£${totalRevenue.toFixed(2)}`, icon: PoundSterling, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
                ].map((s, i) => {
                  const SI = s.icon;
                  return (
                    <div key={i} className="glass-card p-4 rounded-2xl">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <SI size={18} style={{ color: s.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Orders Table */}
              <div className="glass-card rounded-2xl overflow-hidden">
                {orderLoading && platformOrders.length === 0 ? (
                  <div className="text-center py-16 animate-fade-in-up">
                    <RefreshCw size={28} className="mx-auto mb-3 animate-spin text-[var(--text-muted)]" />
                    <p className="text-sm text-[var(--text-muted)]">Loading orders...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <>
                    <div className="hidden md:block">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ background: "var(--input)" }}>
                            <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Order ID</th>
                            <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Home Maker</th>
                            <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Customer</th>
                            <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Items</th>
                            <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Total</th>
                            <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                            <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={7} className="px-5 py-16 text-center">
                              <div className="text-center py-4 animate-fade-in-up">
                                <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                                  <ClipboardList size={36} className="text-white" />
                                </div>
                                <h3 className="text-base font-bold text-[var(--text)] mb-1">{orderFilter === "All" ? "No orders yet" : `No ${orderFilter.toLowerCase()} orders`}</h3>
                                <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">{orderFilter === "All" ? "Orders placed by customers will appear here once chefs start receiving orders through the platform." : `There are no orders with ${orderFilter.toLowerCase()} status.`}</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="md:hidden text-center py-16 animate-fade-in-up">
                      <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                        <ClipboardList size={36} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-[var(--text)] mb-1">{orderFilter === "All" ? "No orders yet" : `No ${orderFilter.toLowerCase()} orders`}</h3>
                      <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">{orderFilter === "All" ? "Orders will appear here once chefs start receiving orders." : `There are no orders with ${orderFilter.toLowerCase()} status.`}</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Desktop table */}
                    <table className="hidden md:table w-full text-xs">
                      <thead>
                        <tr style={{ background: "var(--input)" }}>
                          <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Order ID</th>
                          <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Home Maker</th>
                          <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Customer</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Items</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Total</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order: any) => {
                          const statusColor = STATUS_COLORS[order.status] || "#6B7280";
                          return (
                            <tr key={order.id} className="border-t border-[var(--border)] hover:bg-[var(--input)] transition">
                              <td className="px-5 py-3">
                                <span className="font-mono font-semibold text-[var(--text)]">#{order.id.slice(0, 8)}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.12)" }}>
                                    <ChefHat size={13} style={{ color: "#F59E0B" }} />
                                  </div>
                                  <span className="text-[var(--text)] truncate">{order.chef?.kitchenName || "Unknown"}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-[var(--text)] truncate">{order.user?.name || "Unknown"}</span>
                              </td>
                              <td className="px-4 py-3 text-center text-[var(--text-muted)]">{order.items?.length || 0}</td>
                              <td className="px-4 py-3 text-center font-semibold text-[var(--text)]">£{parseFloat(order.total || 0).toFixed(2)}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ color: statusColor, background: `${statusColor}15` }}>
                                  {order.status.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center text-[var(--text-muted)]">{formatOrderTime(order.createdAt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Mobile card view */}
                    <div className="md:hidden divide-y divide-[var(--border)]">
                      {filteredOrders.map((order: any) => {
                        const statusColor = STATUS_COLORS[order.status] || "#6B7280";
                        return (
                          <div key={order.id} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-xs font-semibold text-[var(--text)]">#{order.id.slice(0, 8)}</span>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ color: statusColor, background: `${statusColor}15` }}>
                                {order.status.replace(/_/g, " ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.12)" }}>
                                <ChefHat size={11} style={{ color: "#F59E0B" }} />
                              </div>
                              <span className="text-xs text-[var(--text)] truncate">{order.chef?.kitchenName || "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.12)" }}>
                                <Users size={11} style={{ color: "#8B5CF6" }} />
                              </div>
                              <span className="text-xs text-[var(--text)] truncate">{order.user?.name || "Unknown"}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[var(--text-muted)]">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</span>
                              <span className="font-semibold text-[var(--text)]">£{parseFloat(order.total || 0).toFixed(2)}</span>
                              <span className="text-[var(--text-muted)]">{formatOrderTime(order.createdAt)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </>
            );
          })()}

          {/* Promo Codes Page */}
          {activePage === "promos" && (
            <>
              <div className="glass-card rounded-2xl px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <Tag size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Promo Codes</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />{promoStats.active || 0} Active</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-red-400" />{promoStats.expired || 0} Expired</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => fetchPromos()} className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "var(--input)" }}>
                    <RefreshCw size={18} className={`text-[var(--text-muted)] ${promosLoading ? "animate-spin" : ""}`} />
                  </button>
                  <button onClick={() => { setEditingPromo(null); setPromoForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', maxDiscount: '', usageLimit: '', validFrom: '', validUntil: '' }); setShowPromoModal(true); }} className="btn-premium px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition hover:opacity-90">
                    <PlusCircle size={16} /> Create Promo
                  </button>
                </div>
              </div>

              {/* Promo Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Active Promos", value: String(promoStats.active || 0), icon: Tag, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Total Redemptions", value: String(promoStats.totalRedemptions || 0), icon: Check, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Discount Given", value: `£${(promoStats.totalDiscount || 0).toFixed(2)}`, icon: PoundSterling, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
                ].map((s, i) => {
                  const SI = s.icon;
                  return (
                    <div key={i} className="glass-card p-4 rounded-2xl">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <SI size={18} style={{ color: s.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Table */}
              <div className="glass-card rounded-2xl overflow-hidden">
                {promosLoading && promos.length === 0 ? (
                  <div className="text-center py-16">
                    <RefreshCw size={28} className="mx-auto mb-3 animate-spin text-[var(--text-muted)]" />
                    <p className="text-sm text-[var(--text-muted)]">Loading promos...</p>
                  </div>
                ) : promos.length === 0 ? (
                  <>
                    <table className="hidden md:table w-full text-xs">
                      <thead>
                        <tr style={{ background: "var(--input)" }}>
                          <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Code</th>
                          <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Description</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Discount</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Uses</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Expiry</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={7} className="px-5 py-16 text-center">
                            <div className="text-center py-4 animate-fade-in-up">
                              <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                                <Tag size={36} className="text-white" />
                              </div>
                              <h3 className="text-base font-bold text-[var(--text)] mb-1">No promo codes yet</h3>
                              <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Create promotional codes to offer discounts. Customers can apply these at checkout for percentage or fixed-amount savings.</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="md:hidden text-center py-16 animate-fade-in-up">
                      <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                        <Tag size={36} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-[var(--text)] mb-1">No promo codes yet</h3>
                      <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Create promotional codes to offer discounts. Customers can apply these at checkout.</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Desktop table */}
                    <table className="hidden md:table w-full text-xs">
                      <thead>
                        <tr style={{ background: "var(--input)" }}>
                          <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Code</th>
                          <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Description</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Discount</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Uses</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Expiry</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                          <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {promos.map((promo: any) => {
                          const isExpired = promo.validUntil && new Date(promo.validUntil) < new Date();
                          const isActive = promo.isActive !== false && !isExpired;
                          return (
                            <tr key={promo.id} className="border-t border-[var(--border)] hover:bg-[var(--input)] transition">
                              <td className="px-5 py-3">
                                <span className="font-mono font-bold text-[var(--text)] px-2 py-0.5 rounded-lg" style={{ background: "rgba(139,92,246,0.08)" }}>{promo.code}</span>
                              </td>
                              <td className="px-4 py-3 text-[var(--text-muted)] max-w-[200px] truncate">{promo.description || "\u2014"}</td>
                              <td className="px-4 py-3 text-center font-semibold" style={{ color: "#8B5CF6" }}>
                                {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : `£${parseFloat(promo.discountValue || 0).toFixed(2)}`}
                              </td>
                              <td className="px-4 py-3 text-center text-[var(--text-muted)]">
                                {promo.usedCount || 0}{promo.usageLimit ? `/${promo.usageLimit}` : ""}
                              </td>
                              <td className="px-4 py-3 text-center text-[var(--text-muted)]">
                                {promo.validUntil ? new Date(promo.validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "No expiry"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{
                                  background: isActive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                                  color: isActive ? "#10B981" : "#EF4444",
                                }}>
                                  {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingPromo(promo);
                                      setPromoForm({
                                        code: promo.code || '',
                                        description: promo.description || '',
                                        discountType: promo.discountType || 'PERCENTAGE',
                                        discountValue: String(promo.discountValue || ''),
                                        minOrderValue: String(promo.minOrderValue || ''),
                                        maxDiscount: String(promo.maxDiscount || ''),
                                        usageLimit: String(promo.usageLimit || ''),
                                        validFrom: promo.validFrom ? promo.validFrom.slice(0, 10) : '',
                                        validUntil: promo.validUntil ? promo.validUntil.slice(0, 10) : '',
                                      });
                                      setShowPromoModal(true);
                                    }}
                                    className="p-1.5 rounded-lg transition hover:opacity-80"
                                    style={{ background: "rgba(59,130,246,0.1)" }}
                                    title="Edit"
                                  >
                                    <Edit3 size={12} style={{ color: "#3B82F6" }} />
                                  </button>
                                  <button
                                    onClick={() => handleUpdatePromo(promo.id, { isActive: !promo.isActive })}
                                    className="p-1.5 rounded-lg transition hover:opacity-80"
                                    style={{ background: promo.isActive !== false ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)" }}
                                    title={promo.isActive !== false ? "Deactivate" : "Activate"}
                                  >
                                    <Eye size={12} style={{ color: promo.isActive !== false ? "#F59E0B" : "#10B981" }} />
                                  </button>
                                  <button
                                    onClick={() => { if (confirm(`Delete promo "${promo.code}"?`)) handleDeletePromo(promo.id); }}
                                    className="p-1.5 rounded-lg transition hover:opacity-80"
                                    style={{ background: "rgba(239,68,68,0.1)" }}
                                    title="Delete"
                                  >
                                    <X size={12} style={{ color: "#EF4444" }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Mobile card view */}
                    <div className="md:hidden divide-y divide-[var(--border)]">
                      {promos.map((promo: any) => {
                        const isExpired = promo.validUntil && new Date(promo.validUntil) < new Date();
                        const isActive = promo.isActive !== false && !isExpired;
                        return (
                          <div key={promo.id} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-xs font-bold text-[var(--text)] px-2 py-0.5 rounded-lg" style={{ background: "rgba(139,92,246,0.08)" }}>{promo.code}</span>
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold" style={{
                                background: isActive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                                color: isActive ? "#10B981" : "#EF4444",
                              }}>
                                {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                              </span>
                            </div>
                            {promo.description && <p className="text-[11px] text-[var(--text-muted)] mb-2 truncate">{promo.description}</p>}
                            <div className="flex items-center justify-between text-[11px] mb-2">
                              <span className="text-[var(--text-muted)]">Discount: <span className="font-semibold" style={{ color: "#8B5CF6" }}>{promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : `£${parseFloat(promo.discountValue || 0).toFixed(2)}`}</span></span>
                              <span className="text-[var(--text-muted)]">Uses: <span className="font-semibold text-[var(--text)]">{promo.usedCount || 0}{promo.usageLimit ? `/${promo.usageLimit}` : ""}</span></span>
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] mb-2">
                              Expires: {promo.validUntil ? new Date(promo.validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "No expiry"}
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingPromo(promo);
                                  setPromoForm({
                                    code: promo.code || '',
                                    description: promo.description || '',
                                    discountType: promo.discountType || 'PERCENTAGE',
                                    discountValue: String(promo.discountValue || ''),
                                    minOrderValue: String(promo.minOrderValue || ''),
                                    maxDiscount: String(promo.maxDiscount || ''),
                                    usageLimit: String(promo.usageLimit || ''),
                                    validFrom: promo.validFrom ? promo.validFrom.slice(0, 10) : '',
                                    validUntil: promo.validUntil ? promo.validUntil.slice(0, 10) : '',
                                  });
                                  setShowPromoModal(true);
                                }}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition hover:opacity-80"
                                style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleUpdatePromo(promo.id, { isActive: !promo.isActive })}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition hover:opacity-80"
                                style={{ background: promo.isActive !== false ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", color: promo.isActive !== false ? "#F59E0B" : "#10B981" }}
                              >
                                {promo.isActive !== false ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => { if (confirm(`Delete promo "${promo.code}"?`)) handleDeletePromo(promo.id); }}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition hover:opacity-80"
                                style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Promo Modal */}
              {showPromoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
                  <div className="glass-card rounded-2xl p-6 w-[520px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
                    <h3 className="text-base font-semibold text-[var(--text)] mb-1">{editingPromo ? "Edit Promo Code" : "Create Promo Code"}</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-4">{editingPromo ? "Update the promo details below" : "Create a new promotional code for customers"}</p>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Promo Code</label>
                          <input
                            type="text"
                            value={promoForm.code}
                            onChange={(e) => setPromoForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            placeholder="e.g. WELCOME10"
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-mono"
                            style={{ background: "var(--input)", color: "var(--text)" }}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Discount Type</label>
                          <select
                            value={promoForm.discountType}
                            onChange={(e) => setPromoForm(prev => ({ ...prev, discountType: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                            style={{ background: "var(--input)", color: "var(--text)" }}
                          >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount (£)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Description</label>
                        <input
                          type="text"
                          value={promoForm.description}
                          onChange={(e) => setPromoForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="e.g. 10% off your first order"
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                          style={{ background: "var(--input)", color: "var(--text)" }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Discount Value</label>
                          <input
                            type="number"
                            value={promoForm.discountValue}
                            onChange={(e) => setPromoForm(prev => ({ ...prev, discountValue: e.target.value }))}
                            placeholder={promoForm.discountType === "PERCENTAGE" ? "10" : "5.00"}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                            style={{ background: "var(--input)", color: "var(--text)" }}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Min Order (£)</label>
                          <input
                            type="number"
                            value={promoForm.minOrderValue}
                            onChange={(e) => setPromoForm(prev => ({ ...prev, minOrderValue: e.target.value }))}
                            placeholder="0"
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                            style={{ background: "var(--input)", color: "var(--text)" }}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Max Discount (£)</label>
                          <input
                            type="number"
                            value={promoForm.maxDiscount}
                            onChange={(e) => setPromoForm(prev => ({ ...prev, maxDiscount: e.target.value }))}
                            placeholder="No limit"
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                            style={{ background: "var(--input)", color: "var(--text)" }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Usage Limit</label>
                          <input
                            type="number"
                            value={promoForm.usageLimit}
                            onChange={(e) => setPromoForm(prev => ({ ...prev, usageLimit: e.target.value }))}
                            placeholder="Unlimited"
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                            style={{ background: "var(--input)", color: "var(--text)" }}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Valid From</label>
                          <input
                            type="date"
                            value={promoForm.validFrom}
                            onChange={(e) => setPromoForm(prev => ({ ...prev, validFrom: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                            style={{ background: "var(--input)", color: "var(--text)" }}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Valid Until</label>
                          <input
                            type="date"
                            value={promoForm.validUntil}
                            onChange={(e) => setPromoForm(prev => ({ ...prev, validUntil: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                            style={{ background: "var(--input)", color: "var(--text)" }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5 justify-end">
                      <button
                        onClick={() => { setShowPromoModal(false); setEditingPromo(null); setPromoForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', maxDiscount: '', usageLimit: '', validFrom: '', validUntil: '' }); }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (editingPromo) {
                            const updates: any = {
                              description: promoForm.description,
                              discountType: promoForm.discountType,
                              discountValue: parseFloat(promoForm.discountValue) || 0,
                            };
                            if (promoForm.minOrderValue) updates.minOrderValue = parseFloat(promoForm.minOrderValue);
                            if (promoForm.maxDiscount) updates.maxDiscount = parseFloat(promoForm.maxDiscount);
                            if (promoForm.usageLimit) updates.usageLimit = parseInt(promoForm.usageLimit);
                            if (promoForm.validFrom) updates.validFrom = promoForm.validFrom;
                            if (promoForm.validUntil) updates.validUntil = promoForm.validUntil;
                            handleUpdatePromo(editingPromo.id, updates);
                          } else {
                            handleCreatePromo();
                          }
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white btn-premium"
                      >
                        {editingPromo ? "Save Changes" : "Create Promo"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Categories Page */}
          {activePage === "categories" && (
            <>
              <div className="glass-card rounded-2xl px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <FolderOpen size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Categories</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />{adminCategories.filter(c => c.isActive !== false).length} Listed</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-gray-400" />{adminCategories.filter(c => c.isActive === false).length} Hidden</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full" style={{ background: "#10B981" }} />{adminCategories.filter(c => c.type === 'FOOD').length} Food</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full" style={{ background: "#3B82F6" }} />{adminCategories.filter(c => c.type === 'PRODUCT').length} Product</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => fetchCategories()} className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "var(--input)" }}>
                    <RefreshCw size={18} className={`text-[var(--text-muted)] ${categoriesLoading ? "animate-spin" : ""}`} />
                  </button>
                  <button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', icon: '', sortOrder: 0, type: 'FOOD' }); setShowCategoryModal(true); }} className="btn-premium px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition hover:opacity-90">
                    <PlusCircle size={16} /> Add Category
                  </button>
                </div>
              </div>

              {/* Categories Grid */}
              {categoriesLoading && adminCategories.length === 0 ? (
                <div className="glass-card rounded-2xl p-16 text-center mb-6">
                  <RefreshCw size={28} className="mx-auto mb-3 animate-spin text-[var(--text-muted)]" />
                  <p className="text-sm text-[var(--text-muted)]">Loading categories...</p>
                </div>
              ) : adminCategories.length === 0 ? (
                <div className="glass-card rounded-2xl p-6 mb-6">
                  <div className="text-center py-16 animate-fade-in-up">
                    <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                      <FolderOpen size={36} className="text-white" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text)] mb-1">No categories yet</h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Add food or product categories so chefs can classify their dishes and products, and customers can browse easily.</p>
                    <button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', icon: '', sortOrder: 0, type: 'FOOD' }); setShowCategoryModal(true); }} className="mt-4 btn-premium px-5 py-2.5 rounded-xl text-white text-sm font-medium inline-flex items-center gap-2 transition hover:opacity-90">
                      <PlusCircle size={16} /> Add First Category
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {adminCategories.map((cat) => {
                    const isActive = cat.isActive !== false;
                    return (
                      <div key={cat.id} className="glass-card rounded-2xl p-4 text-center transition-all hover:scale-[1.02] duration-300 hover:shadow-xl" style={{ opacity: isActive ? 1 : 0.6 }}>
                        <div className="text-3xl mb-2">{cat.icon || "📁"}</div>
                        <h4 className="text-sm font-bold text-[var(--text)]">{cat.name}</h4>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">{cat._count?.items || 0} items</p>
                        <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{
                            color: cat.type === 'PRODUCT' ? "#3B82F6" : "#10B981",
                            background: cat.type === 'PRODUCT' ? "rgba(59,130,246,0.1)" : "rgba(16,185,129,0.1)",
                          }}>
                            {cat.type === 'PRODUCT' ? "Product" : "Food"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{
                            color: isActive ? "#10B981" : "#6B7280",
                            background: isActive ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)",
                          }}>
                            {isActive ? "Active" : "Hidden"}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name, icon: cat.icon || '', sortOrder: cat.sortOrder || 0, type: cat.type || 'FOOD' }); setShowCategoryModal(true); }}
                            className="p-1.5 rounded-lg transition hover:opacity-80"
                            style={{ background: "rgba(59,130,246,0.1)" }}
                            title="Edit"
                          >
                            <Edit3 size={12} style={{ color: "#3B82F6" }} />
                          </button>
                          <button
                            onClick={() => handleUpdateCategory(cat.id, { isActive: !isActive })}
                            className="p-1.5 rounded-lg transition hover:opacity-80"
                            style={{ background: isActive ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)" }}
                            title={isActive ? "Deactivate" : "Activate"}
                          >
                            {isActive ? <Eye size={12} style={{ color: "#F59E0B" }} /> : <Eye size={12} style={{ color: "#10B981" }} />}
                          </button>
                          <button
                            onClick={() => { if (confirm(`Delete category "${cat.name}"?`)) handleDeleteCategory(cat.id); }}
                            className="p-1.5 rounded-lg transition hover:opacity-80"
                            style={{ background: "rgba(239,68,68,0.1)" }}
                            title="Delete"
                          >
                            <X size={12} style={{ color: "#EF4444" }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="rounded-2xl border px-5 py-4 flex items-center gap-3" style={{ background: "rgba(59,130,246,0.06)", borderColor: "rgba(59,130,246,0.2)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                  <FolderOpen size={20} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">Categories help customers discover chefs and products</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Food categories are assigned to dishes, product categories to homemade items like pickles, papads, and sweets. Customers browse by category to find what they want.</p>
                </div>
              </div>

              {/* Category Modal */}
              {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
                  <div className="glass-card rounded-2xl p-6 w-[440px] max-w-[95vw]">
                    <h3 className="text-base font-semibold text-[var(--text)] mb-1">{editingCategory ? "Edit Category" : "Add Category"}</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-4">{editingCategory ? "Update the category details below" : "Create a new category for the platform"}</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Category Type</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCategoryForm(prev => ({ ...prev, type: 'FOOD' }))}
                            className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"
                            style={{
                              background: categoryForm.type === 'FOOD' ? "rgba(16,185,129,0.12)" : "var(--input)",
                              borderColor: categoryForm.type === 'FOOD' ? "#10B981" : "var(--border)",
                              color: categoryForm.type === 'FOOD' ? "#10B981" : "var(--text-muted)",
                            }}
                          >
                            Food
                          </button>
                          <button
                            type="button"
                            onClick={() => setCategoryForm(prev => ({ ...prev, type: 'PRODUCT' }))}
                            className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"
                            style={{
                              background: categoryForm.type === 'PRODUCT' ? "rgba(59,130,246,0.12)" : "var(--input)",
                              borderColor: categoryForm.type === 'PRODUCT' ? "#3B82F6" : "var(--border)",
                              color: categoryForm.type === 'PRODUCT' ? "#3B82F6" : "var(--text-muted)",
                            }}
                          >
                            Product
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Category Name</label>
                        <input
                          type="text"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={categoryForm.type === 'FOOD' ? "e.g. South Indian" : "e.g. Pickles"}
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                          style={{ background: "var(--input)", color: "var(--text)" }}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Icon (emoji)</label>
                        <input
                          type="text"
                          value={categoryForm.icon}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                          placeholder={categoryForm.type === 'FOOD' ? "e.g. 🍛" : "e.g. 🫙"}
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                          style={{ background: "var(--input)", color: "var(--text)" }}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-[var(--text-muted)] mb-1 block">Sort Order</label>
                        <input
                          type="number"
                          value={categoryForm.sortOrder}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                          style={{ background: "var(--input)", color: "var(--text)" }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5 justify-end">
                      <button
                        onClick={() => { setShowCategoryModal(false); setEditingCategory(null); setCategoryForm({ name: '', icon: '', sortOrder: 0, type: 'FOOD' }); }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => editingCategory ? handleUpdateCategory(editingCategory.id, categoryForm) : handleCreateCategory()}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white btn-premium"
                      >
                        {editingCategory ? "Save Changes" : "Create Category"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Analytics Page */}
          {activePage === "analytics" && (
            <>
              <div className="glass-card rounded-2xl px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <BarChart3 size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Platform Analytics</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Platform-wide performance metrics</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:overflow-x-visible">
                  {["7D", "30D", "90D", "1Y"].map((p, i) => (
                    <button key={p} className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition" style={{
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
                    <div key={i} className="glass-card p-4 rounded-2xl transition-all hover:scale-[1.02] duration-300 hover:shadow-xl">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                          <SI size={18} style={{ color: s.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Chart Placeholders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div className="glass-card rounded-2xl p-5">
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
                <div className="glass-card rounded-2xl p-5">
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
              <div className="glass-card rounded-2xl p-5">
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
          {activePage === "revenue" && (() => {
            const today = revenueStats?.today || { revenue: 0, platformFee: 0, chefPayout: 0, orders: 0 };
            const week = revenueStats?.week || { revenue: 0, platformFee: 0, chefPayout: 0, orders: 0 };
            const month = revenueStats?.month || { revenue: 0, platformFee: 0, chefPayout: 0, orders: 0 };
            const total = revenueStats?.total || { revenue: 0, platformFee: 0, chefPayout: 0, orders: 0 };
            const transactions = revenueStats?.transactions || [];
            return (
            <>
              <div className="glass-card rounded-2xl px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <PoundSterling size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Revenue</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />£{(total.revenue || 0).toFixed(2)} Total</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-amber-500" />£{(today.revenue || 0).toFixed(2)} Today</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => fetchRevenueStats()} className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "var(--input)" }}>
                    <RefreshCw size={18} className={`text-[var(--text-muted)] ${revenueLoading ? "animate-spin" : ""}`} />
                  </button>
                  <button className="px-4 py-2 rounded-xl text-xs font-medium transition hover:opacity-80 flex items-center gap-2" style={{ background: "var(--input)", color: "var(--text)" }}>
                    <Download size={14} /> Export
                  </button>
                </div>
              </div>

              {revenueLoading && !revenueStats ? (
                <div className="glass-card rounded-2xl p-16 text-center mb-6">
                  <RefreshCw size={28} className="mx-auto mb-3 animate-spin text-[var(--text-muted)]" />
                  <p className="text-sm text-[var(--text-muted)]">Loading revenue data...</p>
                </div>
              ) : (
                <>
                  {/* Revenue Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    {[
                      { label: "Today's Revenue", value: `£${(today.revenue || 0).toFixed(2)}`, sub: `${today.orders || 0} orders`, icon: PoundSterling, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                      { label: "Platform Fee (Today)", value: `£${(today.platformFee || 0).toFixed(2)}`, sub: "Commission earned", icon: Wallet, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                      { label: "Home Maker Payouts (Today)", value: `£${(today.chefPayout || 0).toFixed(2)}`, sub: "Home Maker earnings", icon: TrendingUp, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
                      { label: "Total Revenue", value: `£${(total.revenue || 0).toFixed(2)}`, sub: `${total.orders || 0} total orders`, icon: Crown, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
                    ].map((s, i) => {
                      const SI = s.icon;
                      return (
                        <div key={i} className="glass-card p-4 rounded-2xl transition-all hover:scale-[1.02] duration-300 hover:shadow-xl">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-medium text-[var(--text-muted)]">{s.label}</span>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                              <SI size={18} style={{ color: s.color }} />
                            </div>
                          </div>
                          <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                          <div className="text-[10px] text-[var(--text-muted)] mt-1">{s.sub}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Revenue Period Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "This Week", revenue: week.revenue || 0, fee: week.platformFee || 0, payout: week.chefPayout || 0, orders: week.orders || 0, color: "#3B82F6" },
                      { label: "This Month", revenue: month.revenue || 0, fee: month.platformFee || 0, payout: month.chefPayout || 0, orders: month.orders || 0, color: "#8B5CF6" },
                      { label: "All Time", revenue: total.revenue || 0, fee: total.platformFee || 0, payout: total.chefPayout || 0, orders: total.orders || 0, color: "#10B981" },
                    ].map((period, i) => (
                      <div key={i} className="glass-card rounded-2xl p-4">
                        <h4 className="text-xs font-semibold text-[var(--text)] mb-3">{period.label}</h4>
                        <p className="text-xl font-bold mb-2" style={{ color: period.color }}>£{period.revenue.toFixed(2)}</p>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between"><span className="text-[var(--text-muted)]">Platform Fee</span><span className="font-semibold" style={{ color: "#10B981" }}>£{period.fee.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-[var(--text-muted)]">Home Maker Payouts</span><span className="font-semibold" style={{ color: "#3B82F6" }}>£{period.payout.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-[var(--text-muted)]">Orders</span><span className="font-semibold text-[var(--text)]">{period.orders}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Revenue Table */}
                  <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-[var(--border)]">
                      <h3 className="text-sm font-semibold text-[var(--text)]">Recent Transactions</h3>
                    </div>
                    {transactions.length === 0 ? (
                      <>
                        <table className="hidden md:table w-full text-xs">
                          <thead>
                            <tr style={{ background: "var(--input)" }}>
                              <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Order</th>
                              <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Home Maker</th>
                              <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Amount</th>
                              <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Platform Fee</th>
                              <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Home Maker Payout</th>
                              <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td colSpan={6} className="px-5 py-16 text-center">
                                <div className="text-center py-4 animate-fade-in-up">
                                  <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                                    <PoundSterling size={36} className="text-white" />
                                  </div>
                                  <h3 className="text-base font-bold text-[var(--text)] mb-1">No transactions yet</h3>
                                  <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Revenue data will appear once orders start flowing</p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <div className="md:hidden text-center py-16 animate-fade-in-up">
                          <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                            <PoundSterling size={36} className="text-white" />
                          </div>
                          <h3 className="text-base font-bold text-[var(--text)] mb-1">No transactions yet</h3>
                          <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Revenue data will appear once orders start flowing</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <table className="hidden md:table w-full text-xs">
                          <thead>
                            <tr style={{ background: "var(--input)" }}>
                              <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Order</th>
                              <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Home Maker</th>
                              <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Amount</th>
                              <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Platform Fee</th>
                              <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Home Maker Payout</th>
                              <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((tx: any, idx: number) => (
                              <tr key={tx.id || idx} className="border-t border-[var(--border)] hover:bg-[var(--input)] transition">
                                <td className="px-5 py-3">
                                  <span className="font-mono font-semibold text-[var(--text)]">#{(tx.orderId || tx.id || '').slice(0, 8)}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-[var(--text)]">{tx.chefName || tx.chef?.kitchenName || "Unknown"}</span>
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-[var(--text)]">£{parseFloat(tx.amount || tx.total || 0).toFixed(2)}</td>
                                <td className="px-4 py-3 text-center font-semibold" style={{ color: "#10B981" }}>£{parseFloat(tx.platformFee || tx.commission || 0).toFixed(2)}</td>
                                <td className="px-4 py-3 text-center font-semibold" style={{ color: "#3B82F6" }}>£{parseFloat(tx.chefPayout || 0).toFixed(2)}</td>
                                <td className="px-4 py-3 text-center text-[var(--text-muted)]">
                                  {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "\u2014"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="md:hidden divide-y divide-[var(--border)]">
                          {transactions.map((tx: any, idx: number) => (
                            <div key={tx.id || idx} className="p-4">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-mono text-xs font-semibold text-[var(--text)]">#{(tx.orderId || tx.id || '').slice(0, 8)}</span>
                                <span className="text-xs font-semibold text-[var(--text)]">£{parseFloat(tx.amount || tx.total || 0).toFixed(2)}</span>
                              </div>
                              <p className="text-[11px] text-[var(--text-muted)]">{tx.chefName || tx.chef?.kitchenName || "Unknown"}</p>
                              <div className="flex items-center justify-between text-[11px] mt-1.5">
                                <span className="text-[var(--text-muted)]">Fee: <span style={{ color: "#10B981" }}>£{parseFloat(tx.platformFee || tx.commission || 0).toFixed(2)}</span></span>
                                <span className="text-[var(--text-muted)]">Payout: <span style={{ color: "#3B82F6" }}>£{parseFloat(tx.chefPayout || 0).toFixed(2)}</span></span>
                                <span className="text-[var(--text-muted)]">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
            );
          })()}

          {/* Reports Page */}
          {activePage === "reports" && (
            <>
              <div className="glass-card rounded-2xl px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
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
                <button className="btn-premium px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition hover:opacity-90">
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
                    <div key={i} className="glass-card rounded-2xl p-5 flex items-start gap-4 transition-all hover:scale-[1.01] duration-300 hover:shadow-xl">
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
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--border)]">
                  <h3 className="text-sm font-semibold text-[var(--text)]">Generated Reports</h3>
                </div>
                <table className="hidden md:table w-full text-xs">
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
                      <td colSpan={5} className="px-5 py-16 text-center">
                        <div className="text-center py-4 animate-fade-in-up">
                          <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                            <FileText size={36} className="text-white" />
                          </div>
                          <h3 className="text-base font-bold text-[var(--text)] mb-1">No reports generated yet</h3>
                          <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Use the report templates above to generate platform reports</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* Mobile card view */}
                <div className="md:hidden">
                  <div className="text-center py-16 animate-fade-in-up">
                    <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                      <FileText size={36} className="text-white" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text)] mb-1">No reports generated yet</h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Use the report templates above to generate platform reports</p>
                  </div>
                </div>
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
                  className="glass-card rounded-2xl px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient"
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
                        className="btn-premium px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition hover:opacity-90"
                      >
                        <PlusCircle size={16} />
                        <span>{meta.cta}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-[var(--text)] mb-4">{PAGE_TITLES[activePage]}</h2>
                  <div className="text-center py-16 animate-fade-in-up">
                    <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                      <PageIcon size={36} className="text-white" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text)] mb-1">Coming soon</h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">This section is under development</p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)]" style={{ background: "var(--header-bg)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-around px-2 pt-2">
          {[
            { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
            { icon: ChefHat, label: "Chefs", id: "chefs" },
            { icon: ClipboardList, label: "Orders", id: "orders" },
            { icon: Settings, label: "Settings", id: "settings" },
          ].map((item) => {
            const NavIcon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isActive ? "badge-gradient" : ""}`} style={!isActive ? { background: "transparent" } : undefined}>
                  <NavIcon size={18} className={isActive ? "text-white" : "text-[var(--text-muted)]"} />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? "gradient-text" : "text-[var(--text-muted)]"}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
