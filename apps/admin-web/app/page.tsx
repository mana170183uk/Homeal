"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import imageCompression from "browser-image-compression";
import { authFetch } from "./lib/api";
import PostcodeLookup from "./components/PostcodeLookup";
import {
  LayoutDashboard, ClipboardList, Package, Bell, UtensilsCrossed,
  PlusCircle, PoundSterling, Star, BarChart3, Sun, Moon, Settings,
  RefreshCw, Phone, Mail, TrendingUp, TrendingDown, Clock, Users,
  AlertCircle, Wallet, ShoppingBag, ChefHat, Check, Crown, Zap,
  Infinity, Store, Leaf, Award, ShieldCheck, MapPin, Calendar,
  Repeat, Truck, Gift, Sparkles, Heart, Box, Timer, Grip, Cake,
  Navigation, Eye, Menu, X, Trash2, Pencil, Power, Save, MessageSquare, Send,
  ExternalLink, CreditCard, Upload, Image, LogOut, User,
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
    { icon: Calendar, label: "Menu Scheduler", id: "scheduler" },
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
  "scheduler": "Menu Scheduler",
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
  "scheduler": { green: "This Week", red: "Next Week" },
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

const ADMIN_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3203";

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

  // Menu & dish state
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [chefMenuId, setChefMenuId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dishForm, setDishForm] = useState({ name: '', categoryId: '', description: '', isVeg: true, price: '', prepTime: '', servingSize: '', allergens: '', stockCount: '', offerPrice: '', image: '', eggOption: '' });
  const [showSuggestCategory, setShowSuggestCategory] = useState(false);
  const [suggestCategoryName, setSuggestCategoryName] = useState("");
  const [suggestCategoryDesc, setSuggestCategoryDesc] = useState("");
  const [suggestingCategory, setSuggestingCategory] = useState(false);
  const [dishSubmitting, setDishSubmitting] = useState(false);
  // Kitchen
  const [chefProfile, setChefProfile] = useState<any>(null);
  const [kitchenOnline, setKitchenOnline] = useState(true);
  const [operatingHours, setOperatingHours] = useState<Record<string, {open: string, close: string, enabled: boolean}>>({
    Monday: {open: '09:00', close: '21:00', enabled: true},
    Tuesday: {open: '09:00', close: '21:00', enabled: true},
    Wednesday: {open: '09:00', close: '21:00', enabled: true},
    Thursday: {open: '09:00', close: '21:00', enabled: true},
    Friday: {open: '09:00', close: '21:00', enabled: true},
    Saturday: {open: '09:00', close: '21:00', enabled: true},
    Sunday: {open: '09:00', close: '21:00', enabled: false},
  });
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountNumber: '', sortCode: '' });
  // Payment settings
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalSecretKey, setPaypalSecretKey] = useState('');
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [paymentTestResult, setPaymentTestResult] = useState<{ success: boolean; message: string } | null>(null);
  // Image upload
  const [imageMode, setImageMode] = useState<"upload" | "url">("url");
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // Earnings
  const [earnings, setEarnings] = useState<any>(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  // Tiffin Plans
  const [tiffinPlans, setTiffinPlans] = useState<any[]>([]);
  const [tiffinSubscribers, setTiffinSubscribers] = useState<any[]>([]);
  const [tiffinLoading, setTiffinLoading] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", description: "", frequency: "WEEKLY", price: "", mealsPerDay: "1", isVeg: false });
  const [creatingPlan, setCreatingPlan] = useState(false);
  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  // Toast notification
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Approval state
  const [approvalStatus, setApprovalStatus] = useState<"loading" | "approved" | "pending" | "rejected">("loading");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [chefName, setChefName] = useState("");
  const [chefEmail, setChefEmail] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  // Order state
  const [orders, setOrders] = useState<any[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [activeOrderFilter, setActiveOrderFilter] = useState("All Orders");
  const [historyFilter, setHistoryFilter] = useState("All");
  const prevOrderCountRef = useRef<number>(0);

  // Scheduler state
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [schedulerDayItems, setSchedulerDayItems] = useState<any[]>([]);
  const [schedulerDayMenu, setSchedulerDayMenu] = useState<any>(null);
  const [schedulerDayNotes, setSchedulerDayNotes] = useState("");
  const [schedulerNewItem, setSchedulerNewItem] = useState({ name: "", price: "", description: "", isVeg: true, stockCount: "", image: "", prepTime: "", servingSize: "", offerPrice: "", allergens: "", categoryId: "", eggOption: "" });
  const [schedulerShowAddItem, setSchedulerShowAddItem] = useState(false);
  const [schedulerAddMode, setSchedulerAddMode] = useState<"menu" | "new">("menu");
  const [schedulerSaving, setSchedulerSaving] = useState(false);
  const [schedulerCopyTarget, setSchedulerCopyTarget] = useState<string[]>([]);
  const [schedulerShowCopy, setSchedulerShowCopy] = useState(false);
  const [schedulerShowTemplate, setSchedulerShowTemplate] = useState(false);
  const [schedulerTemplateName, setSchedulerTemplateName] = useState("");
  const [schedulerApplyTemplateId, setSchedulerApplyTemplateId] = useState("");
  const [schedulerEditItem, setSchedulerEditItem] = useState<string | null>(null);
  const [schedulerEditForm, setSchedulerEditForm] = useState({ name: "", price: "", description: "", stockCount: "", image: "", isVeg: true });
  const [schedulerShowBulkPrice, setSchedulerShowBulkPrice] = useState(false);
  const [schedulerBulkType, setSchedulerBulkType] = useState<"percentage" | "fixed">("percentage");
  const [schedulerBulkValue, setSchedulerBulkValue] = useState("");

  // Check auth + approval status on load
  useEffect(() => {
    const token = localStorage.getItem("homeal_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    async function checkApproval() {
      try {
        const res = await authFetch(`${ADMIN_API_URL}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.role !== "CHEF") {
            window.location.href = "/login";
            return;
          }
          setChefName(data.data.name || "");
          setChefEmail(data.data.email || "");
          setApprovalStatus(data.data.approvalStatus || "approved");
          setTrialEndsAt(data.data.trialEndsAt || null);
          // Pre-populate chefProfile from /users/me response so kitchen name is available immediately
          if (data.data.chef && !chefProfile) {
            setChefProfile(data.data.chef);
          }
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

  // --- Order functions ---
  function formatRelativeTime(dateStr: string) {
    const now = Date.now();
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function getOrderItemsSummary(items: any[]) {
    if (!items || items.length === 0) return "No items";
    return items.map((item: any) => `${item.quantity}x ${item.menuItem?.name || "Item"}`).join(", ");
  }

  const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PLACED: { label: "New", color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
    ACCEPTED: { label: "Accepted", color: "#6366F1", bg: "rgba(99,102,241,0.12)" },
    PREPARING: { label: "Preparing", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
    READY: { label: "Ready", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
    OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
    DELIVERED: { label: "Delivered", color: "#059669", bg: "rgba(5,150,105,0.12)" },
    CANCELLED: { label: "Cancelled", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
    REJECTED: { label: "Rejected", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  };

  function playNotificationBeep() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  async function fetchOrders() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    setOrderLoading(true);
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const newOrders = data.data || [];
        const activeNew = newOrders.filter((o: any) => !["DELIVERED","CANCELLED","REJECTED"].includes(o.status));
        const activePrev = orders.filter((o: any) => !["DELIVERED","CANCELLED","REJECTED"].includes(o.status));
        if (activeNew.length > activePrev.length && prevOrderCountRef.current > 0) {
          playNotificationBeep();
        }
        prevOrderCountRef.current = activeNew.length;
        setOrders(newOrders);
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setOrderLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (e) {
      console.error("Failed to update order:", e);
    }
  }

  // Fetch orders when on order pages
  useEffect(() => {
    if (activePage === "active-orders" || activePage === "order-history") {
      fetchOrders();
    }
  }, [activePage]);

  // Poll for new orders on active-orders page
  useEffect(() => {
    if (activePage !== "active-orders") return;
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [activePage]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
  }

  // --- Menu / Category / Earnings / Reviews fetch functions ---
  async function fetchMenuItems() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    setMenuLoading(true);
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/menus/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const menus = data.data;
        if (menus.length > 0) {
          setChefMenuId(menus[0].id);
        }
        const allItems: any[] = [];
        menus.forEach((menu: any) => {
          if (menu.items) {
            menu.items.forEach((item: any) => {
              allItems.push({ ...item, menuId: menu.id });
            });
          }
        });
        setMenuItems(allItems);
      }
    } catch (e) {
      console.error("Failed to fetch menu items:", e);
    } finally {
      setMenuLoading(false);
    }
  }

  async function fetchCategories() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/products/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch categories:", e);
    }
  }

  async function fetchEarnings() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    setEarningsLoading(true);
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/orders/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEarnings(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch earnings:", e);
    } finally {
      setEarningsLoading(false);
    }
  }

  async function fetchTiffinPlans() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    setTiffinLoading(true);
    try {
      const [plansRes, subsRes] = await Promise.all([
        authFetch(`${ADMIN_API_URL}/api/v1/subscriptions/plans/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        authFetch(`${ADMIN_API_URL}/api/v1/subscriptions/subscribers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const plansData = await plansRes.json();
      const subsData = await subsRes.json();
      if (plansData.success && plansData.data) setTiffinPlans(plansData.data);
      if (subsData.success && subsData.data) setTiffinSubscribers(subsData.data);
    } catch (e) {
      console.error("Failed to fetch tiffin plans:", e);
    } finally {
      setTiffinLoading(false);
    }
  }

  async function handleSuggestCategory() {
    const token = localStorage.getItem("homeal_token");
    if (!token || !suggestCategoryName.trim()) return;
    setSuggestingCategory(true);
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/categories/suggest`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: suggestCategoryName.trim(), description: suggestCategoryDesc.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Category suggestion submitted! We'll review it soon.", "success");
        setShowSuggestCategory(false);
        setSuggestCategoryName("");
        setSuggestCategoryDesc("");
      } else {
        showToast(data.error || "Failed to submit suggestion.", "error");
      }
    } catch {
      showToast("Failed to submit suggestion.", "error");
    } finally {
      setSuggestingCategory(false);
    }
  }

  async function handleCreatePlan() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    if (!newPlan.name || !newPlan.price) {
      showToast("Please enter plan name and price.", "error");
      return;
    }
    setCreatingPlan(true);
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/subscriptions/plans`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPlan.name,
          description: newPlan.description || undefined,
          frequency: newPlan.frequency,
          price: parseFloat(newPlan.price),
          mealsPerDay: parseInt(newPlan.mealsPerDay) || 1,
          isVeg: newPlan.isVeg,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Tiffin plan created!", "success");
        setShowCreatePlan(false);
        setNewPlan({ name: "", description: "", frequency: "WEEKLY", price: "", mealsPerDay: "1", isVeg: false });
        fetchTiffinPlans();
      } else {
        showToast(data.error || "Failed to create plan.", "error");
      }
    } catch {
      showToast("Failed to create plan.", "error");
    } finally {
      setCreatingPlan(false);
    }
  }

  async function togglePlanActive(planId: string, isActive: boolean) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/subscriptions/plans/${planId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isActive ? "Plan activated" : "Plan deactivated", "success");
        fetchTiffinPlans();
      }
    } catch {
      showToast("Failed to update plan.", "error");
    }
  }

  async function fetchReviews() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    setReviewsLoading(true);
    try {
      // First get chef profile to get the chef ID
      const meRes = await authFetch(`${ADMIN_API_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json();
      if (meData.success && meData.data?.chefId) {
        const chefRes = await authFetch(`${ADMIN_API_URL}/api/v1/chefs/${meData.data.chefId}`);
        const chefData = await chefRes.json();
        if (chefData.success && chefData.data?.reviews) {
          setReviews(chefData.data.reviews);
          setChefProfile(chefData.data);
        }
      }
    } catch (e) {
      console.error("Failed to fetch reviews:", e);
    } finally {
      setReviewsLoading(false);
    }
  }

  async function fetchChefProfile() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      const meRes = await authFetch(`${ADMIN_API_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json();
      if (meData.success && meData.data?.chefId) {
        const chefRes = await authFetch(`${ADMIN_API_URL}/api/v1/chefs/${meData.data.chefId}`);
        const chefData = await chefRes.json();
        if (chefData.success && chefData.data) {
          const chef = chefData.data;
          setChefProfile(chef);
          setKitchenOnline(chef.isOnline ?? true);
          if (chef.operatingHours) {
            try {
              const parsed = typeof chef.operatingHours === 'string' ? JSON.parse(chef.operatingHours) : chef.operatingHours;
              setOperatingHours(prev => ({ ...prev, ...parsed }));
            } catch {}
          }
          if (chef.bankDetails) {
            try {
              const parsed = typeof chef.bankDetails === 'string' ? JSON.parse(chef.bankDetails) : chef.bankDetails;
              setBankDetails(prev => ({ ...prev, ...parsed }));
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch chef profile:", e);
    }
  }

  async function toggleItemAvailability(menuId: string, itemId: string) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      await authFetch(`${ADMIN_API_URL}/api/v1/menus/${menuId}/items/${itemId}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMenuItems();
    } catch (e) {
      console.error("Failed to toggle item:", e);
      showToast("Failed to toggle availability", "error");
    }
  }

  async function deleteMenuItem(menuId: string, itemId: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      await authFetch(`${ADMIN_API_URL}/api/v1/menus/${menuId}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Item deleted successfully");
      fetchMenuItems();
    } catch (e) {
      console.error("Failed to delete item:", e);
      showToast("Failed to delete item", "error");
    }
  }

  async function submitDish(isAvailable: boolean = true) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    if (!dishForm.name || !dishForm.price) {
      showToast("Please fill in dish name and price", "error");
      return;
    }
    setDishSubmitting(true);
    try {
      let menuId = chefMenuId;
      // Create menu if none exists
      if (!menuId) {
        const menuRes = await authFetch(`${ADMIN_API_URL}/api/v1/menus`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Menu", date: new Date().toISOString().split('T')[0] }),
        });
        const menuData = await menuRes.json();
        if (menuData.success && menuData.data?.id) {
          menuId = menuData.data.id;
          setChefMenuId(menuId);
        } else {
          showToast("Failed to create menu", "error");
          return;
        }
      }

      const payload: any = {
        name: dishForm.name,
        description: dishForm.description || undefined,
        price: parseFloat(dishForm.price),
        isVeg: dishForm.isVeg,
        prepTime: dishForm.prepTime ? parseInt(dishForm.prepTime) : undefined,
        servingSize: dishForm.servingSize || undefined,
        allergens: dishForm.allergens || undefined,
        categoryId: dishForm.categoryId || undefined,
        image: dishForm.image || undefined,
        isAvailable,
        stockCount: dishForm.stockCount ? parseInt(dishForm.stockCount) : undefined,
        offerPrice: dishForm.offerPrice ? parseFloat(dishForm.offerPrice) : undefined,
        eggOption: dishForm.eggOption || undefined,
      };

      let res;
      if (editingItem) {
        res = await authFetch(`${ADMIN_API_URL}/api/v1/menus/${editingItem.menuId}/items/${editingItem.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch(`${ADMIN_API_URL}/api/v1/menus/${menuId}/items`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        showToast(editingItem ? "Dish updated successfully!" : "Dish published successfully!");
        resetDishForm();
        await fetchMenuItems();
        setActivePage("menu");
      } else {
        showToast(data.error || "Failed to save dish", "error");
      }
    } catch (e) {
      console.error("Failed to submit dish:", e);
      showToast("Failed to save dish", "error");
    } finally {
      setDishSubmitting(false);
    }
  }

  function resetDishForm() {
    setEditingItem(null);
    setDishForm({ name: '', categoryId: '', description: '', isVeg: true, price: '', prepTime: '', servingSize: '', allergens: '', stockCount: '', offerPrice: '', image: '', eggOption: '' });
    setImageMode("url");
  }

  function startEditItem(item: any) {
    setEditingItem(item);
    setDishForm({
      name: item.name || '',
      categoryId: item.categoryId || '',
      description: item.description || '',
      isVeg: item.isVeg ?? true,
      price: item.price?.toString() || '',
      prepTime: item.prepTime?.toString() || '',
      servingSize: item.servingSize || '',
      allergens: item.allergens || '',
      stockCount: item.stockCount?.toString() || '',
      offerPrice: item.offerPrice?.toString() || '',
      image: item.image || '',
      eggOption: item.eggOption || '',
    });
    setImageMode(item.image ? "url" : "url");
    setActivePage("add-dish");
  }

  async function updateChefProfile(updates: Record<string, any>) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Settings saved successfully!");
      } else {
        showToast(data.error || "Failed to save settings", "error");
      }
    } catch (e) {
      console.error("Failed to update chef profile:", e);
      showToast("Failed to save settings", "error");
    }
  }

  async function replyToReview(reviewId: string) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    const reply = replyTexts[reviewId];
    if (!reply?.trim()) return;
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/reviews/${reviewId}/reply`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Reply posted successfully!");
        setReplyTexts(prev => ({ ...prev, [reviewId]: '' }));
        fetchReviews();
      } else {
        showToast("Failed to post reply", "error");
      }
    } catch (e) {
      console.error("Failed to reply to review:", e);
      showToast("Failed to post reply", "error");
    }
  }

  // --- Payment config functions ---
  async function fetchPaymentConfig() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me/payment-config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPaymentConfig(data.data);
        if (data.data.stripeSecretKey) setStripeSecretKey(data.data.stripeSecretKey);
        if (data.data.stripePublishableKey) setStripePublishableKey(data.data.stripePublishableKey);
        if (data.data.paypalClientId) setPaypalClientId(data.data.paypalClientId);
        if (data.data.paypalSecretKey) setPaypalSecretKey(data.data.paypalSecretKey);
      }
    } catch (e) {
      console.error("Failed to fetch payment config:", e);
    }
  }

  async function savePaymentConfig(configData: Record<string, string>) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me/payment-config`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(configData),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Payment settings saved successfully!");
        fetchPaymentConfig();
      } else {
        showToast(data.error || "Failed to save payment settings", "error");
      }
    } catch (e) {
      console.error("Failed to save payment config:", e);
      showToast("Failed to save payment settings", "error");
    }
  }

  async function testPaymentConnection(provider: string) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    setPaymentTestResult(null);
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me/payment-config/test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentTestResult({ success: true, message: "Connection successful!" });
        showToast("Payment connection test passed!");
      } else {
        setPaymentTestResult({ success: false, message: data.error || "Connection test failed" });
        showToast(data.error || "Connection test failed", "error");
      }
    } catch (e) {
      console.error("Failed to test payment connection:", e);
      setPaymentTestResult({ success: false, message: "Connection test failed" });
      showToast("Connection test failed", "error");
    }
  }

  async function setupStripeConnect() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me/stripe-connect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        window.open(data.data.url, "_blank");
      } else {
        showToast(data.error || "Failed to set up Stripe Connect", "error");
      }
    } catch (e) {
      console.error("Failed to set up Stripe Connect:", e);
      showToast("Failed to set up Stripe Connect", "error");
    }
  }

  // --- Refresh token helper ---
  async function ensureFreshToken(): Promise<string | null> {
    let token = localStorage.getItem("homeal_token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiresIn = payload.exp * 1000 - Date.now();
      if (expiresIn < 120_000) {
        const refreshToken = localStorage.getItem("homeal_refresh_token");
        if (refreshToken) {
          const res = await authFetch(`${ADMIN_API_URL}/api/v1/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          const data = await res.json();
          if (data.success && data.data?.token) {
            localStorage.setItem("homeal_token", data.data.token);
            token = data.data.token;
          }
        }
      }
    } catch { /* proceed with existing token */ }
    return token;
  }

  // --- Compress & upload image with progress ---
  async function compressAndUpload(file: File): Promise<string | null> {
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      showToast("Only JPEG, PNG, and WebP images are allowed.", "error");
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5 MB.", "error");
      return null;
    }
    const token = await ensureFreshToken();
    if (!token) { showToast("Please log in again.", "error"); return null; }

    setUploadProgress(0);
    setImageUploading(true);

    try {
      // Client-side compression: max 1 MB, max 1200px
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp",
      });

      // Upload with XHR for progress tracking
      return await new Promise<string | null>((resolve) => {
        const formData = new FormData();
        formData.append("image", compressed, compressed.name || "image.webp");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${ADMIN_API_URL}/api/v1/upload`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.timeout = 60_000;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success && data.data?.url) {
              showToast("Image uploaded successfully!");
              resolve(data.data.url);
            } else {
              showToast(data.error || "Upload failed. Please try a smaller image.", "error");
              resolve(null);
            }
          } catch {
            showToast("Upload failed. Please try again.", "error");
            resolve(null);
          }
        };
        xhr.onerror = () => { showToast("Upload failed. Check your connection.", "error"); resolve(null); };
        xhr.ontimeout = () => { showToast("Upload timed out. Please try a smaller image.", "error"); resolve(null); };
        xhr.send(formData);
      });
    } catch (e) {
      console.error("Image compression/upload failed:", e);
      showToast("Failed to process image. Please try a smaller file.", "error");
      return null;
    } finally {
      setImageUploading(false);
      setUploadProgress(0);
    }
  }

  // --- Image upload handler ---
  async function handleImageUpload(file: File) {
    const url = await compressAndUpload(file);
    if (url) setDishForm(f => ({ ...f, image: url }));
  }

  // --- Scheduler functions ---
  function getScheduleRange() {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - from.getDay() + 1); // Monday this week
    const to = new Date(from);
    to.setDate(to.getDate() + 13); // 2 weeks
    return {
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
    };
  }

  async function fetchSchedule() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    setScheduleLoading(true);
    try {
      const { from, to } = getScheduleRange();
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/menus/my/schedule?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        // Flatten schedule entries: API returns { date, menu: {...} | null, orderCount }
        const schedule = (data.data.schedule || []).map((d: any) => ({
          date: d.date,
          items: d.menu?.items || [],
          isClosed: d.menu?.isClosed || false,
          notes: d.menu?.notes || "",
          orderCount: d.orderCount || 0,
          menuId: d.menu?.id || null,
          menuName: d.menu?.name || "",
        }));
        setScheduleData(schedule);
        // Also load templates if returned alongside schedule
        if (data.data.templates) {
          setTemplates(data.data.templates.map((t: any) => ({
            ...t,
            items: typeof t.items === "string" ? JSON.parse(t.items) : t.items,
          })));
        }
      }
    } catch (e) {
      console.error("Failed to fetch schedule:", e);
    } finally {
      setScheduleLoading(false);
    }
  }

  async function fetchTemplates() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTemplates(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch templates:", e);
    }
  }

  function selectScheduleDate(dateStr: string) {
    setSelectedDate(dateStr);
    const dayData = scheduleData.find((d: any) => d.date === dateStr);
    if (dayData) {
      setSchedulerDayMenu(dayData);
      setSchedulerDayItems(dayData.items || []);
      setSchedulerDayNotes(dayData.notes || "");
    } else {
      setSchedulerDayMenu(null);
      setSchedulerDayItems([]);
      setSchedulerDayNotes("");
    }
    setSchedulerShowAddItem(false);
    setSchedulerShowCopy(false);
    setSchedulerShowTemplate(false);
  }

  async function toggleDayClosed(dateStr: string) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      await authFetch(`${ADMIN_API_URL}/api/v1/menus/schedule/${dateStr}/close`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchSchedule();
      // Re-select will happen via useEffect on scheduleData change
    } catch (e) {
      console.error("Failed to toggle day closed:", e);
      showToast("Failed to update day status", "error");
    }
  }

  async function addSchedulerItem() {
    const token = localStorage.getItem("homeal_token");
    if (!token || !schedulerNewItem.name || !schedulerNewItem.price) return;
    setSchedulerSaving(true);
    try {
      const body: any = {
        name: schedulerNewItem.name,
        price: parseFloat(schedulerNewItem.price),
        isVeg: schedulerNewItem.isVeg,
      };
      if (schedulerNewItem.description) body.description = schedulerNewItem.description;
      if (schedulerNewItem.stockCount) body.stockCount = parseInt(schedulerNewItem.stockCount);
      if (schedulerNewItem.image) body.image = schedulerNewItem.image;
      if (schedulerNewItem.prepTime) body.prepTime = parseInt(schedulerNewItem.prepTime);
      if (schedulerNewItem.servingSize) body.servingSize = schedulerNewItem.servingSize;
      if (schedulerNewItem.offerPrice) body.offerPrice = parseFloat(schedulerNewItem.offerPrice);
      if (schedulerNewItem.allergens) body.allergens = schedulerNewItem.allergens;
      if (schedulerNewItem.categoryId) body.categoryId = schedulerNewItem.categoryId;
      if (schedulerNewItem.eggOption) body.eggOption = schedulerNewItem.eggOption;
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/menus/schedule/${selectedDate}/items`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Item added!");
        setSchedulerNewItem({ name: "", price: "", description: "", isVeg: true, stockCount: "", image: "", prepTime: "", servingSize: "", offerPrice: "", allergens: "", categoryId: "", eggOption: "" });
        setSchedulerShowAddItem(false);
        await fetchSchedule();
      } else {
        showToast(data.error || "Failed to add item", "error");
      }
    } catch (e) {
      console.error("Failed to add scheduler item:", e);
      showToast("Failed to add item", "error");
    } finally {
      setSchedulerSaving(false);
    }
  }

  async function addExistingDishToSchedule(dish: any) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    setSchedulerSaving(true);
    try {
      const body: any = {
        name: dish.name,
        price: dish.price,
        isVeg: dish.isVeg,
      };
      if (dish.description) body.description = dish.description;
      if (dish.image) body.image = dish.image;
      if (dish.stockCount != null) body.stockCount = dish.stockCount;
      if (dish.prepTime) body.prepTime = dish.prepTime;
      if (dish.servingSize) body.servingSize = dish.servingSize;
      if (dish.offerPrice) body.offerPrice = dish.offerPrice;
      if (dish.allergens) body.allergens = dish.allergens;
      if (dish.categoryId) body.categoryId = dish.categoryId;
      if (dish.eggOption) body.eggOption = dish.eggOption;
      if (dish.calories) body.calories = dish.calories;
      if (dish.ingredients) body.ingredients = dish.ingredients;
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/menus/schedule/${selectedDate}/items`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`"${dish.name}" added to schedule!`);
        await fetchSchedule();
      } else {
        showToast(data.error || "Failed to add item", "error");
      }
    } catch (e) {
      console.error("Failed to add existing dish:", e);
      showToast("Failed to add item", "error");
    } finally {
      setSchedulerSaving(false);
    }
  }

  async function copyDayTo() {
    const token = localStorage.getItem("homeal_token");
    if (!token || schedulerCopyTarget.length === 0) return;
    setSchedulerSaving(true);
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/menus/schedule/${selectedDate}/copy`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ targetDates: schedulerCopyTarget }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Copied to ${data.data?.created?.length || 0} day(s)!`);
        setSchedulerShowCopy(false);
        setSchedulerCopyTarget([]);
        await fetchSchedule();
      } else {
        showToast(data.error || "Failed to copy", "error");
      }
    } catch (e) {
      console.error("Failed to copy day:", e);
      showToast("Failed to copy", "error");
    } finally {
      setSchedulerSaving(false);
    }
  }

  async function copyWeek() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    setSchedulerSaving(true);
    try {
      const { from } = getScheduleRange();
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/menus/schedule/copy-week`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ sourceWeekStart: from }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Copied week! ${data.data?.created || 0} menus created.`);
        await fetchSchedule();
      } else {
        showToast(data.error || "Failed to copy week", "error");
      }
    } catch (e) {
      console.error("Failed to copy week:", e);
      showToast("Failed to copy week", "error");
    } finally {
      setSchedulerSaving(false);
    }
  }

  async function saveAsTemplate() {
    const token = localStorage.getItem("homeal_token");
    if (!token || !schedulerTemplateName.trim()) return;
    setSchedulerSaving(true);
    try {
      const items = schedulerDayItems.map((item: any) => ({
        name: item.name,
        description: item.description,
        price: item.price,
        isVeg: item.isVeg,
        image: item.image,
        stockCount: item.stockCount,
        allergens: item.allergens,
        prepTime: item.prepTime,
        servingSize: item.servingSize,
        categoryId: item.categoryId,
        offerPrice: item.offerPrice,
        eggOption: item.eggOption,
      }));
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/templates`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: schedulerTemplateName, items }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Template saved!");
        setSchedulerTemplateName("");
        setSchedulerShowTemplate(false);
        fetchTemplates();
      } else {
        showToast(data.error || "Failed to save template", "error");
      }
    } catch (e) {
      console.error("Failed to save template:", e);
      showToast("Failed to save template", "error");
    } finally {
      setSchedulerSaving(false);
    }
  }

  async function applyTemplate() {
    const token = localStorage.getItem("homeal_token");
    if (!token || !schedulerApplyTemplateId) return;
    setSchedulerSaving(true);
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/templates/${schedulerApplyTemplateId}/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ dates: [selectedDate] }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data?.skipped?.length > 0) {
          showToast("Menu already exists for this date — skipped", "error");
        } else {
          showToast("Template applied!");
        }
        setSchedulerApplyTemplateId("");
        await fetchSchedule();
        // Re-select happens via useEffect on scheduleData change
      } else {
        showToast(data.error || "Failed to apply template", "error");
      }
    } catch (e) {
      console.error("Failed to apply template:", e);
      showToast("Failed to apply template", "error");
    } finally {
      setSchedulerSaving(false);
    }
  }

  async function deleteTemplate(templateId: string) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      await authFetch(`${ADMIN_API_URL}/api/v1/templates/${templateId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Template deleted");
      fetchTemplates();
    } catch (e) {
      console.error("Failed to delete template:", e);
      showToast("Failed to delete template", "error");
    }
  }

  async function updateDayNotes(dateStr: string, notes: string) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      await authFetch(`${ADMIN_API_URL}/api/v1/menus/schedule/${dateStr}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      showToast("Notes saved!");
    } catch (e) {
      console.error("Failed to save notes:", e);
      showToast("Failed to save notes", "error");
    }
  }

  async function deleteSchedulerItem(menuId: string, itemId: string) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      await authFetch(`${ADMIN_API_URL}/api/v1/menus/${menuId}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Item removed");
      await fetchSchedule();
      // Re-select happens via useEffect on scheduleData change
    } catch (e) {
      console.error("Failed to delete item:", e);
      showToast("Failed to delete item", "error");
    }
  }

  async function handleSchedulerImageUpload(file: File, target: "new" | "edit") {
    const url = await compressAndUpload(file);
    if (url) {
      if (target === "new") {
        setSchedulerNewItem(p => ({ ...p, image: url }));
      } else {
        setSchedulerEditForm(p => ({ ...p, image: url }));
      }
    }
  }

  async function editSchedulerItem(menuId: string, itemId: string) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    setSchedulerSaving(true);
    try {
      const body: any = {
        name: schedulerEditForm.name,
        price: parseFloat(schedulerEditForm.price),
        isVeg: schedulerEditForm.isVeg,
      };
      if (schedulerEditForm.description) body.description = schedulerEditForm.description;
      if (schedulerEditForm.stockCount) body.stockCount = parseInt(schedulerEditForm.stockCount);
      if (schedulerEditForm.image) body.image = schedulerEditForm.image;
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/menus/${menuId}/items/${itemId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Item updated!");
        setSchedulerEditItem(null);
        await fetchSchedule();
      } else {
        showToast(data.error || "Failed to update item", "error");
      }
    } catch (e) {
      console.error("Failed to edit item:", e);
      showToast("Failed to update item", "error");
    } finally {
      setSchedulerSaving(false);
    }
  }

  async function toggleItemSoldOut(menuId: string, itemId: string) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/menus/${menuId}/items/${itemId}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.data?.isAvailable ? "Item back in stock" : "Item marked sold out");
        await fetchSchedule();
      } else {
        showToast(data.error || "Failed to toggle", "error");
      }
    } catch (e) {
      console.error("Failed to toggle sold out:", e);
      showToast("Failed to toggle sold out", "error");
    }
  }

  async function bulkUpdatePrices(type: "percentage" | "fixed", value: number) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    setSchedulerSaving(true);
    try {
      const res = await authFetch(`${ADMIN_API_URL}/api/v1/menus/schedule/${selectedDate}/bulk-price`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type, value }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Updated ${data.data?.updated || 0} item prices!`);
        await fetchSchedule();
        // Re-select happens via useEffect on scheduleData change
      } else {
        showToast(data.error || "Failed to update prices", "error");
      }
    } catch (e) {
      console.error("Failed to bulk update prices:", e);
      showToast("Failed to update prices", "error");
    } finally {
      setSchedulerSaving(false);
    }
  }

  // Fetch menu items and categories on mount
  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    fetchChefProfile();
    fetchPaymentConfig();
  }, []);

  // Fetch earnings when on dashboard or earnings page
  useEffect(() => {
    if (activePage === "dashboard" || activePage === "earnings") {
      fetchEarnings();
    }
    if (activePage === "reviews") {
      fetchReviews();
    }
    if (activePage === "scheduler") {
      fetchSchedule();
      fetchTemplates();
    }
    if (activePage === "subscriptions") {
      fetchTiffinPlans();
    }
  }, [activePage]);

  // When schedule data changes, re-select the current date to refresh panel
  useEffect(() => {
    if (scheduleData.length > 0) {
      selectScheduleDate(selectedDate);
    }
  }, [scheduleData]);

  // Helper to find category name by id
  function getCategoryName(categoryId: string) {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || "Uncategorised";
  }

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

  const customPages = ["dashboard", "settings", "menu", "products", "my-services", "add-product", "add-dish", "add-cake", "active-orders", "order-history", "notifications", "subscriptions", "earnings", "reviews", "analytics", "scheduler"];

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
            Questions? Contact <span style={{ color: "#8B5CF6", fontWeight: 600 }}>Homeal Admin</span> for support
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
            href="mailto:support@homeal.uk"
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
      {/* Suggest Category Modal */}
      {showSuggestCategory && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSuggestCategory(false)}>
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 max-w-md w-full mx-4 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-[var(--text)] mb-4">Suggest a New Category</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">Can&apos;t find the right category for your dish? Suggest one and our team will review it. If approved, you&apos;ll earn a Menu Innovator badge!</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Category Name *</label>
                <input type="text" value={suggestCategoryName} onChange={(e) => setSuggestCategoryName(e.target.value)} placeholder="e.g. Korean, Desserts, Street Food" className="w-full px-3 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Description (optional)</label>
                <textarea value={suggestCategoryDesc} onChange={(e) => setSuggestCategoryDesc(e.target.value)} placeholder="Brief description of this category..." rows={2} className="w-full px-3 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowSuggestCategory(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--input)] transition">Cancel</button>
              <button onClick={handleSuggestCategory} disabled={suggestingCategory || !suggestCategoryName.trim()} className="flex-1 btn-premium text-sm font-semibold py-2.5 rounded-xl text-white disabled:opacity-50 flex items-center justify-center gap-2">
                {suggestingCategory ? <><RefreshCw size={14} className="animate-spin" /> Submitting...</> : "Submit Suggestion"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border" style={{
            background: toast.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)',
            borderColor: toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
            backdropFilter: 'blur(12px)',
          }}>
            {toast.type === 'success' ? <Check size={16} color="white" /> : <AlertCircle size={16} color="white" />}
            <span className="text-sm font-medium text-white">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-200 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ background: "var(--sidebar-bg)" }}>
        {/* Sidebar branding */}
        <div className="py-3 px-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-1.5 px-2.5" aria-label="Homeal - Home">
              <img src="/chef-icon.png" alt="" className="h-10 w-auto shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-fredoka)]">
                  <span className="text-[#278848]">Ho</span>
                  <span className="text-[#FF8800]">me</span>
                  <span className="text-[#278848]">al</span>
                </span>
                <span className="text-[10px] text-[var(--sidebar-muted)] tracking-wide whitespace-nowrap">Where Every Meal Feels Like Home</span>
              </div>
            </a>
            <button className="md:hidden p-1 rounded-lg hover:bg-[var(--sidebar-hover)]" onClick={() => setSidebarOpen(false)}>
              <X size={20} style={{ color: "var(--sidebar-text)" }} />
            </button>
          </div>
          <div className="px-2.5 py-2">
            <p className="text-xs text-[var(--sidebar-muted)]">Welcome back</p>
            <p className="text-sm font-semibold text-[var(--sidebar-text)]">{chefProfile?.kitchenName || chefName || "Home Maker Dashboard"}</p>
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

        {/* Customer view link + Theme toggle */}
        <div className="px-3 pb-4">
          <a
            href={`https://homeal.uk${chefEmail ? `?email=${encodeURIComponent(chefEmail)}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all"
            style={{ color: "#8B5CF6" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--sidebar-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <ExternalLink size={20} strokeWidth={1.8} />
            <span>Switch to Customer View</span>
          </a>
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
          <button
            onClick={() => { localStorage.removeItem("homeal_token"); localStorage.removeItem("homeal_refresh_token"); window.location.href = "/login"; }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all"
            style={{ color: "#EF4444" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--sidebar-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={20} strokeWidth={1.8} />
            <span>Sign Out</span>
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
            <button onClick={() => setActivePage("notifications")} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--input)] transition">
              <Bell size={18} className="text-[var(--text-muted)]" />
            </button>
            <button onClick={() => setActivePage("settings")} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--input)] transition">
              <Settings size={18} className="text-[var(--text-muted)]" />
            </button>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ml-0.5 badge-gradient cursor-pointer hover:opacity-90 transition">
                {chefName ? chefName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "CH"}
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-10 z-50 w-64 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-2 animate-in fade-in-0 zoom-in-95">
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="text-sm font-semibold text-[var(--text)] truncate">{chefName || "Home Maker"}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{chefEmail}</p>
                    </div>
                    <button onClick={() => { setActivePage("settings"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--input)] transition">
                      <User size={16} className="text-[var(--text-muted)]" />
                      Profile &amp; Settings
                    </button>
                    <a href={`https://homeal.uk?email=${encodeURIComponent(chefEmail)}`} target="_blank" rel="noopener noreferrer" onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--input)] transition">
                      <ExternalLink size={16} className="text-[var(--text-muted)]" />
                      Switch to Customer View
                    </a>
                    <div className="border-t border-[var(--border)] mt-1 pt-1">
                      <button onClick={() => { localStorage.removeItem("homeal_token"); localStorage.removeItem("homeal_refresh_token"); window.location.href = "/login"; }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-[var(--input)] transition">
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
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
                className="rounded-2xl glass-card px-4 sm:px-6 py-4 sm:py-5 mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient"
                  >
                    <ChefHat size={28} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">{chefProfile?.kitchenName || chefName || "My Kitchen"}{chefProfile?.kitchenName ? " Dashboard" : ""}</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs text-[var(--text-muted)]">
                      {chefProfile?.user?.name && <span className="flex items-center gap-1.5"><User size={12} /> {chefProfile.user.name}</span>}
                      {chefProfile?.user?.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {chefProfile.user.phone}</span>}
                      <span className="flex items-center gap-1.5 hidden sm:flex"><Mail size={12} /> {chefEmail || "—"}</span>
                    </div>
                    {(chefProfile?.address || chefProfile?.postcode) && (
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1.5"><MapPin size={12} /> {[chefProfile.address, chefProfile.postcode].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border" style={{ color: "#10B981", borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.1)" }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />Active
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border" style={{ color: "#3B82F6", borderColor: "rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)" }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />Home Maker
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border" style={{ color: "#10B981", borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.1)" }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />Online
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-[var(--text-muted)]">Welcome, {chefName?.split(" ")[0] || "Home Maker"}</p>
                  <span
                    className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-[11px] font-semibold border"
                    style={{ color: "var(--primary)", borderColor: "rgba(255,90,31,0.3)", background: "rgba(255,90,31,0.08)" }}
                  >
                    <ChefHat size={12} /> Admin
                  </span>
                </div>
              </div>

              {/* Missing postcode warning */}
              {chefProfile && !chefProfile.postcode && (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-50/50 dark:bg-amber-900/10 px-4 py-3 mb-5 flex items-center gap-3 animate-fade-in-up">
                  <AlertCircle size={18} className="text-amber-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Complete your kitchen profile</p>
                    <p className="text-xs text-amber-600/70 dark:text-amber-400/60">Add your postcode and address to appear in customer search results.</p>
                  </div>
                  <button onClick={() => setActivePage("settings")} className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline shrink-0">Go to Settings</button>
                </div>
              )}

              {/* Chef Badges & Trust Indicators */}
              <div
                className="rounded-2xl glass-card px-5 py-4 mb-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-[var(--text)] flex items-center gap-2">
                    <Award size={14} style={{ color: "#F59E0B" }} /> Home Maker Badges & Trust Score
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
                className="rounded-2xl glass-card px-5 py-4 mb-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient"
                  >
                    <LayoutDashboard size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Dashboard</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Welcome back, {chefProfile?.user?.name || chefName || "Chef"}</p>
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
                {[
                  { label: "Today's Revenue", value: `\u00A3${earnings?.today?.amount?.toFixed(2) || '0.00'}`, sub: "Today's earnings", icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Today's Expenses", value: "\u00A30.00", sub: "Today's costs", icon: TrendingDown, color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
                  { label: "Today's Orders", value: `${earnings?.today?.orders || 0}`, sub: "Orders today", icon: Clock, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
                  { label: "Total Dishes", value: `${menuItems.length}`, sub: "Listed items", icon: UtensilsCrossed, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                ].map((s, i) => {
                  const StatIcon = s.icon;
                  return (
                    <div key={i} className="p-4 rounded-2xl border border-[var(--border)] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl" style={{ background: "var(--header-bg)" }}>
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

              {/* Stats Row 2 - Weekly/Monthly */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
                {[
                  { label: "Weekly Revenue", value: `\u00A3${earnings?.week?.amount?.toFixed(2) || '0.00'}`, sub: `${earnings?.week?.orders || 0} orders this week`, icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Weekly Expenses", value: "\u00A30.00", sub: "This week's costs", icon: TrendingDown, color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
                  { label: "Monthly Earnings", value: `\u00A3${earnings?.month?.amount?.toFixed(2) || '0.00'}`, sub: `${earnings?.month?.orders || 0} orders this month`, icon: Wallet, color: "#14B8A6", bg: "rgba(20,184,166,0.12)" },
                  { label: "Pending Reviews", value: `${reviews.filter(r => !r.reply).length}`, sub: "Awaiting response", icon: AlertCircle, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
                ].map((s, i) => {
                  const StatIcon = s.icon;
                  return (
                    <div key={i} className="p-4 rounded-2xl border border-[var(--border)] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl" style={{ background: "var(--header-bg)" }}>
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

              {/* Active Orders Panel */}
              <div className="rounded-2xl glass-card p-6">
                <h2 className="text-sm font-semibold text-[var(--text)] mb-4">Active Orders</h2>
                <div className="text-center py-16 animate-fade-in-up">
                  <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                    <ClipboardList size={36} className="text-white" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text)] mb-1">No active orders yet</h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">New orders will appear here with sound alerts</p>
                </div>
              </div>
            </>
          )}

          {/* My Services Page */}
          {activePage === "my-services" && (
            <>
              {/* Services Header */}
              <div
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
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
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
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
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:overflow-x-visible mb-6">
                <button
                  onClick={() => setActiveProductTab("all")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0"
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
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
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
                        className="rounded-2xl border border-[var(--border)] p-4 flex items-center gap-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
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
                    <div className="rounded-2xl glass-card p-8">
                      <div className="text-center py-16 animate-fade-in-up">
                        <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                          <Store size={36} className="text-white" />
                        </div>
                        <h3 className="text-base font-bold text-[var(--text)] mb-1">No product categories enabled</h3>
                        <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Go to Settings to enable product categories</p>
                        <button onClick={() => setActivePage("settings")} className="mt-4 px-5 py-2 rounded-xl text-white text-xs font-medium inline-flex items-center gap-2 btn-premium">
                          <Settings size={14} /> Open Settings
                        </button>
                      </div>
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
                      className="px-4 py-2 rounded-xl text-white text-xs font-medium flex items-center gap-2 transition hover:opacity-90 btn-premium"
                    >
                      <PlusCircle size={14} />
                      Add {activeProductTab === "Cakes" ? "Cake" : activeProductTab.endsWith("s") ? activeProductTab.slice(0, -1) : activeProductTab}
                    </button>
                  </div>

                  {/* Cake sub-categories */}
                  {activeProductTab === "Cakes" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                      {CAKE_CATEGORIES.map((cat, i) => (
                        <div key={i} className="rounded-xl border border-[var(--border)] p-3 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer" style={{ background: "var(--header-bg)" }}>
                          <div className="text-2xl mb-1">{cat.icon}</div>
                          <p className="text-[11px] font-semibold text-[var(--text)]">{cat.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{cat.count} items</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Products table for this category */}
                  <div className="rounded-2xl glass-card overflow-hidden">
                    <table className="w-full text-xs hidden md:table">
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
                    {/* Mobile Cards */}
                    <div className="md:hidden p-4">
                      <div className="text-center py-16 animate-fade-in-up">
                        <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                          {activeProductTab === "Cakes" ? <Cake size={36} className="text-white" /> : <Store size={36} className="text-white" />}
                        </div>
                        <h3 className="text-base font-bold text-[var(--text)] mb-1">No {activeProductTab.toLowerCase()} added yet</h3>
                        <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Click the button above to add your first item</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Add Product Form */}
          {activePage === "add-product" && (
            <>
              <div
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
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

              <div className="rounded-2xl glass-card p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Product Name *</label>
                      <input type="text" placeholder="e.g. Mango Pickle, Masoor Papad" value={dishForm.name} onChange={e => setDishForm(f => ({...f, name: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Category *</label>
                      <select value={dishForm.categoryId} onChange={e => setDishForm(f => ({...f, categoryId: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[var(--primary)] transition">
                        <option value="">Select a category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => setShowSuggestCategory(true)} className="text-[11px] text-primary hover:underline mt-1 inline-block">Can&apos;t find your category? Suggest one</button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Description</label>
                      <textarea rows={3} placeholder="Describe your product, ingredients, taste..." value={dishForm.description} onChange={e => setDishForm(f => ({...f, description: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Allergen Info</label>
                      <input type="text" placeholder="e.g. Contains mustard, nuts" value={dishForm.allergens} onChange={e => setDishForm(f => ({...f, allergens: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Egg Option</label>
                      <div className="flex flex-wrap gap-2">
                        {[{ label: "None", val: "" }, { label: "Egg", val: "egg" }, { label: "Eggless", val: "eggless" }, { label: "Both", val: "both" }].map((opt) => (
                          <label key={opt.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer hover:border-[var(--primary)] transition text-xs ${dishForm.eggOption === opt.val ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.06)]' : 'border-[var(--border)]'}`}>
                            <input type="radio" name="productEggOption" checked={dishForm.eggOption === opt.val} onChange={() => setDishForm(f => ({...f, eggOption: opt.val}))} className="accent-[var(--primary)]" />
                            <span className="text-sm text-[var(--text)]">{opt.label}</span>
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
                        <input type="number" placeholder="0.00" value={dishForm.price} onChange={e => setDishForm(f => ({...f, price: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Serving Size</label>
                        <input type="text" placeholder="e.g. 250g, 500ml" value={dishForm.servingSize} onChange={e => setDishForm(f => ({...f, servingSize: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Stock Count</label>
                        <input type="number" placeholder="Leave empty for unlimited" value={dishForm.stockCount} onChange={e => setDishForm(f => ({...f, stockCount: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Offer Price (&pound;)</label>
                        <input type="number" placeholder="Special offer price" value={dishForm.offerPrice} onChange={e => setDishForm(f => ({...f, offerPrice: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Product Image</label>
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setImageMode("upload")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${imageMode === "upload" ? "bg-[var(--primary)] text-white" : "bg-[var(--input)] text-[var(--text)] border border-[var(--border)]"}`}
                        >
                          <Upload size={12} /> Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageMode("url")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${imageMode === "url" ? "bg-[var(--primary)] text-white" : "bg-[var(--input)] text-[var(--text)] border border-[var(--border)]"}`}
                        >
                          <Image size={12} /> Image URL
                        </button>
                      </div>
                      {imageMode === "upload" ? (
                        <div>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }}
                            className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[var(--primary)] transition file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[var(--primary)] file:text-white"
                          />
                          {imageUploading && <div className="mt-2"><div className="flex items-center gap-2"><RefreshCw size={12} className="animate-spin text-[var(--text-muted)]" /><span className="text-xs text-[var(--text-muted)]">{uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : "Compressing..."}</span></div>{uploadProgress > 0 && <div className="mt-1 h-1.5 rounded-full bg-[var(--input)] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div>}</div>}
                        </div>
                      ) : (
                        <input type="text" placeholder="https://... (image URL)" value={dishForm.image} onChange={e => setDishForm(f => ({...f, image: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      )}
                      {dishForm.image && (
                        <div className="mt-3 relative inline-block">
                          <img src={dishForm.image} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-[var(--border)]" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <button type="button" onClick={() => setDishForm(f => ({...f, image: ''}))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition">
                            <X size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6 pt-5 border-t border-[var(--border)]">
                  <button onClick={() => { resetDishForm(); setActivePage("products"); }} className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium transition hover:opacity-80" style={{ background: "var(--input)", color: "var(--text)" }}>
                    Cancel
                  </button>
                  <button disabled={dishSubmitting} onClick={() => submitDish(false)} className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text)] border border-[var(--border)] transition hover:opacity-80 disabled:opacity-50">
                    Save as Draft
                  </button>
                  <button disabled={dishSubmitting} onClick={() => submitDish(true)} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90 btn-premium disabled:opacity-50">
                    {dishSubmitting ? "Saving..." : "Publish Product"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Add Dish Form */}
          {activePage === "add-dish" && (
            <>
              <div
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <UtensilsCrossed size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">{editingItem ? "Edit Dish" : "Add New Dish"}</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{editingItem ? "Update your dish details" : "Add a dish to your daily menu"}</p>
                  </div>
                </div>
                <button
                  onClick={() => { resetDishForm(); setActivePage("menu"); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-80"
                  style={{ background: "var(--input)", color: "var(--text)" }}
                >
                  Back to Menu
                </button>
              </div>

              <div className="rounded-2xl glass-card p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Dish Name *</label>
                      <input type="text" placeholder="e.g. Chicken Biryani, Dal Tadka" value={dishForm.name} onChange={e => setDishForm(f => ({...f, name: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Category *</label>
                      <select value={dishForm.categoryId} onChange={e => setDishForm(f => ({...f, categoryId: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[var(--primary)] transition">
                        <option value="">Select a category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => setShowSuggestCategory(true)} className="text-[11px] text-primary hover:underline mt-1 inline-block">Can&apos;t find your category? Suggest one</button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Description</label>
                      <textarea rows={3} placeholder="Describe your dish..." value={dishForm.description} onChange={e => setDishForm(f => ({...f, description: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Diet Type *</label>
                      <div className="flex gap-3">
                        {[{ label: "Veg", val: true }, { label: "Non-Veg", val: false }].map((diet) => (
                          <label key={diet.label} className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer hover:border-[var(--primary)] transition ${dishForm.isVeg === diet.val ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                            <input type="radio" name="diet" checked={dishForm.isVeg === diet.val} onChange={() => setDishForm(f => ({...f, isVeg: diet.val}))} className="accent-[var(--primary)]" />
                            <span className="text-sm text-[var(--text)]">{diet.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Egg Option</label>
                      <div className="flex flex-wrap gap-2">
                        {[{ label: "None", val: "" }, { label: "Egg", val: "egg" }, { label: "Eggless", val: "eggless" }, { label: "Both", val: "both" }].map((opt) => (
                          <label key={opt.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer hover:border-[var(--primary)] transition text-xs ${dishForm.eggOption === opt.val ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.06)]' : 'border-[var(--border)]'}`}>
                            <input type="radio" name="eggOption" checked={dishForm.eggOption === opt.val} onChange={() => setDishForm(f => ({...f, eggOption: opt.val}))} className="accent-[var(--primary)]" />
                            <span className="text-sm text-[var(--text)]">{opt.label}</span>
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
                        <input type="number" placeholder="0.00" value={dishForm.price} onChange={e => setDishForm(f => ({...f, price: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Prep Time (mins)</label>
                        <input type="number" placeholder="e.g. 30" value={dishForm.prepTime} onChange={e => setDishForm(f => ({...f, prepTime: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Serving Size</label>
                        <input type="text" placeholder="e.g. 1-2 persons" value={dishForm.servingSize} onChange={e => setDishForm(f => ({...f, servingSize: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Offer Price (&pound;)</label>
                        <input type="number" placeholder="Special offer price" value={dishForm.offerPrice} onChange={e => setDishForm(f => ({...f, offerPrice: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Stock Count</label>
                        <input type="number" placeholder="Leave empty for unlimited" value={dishForm.stockCount} onChange={e => setDishForm(f => ({...f, stockCount: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Allergen Info</label>
                        <input type="text" placeholder="e.g. Contains dairy, gluten" value={dishForm.allergens} onChange={e => setDishForm(f => ({...f, allergens: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Dish Image</label>
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setImageMode("upload")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${imageMode === "upload" ? "bg-[var(--primary)] text-white" : "bg-[var(--input)] text-[var(--text)] border border-[var(--border)]"}`}
                        >
                          <Upload size={12} /> Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageMode("url")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${imageMode === "url" ? "bg-[var(--primary)] text-white" : "bg-[var(--input)] text-[var(--text)] border border-[var(--border)]"}`}
                        >
                          <Image size={12} /> Image URL
                        </button>
                      </div>
                      {imageMode === "upload" ? (
                        <div>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }}
                            className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[var(--primary)] transition file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[var(--primary)] file:text-white"
                          />
                          {imageUploading && <div className="mt-2"><div className="flex items-center gap-2"><RefreshCw size={12} className="animate-spin text-[var(--text-muted)]" /><span className="text-xs text-[var(--text-muted)]">{uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : "Compressing..."}</span></div>{uploadProgress > 0 && <div className="mt-1 h-1.5 rounded-full bg-[var(--input)] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div>}</div>}
                        </div>
                      ) : (
                        <input type="text" placeholder="https://... (image URL)" value={dishForm.image} onChange={e => setDishForm(f => ({...f, image: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      )}
                      {dishForm.image && (
                        <div className="mt-3 relative inline-block">
                          <img src={dishForm.image} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-[var(--border)]" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <button type="button" onClick={() => setDishForm(f => ({...f, image: ''}))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition">
                            <X size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6 pt-5 border-t border-[var(--border)]">
                  <button onClick={() => { resetDishForm(); setActivePage("menu"); }} className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium transition hover:opacity-80" style={{ background: "var(--input)", color: "var(--text)" }}>
                    Cancel
                  </button>
                  <button disabled={dishSubmitting} onClick={() => submitDish(false)} className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text)] border border-[var(--border)] transition hover:opacity-80 disabled:opacity-50">
                    Save as Draft
                  </button>
                  <button disabled={dishSubmitting} onClick={() => submitDish(true)} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90 btn-premium disabled:opacity-50">
                    {dishSubmitting ? "Saving..." : editingItem ? "Update Dish" : "Publish Dish"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Add Cake Form */}
          {activePage === "add-cake" && (
            <>
              <div
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
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

              <div className="rounded-2xl glass-card p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Cake Name *</label>
                      <input type="text" placeholder="e.g. Chocolate Truffle, Red Velvet" value={dishForm.name} onChange={e => setDishForm(f => ({...f, name: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Category *</label>
                      <select value={dishForm.categoryId} onChange={e => setDishForm(f => ({...f, categoryId: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[var(--primary)] transition">
                        <option value="">Select a category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => setShowSuggestCategory(true)} className="text-[11px] text-primary hover:underline mt-1 inline-block">Can&apos;t find your category? Suggest one</button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Description</label>
                      <textarea rows={3} placeholder="Describe flavour, layers, frosting..." value={dishForm.description} onChange={e => setDishForm(f => ({...f, description: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition resize-none" />
                    </div>

                    {/* Egg / Eggless Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-2">Egg / Eggless *</label>
                      <div className="flex gap-3">
                        <label className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${!dishForm.isVeg ? 'border-[#F59E0B] bg-[rgba(245,158,11,0.06)]' : 'border-[var(--border)]'}`}>
                          <input type="radio" name="eggType" value="egg" checked={!dishForm.isVeg} onChange={() => setDishForm(f => ({...f, isVeg: false}))} className="accent-[#F59E0B]" />
                          <span className="text-xl">🥚</span>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text)]">Egg</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Contains egg</p>
                          </div>
                        </label>
                        <label className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${dishForm.isVeg ? 'border-[#10B981] bg-[rgba(16,185,129,0.06)]' : 'border-[var(--border)]'}`}>
                          <input type="radio" name="eggType" value="eggless" checked={dishForm.isVeg} onChange={() => setDishForm(f => ({...f, isVeg: true}))} className="accent-[#10B981]" />
                          <span className="text-xl">🌱</span>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text)]">Eggless</p>
                            <p className="text-[10px] text-[var(--text-muted)]">100% eggless</p>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Egg Option</label>
                      <div className="flex flex-wrap gap-2">
                        {[{ label: "None", val: "" }, { label: "Egg", val: "egg" }, { label: "Eggless", val: "eggless" }, { label: "Both", val: "both" }].map((opt) => (
                          <label key={opt.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer hover:border-[var(--primary)] transition text-xs ${dishForm.eggOption === opt.val ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.06)]' : 'border-[var(--border)]'}`}>
                            <input type="radio" name="cakeEggOption" checked={dishForm.eggOption === opt.val} onChange={() => setDishForm(f => ({...f, eggOption: opt.val}))} className="accent-[var(--primary)]" />
                            <span className="text-sm text-[var(--text)]">{opt.label}</span>
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
                        <input type="number" placeholder="0.00" value={dishForm.price} onChange={e => setDishForm(f => ({...f, price: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Serving Size</label>
                        <input type="text" placeholder="e.g. 1 kg, 8-10 persons" value={dishForm.servingSize} onChange={e => setDishForm(f => ({...f, servingSize: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Prep Time (mins)</label>
                        <input type="number" placeholder="e.g. 240" value={dishForm.prepTime} onChange={e => setDishForm(f => ({...f, prepTime: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Offer Price (&pound;)</label>
                        <input type="number" placeholder="Special offer price" value={dishForm.offerPrice} onChange={e => setDishForm(f => ({...f, offerPrice: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Allergen Info</label>
                      <input type="text" placeholder="e.g. Contains dairy, gluten, nuts" value={dishForm.allergens} onChange={e => setDishForm(f => ({...f, allergens: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Cake Image</label>
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setImageMode("upload")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${imageMode === "upload" ? "bg-[var(--primary)] text-white" : "bg-[var(--input)] text-[var(--text)] border border-[var(--border)]"}`}
                        >
                          <Upload size={12} /> Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageMode("url")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${imageMode === "url" ? "bg-[var(--primary)] text-white" : "bg-[var(--input)] text-[var(--text)] border border-[var(--border)]"}`}
                        >
                          <Image size={12} /> Image URL
                        </button>
                      </div>
                      {imageMode === "upload" ? (
                        <div>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }}
                            className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[var(--primary)] transition file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[var(--primary)] file:text-white"
                          />
                          {imageUploading && <div className="mt-2"><div className="flex items-center gap-2"><RefreshCw size={12} className="animate-spin text-[var(--text-muted)]" /><span className="text-xs text-[var(--text-muted)]">{uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : "Compressing..."}</span></div>{uploadProgress > 0 && <div className="mt-1 h-1.5 rounded-full bg-[var(--input)] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div>}</div>}
                        </div>
                      ) : (
                        <input type="text" placeholder="https://... (image URL)" value={dishForm.image} onChange={e => setDishForm(f => ({...f, image: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition" />
                      )}
                      {dishForm.image && (
                        <div className="mt-3 relative inline-block">
                          <img src={dishForm.image} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-[var(--border)]" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <button type="button" onClick={() => setDishForm(f => ({...f, image: ''}))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition">
                            <X size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6 pt-5 border-t border-[var(--border)]">
                  <button onClick={() => { resetDishForm(); setActivePage("products"); setActiveProductTab("Cakes"); }} className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium transition hover:opacity-80" style={{ background: "var(--input)", color: "var(--text)" }}>
                    Cancel
                  </button>
                  <button disabled={dishSubmitting} onClick={() => submitDish(false)} className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text)] border border-[var(--border)] transition hover:opacity-80 disabled:opacity-50">
                    Save as Draft
                  </button>
                  <button disabled={dishSubmitting} onClick={() => submitDish(true)} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90 btn-premium disabled:opacity-50">
                    {dishSubmitting ? "Saving..." : "Publish Cake"}
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
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient"
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
              <div className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-2 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:overflow-visible mb-6">
                {PLANS.map((plan, i) => {
                  const PlanIcon = plan.icon;
                  const isCurrent = plan.name === currentPlan;
                  return (
                    <div
                      key={i}
                      className="relative rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl min-w-[280px] sm:min-w-0 flex-shrink-0 sm:flex-shrink"
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
                        onClick={() => {
                          if (!isCurrent) {
                            setToast({ message: "To change your plan, please contact support at support@homeal.uk", type: "error" });
                          }
                        }}
                        disabled={isCurrent}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90 disabled:cursor-default"
                        style={
                          isCurrent
                            ? { background: plan.bg, color: plan.color, border: `1px solid ${plan.borderColor}` }
                            : { background: plan.color, color: "#FFFFFF" }
                        }
                      >
                        {isCurrent ? "Current Plan" : "Contact to Upgrade"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Plan Comparison - Mobile Stacked Cards */}
              <div className="sm:hidden mb-6 space-y-4">
                <h3 className="text-sm font-semibold text-[var(--text)] mb-2">Plan Comparison</h3>
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
                  <div key={ri} className="rounded-xl border border-[var(--border)] p-3" style={{ background: "var(--header-bg)" }}>
                    <p className="text-xs font-semibold text-[var(--text)] mb-2">{row.feature}</p>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="text-center">
                        <span className="block text-[9px] font-bold mb-0.5" style={{ color: "#10B981" }}>Starter</span>
                        <span className="text-[var(--text-muted)]">{row.starter}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[9px] font-bold mb-0.5" style={{ color: "#3B82F6" }}>Growth</span>
                        <span className="text-[var(--text-muted)]">{row.growth}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[9px] font-bold mb-0.5" style={{ color: "#8B5CF6" }}>Unlimited</span>
                        <span className="text-[var(--text-muted)]">{row.unlimited}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Plan Comparison - Desktop Table */}
              <div className="hidden sm:block rounded-2xl glass-card p-6">
                <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Plan Comparison</h3>
                <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                  <table className="w-full text-xs min-w-[520px]">
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

              {/* Kitchen Profile */}
              <div className="mt-6 rounded-2xl glass-card p-5 mb-6">
                <h3 className="text-sm font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  <MapPin size={16} style={{ color: "#8B5CF6" }} /> Kitchen Location & Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Kitchen Name</label>
                    <input
                      type="text"
                      defaultValue={chefProfile?.kitchenName || ""}
                      onBlur={async (e) => {
                        const token = localStorage.getItem("homeal_token");
                        if (!token || !e.target.value.trim() || e.target.value === (chefProfile?.kitchenName || "")) return;
                        try {
                          await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ kitchenName: e.target.value.trim() }) });
                          showToast("Kitchen name updated");
                        } catch { showToast("Failed to update kitchen name", "error"); }
                      }}
                      placeholder="Your kitchen name"
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Business Name</label>
                    <input
                      type="text"
                      defaultValue={chefProfile?.businessName || ""}
                      onBlur={async (e) => {
                        const token = localStorage.getItem("homeal_token");
                        if (!token || e.target.value === (chefProfile?.businessName || "")) return;
                        try {
                          await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ businessName: e.target.value.trim() || null }) });
                          showToast("Business name updated");
                        } catch { showToast("Failed to update business name", "error"); }
                      }}
                      placeholder="Legal business name (optional)"
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition"
                    />
                  </div>
                  {/* Postcode Lookup — validates postcode, auto-fills city + geo */}
                  <div className="sm:col-span-2">
                    <PostcodeLookup
                      initialPostcode={chefProfile?.postcode || ""}
                      placeholder="e.g. WD17 4BX"
                      onAddressSelected={async (addr) => {
                        const token = localStorage.getItem("homeal_token");
                        if (!token) return;
                        try {
                          await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ address: [addr.line1, addr.line2].filter(Boolean).join(", "), postcode: addr.postcode, city: addr.city, county: addr.county }) });
                          showToast("Address updated from lookup");
                        } catch { showToast("Failed to update address", "error"); }
                      }}
                      onPostcodeResolved={async (data) => {
                        const token = localStorage.getItem("homeal_token");
                        if (!token) return;
                        try {
                          await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ postcode: data.postcode, city: data.city }) });
                          showToast("Postcode validated — city updated");
                        } catch { showToast("Failed to update postcode", "error"); }
                      }}
                      onManualEntry={() => {}}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Address</label>
                    <textarea
                      defaultValue={chefProfile?.address || ""}
                      onBlur={async (e) => {
                        const token = localStorage.getItem("homeal_token");
                        if (!token || e.target.value === (chefProfile?.address || "")) return;
                        try {
                          await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ address: e.target.value }) });
                          showToast("Address updated");
                        } catch { showToast("Failed to update address", "error"); }
                      }}
                      rows={2}
                      placeholder="Full kitchen address"
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Postcode</label>
                    <input
                      type="text"
                      defaultValue={chefProfile?.postcode || ""}
                      onBlur={async (e) => {
                        const val = e.target.value.trim().toUpperCase();
                        const token = localStorage.getItem("homeal_token");
                        if (!token || val === (chefProfile?.postcode || "")) return;
                        if (val && !/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(val)) { showToast("Invalid UK postcode", "error"); return; }
                        try {
                          await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ postcode: val }) });
                          showToast("Postcode updated — location recalculated");
                        } catch { showToast("Failed to update postcode", "error"); }
                      }}
                      placeholder="e.g. WD17 4BX"
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">City / Town</label>
                    <input
                      type="text"
                      defaultValue={chefProfile?.city || ""}
                      onBlur={async (e) => {
                        const token = localStorage.getItem("homeal_token");
                        if (!token || e.target.value === (chefProfile?.city || "")) return;
                        try {
                          await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ city: e.target.value.trim() }) });
                          showToast("City updated");
                        } catch { showToast("Failed to update city", "error"); }
                      }}
                      placeholder="e.g. Watford"
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">County</label>
                    <input
                      type="text"
                      defaultValue={chefProfile?.county || ""}
                      onBlur={async (e) => {
                        const token = localStorage.getItem("homeal_token");
                        if (!token || e.target.value === (chefProfile?.county || "")) return;
                        try {
                          await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ county: e.target.value.trim() }) });
                          showToast("County updated");
                        } catch { showToast("Failed to update county", "error"); }
                      }}
                      placeholder="e.g. Hertfordshire"
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Contact Person</label>
                    <input
                      type="text"
                      defaultValue={chefProfile?.contactPerson || chefProfile?.user?.name || ""}
                      onBlur={async (e) => {
                        const token = localStorage.getItem("homeal_token");
                        if (!token || e.target.value === (chefProfile?.contactPerson || "")) return;
                        try {
                          await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ contactPerson: e.target.value.trim() }) });
                          showToast("Contact person updated");
                        } catch { showToast("Failed to update", "error"); }
                      }}
                      placeholder="Contact person name"
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Contact Phone</label>
                    <input
                      type="tel"
                      defaultValue={chefProfile?.contactPhone || chefProfile?.user?.phone || ""}
                      onBlur={async (e) => {
                        const token = localStorage.getItem("homeal_token");
                        if (!token || e.target.value === (chefProfile?.contactPhone || "")) return;
                        try {
                          await authFetch(`${ADMIN_API_URL}/api/v1/chefs/me`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ contactPhone: e.target.value.trim() }) });
                          showToast("Contact phone updated");
                        } catch { showToast("Failed to update", "error"); }
                      }}
                      placeholder="+44 7700 900123"
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition"
                    />
                  </div>
                </div>
                {!chefProfile?.postcode && (
                  <p className="text-xs text-amber-500 mt-3 flex items-center gap-1.5"><AlertCircle size={12} /> Add your postcode to appear in customer search results</p>
                )}
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
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                        <ChefHat size={24} color="white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-[var(--text)]">{chefProfile?.kitchenName || "Your Kitchen"}</h5>
                          <span className="text-xs text-[var(--text-muted)]">0.8 miles away</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} size={10} style={{ color: "#F59E0B" }} fill={s <= Math.round(chefProfile?.avgRating || 0) ? "#F59E0B" : "none"} />)}
                          <span className="text-[10px] text-[var(--text-muted)] ml-1">{(chefProfile?.avgRating || 0).toFixed(1)} ({chefProfile?.totalReviews || 0} reviews)</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">{chefProfile?.cuisineTypes || "Your cuisine types"}</p>
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

              {/* Kitchen Operations */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  <ChefHat size={16} style={{ color: "#FF5A1F" }} /> Kitchen Operations
                </h3>

                {/* Kitchen Status Toggle */}
                <div
                  className="rounded-2xl border p-5 mb-5 transition-all"
                  style={{
                    background: kitchenOnline ? "rgba(16,185,129,0.05)" : "rgba(239,68,68,0.05)",
                    borderColor: kitchenOnline ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: kitchenOnline ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }}>
                        <Power size={24} style={{ color: kitchenOnline ? "#10B981" : "#EF4444" }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold" style={{ color: kitchenOnline ? "#10B981" : "#EF4444" }}>
                          {kitchenOnline ? "Kitchen Open" : "Kitchen Closed"}
                        </h4>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {kitchenOnline ? "Customers can see and order from your menu" : "Your kitchen is hidden from customers"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        const newVal = !kitchenOnline;
                        setKitchenOnline(newVal);
                        await updateChefProfile({ isOnline: newVal });
                      }}
                      className="relative w-14 h-8 rounded-full transition-all flex-shrink-0"
                      style={{ background: kitchenOnline ? "#10B981" : "#EF4444" }}
                    >
                      <div className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all" style={{ left: kitchenOnline ? "30px" : "4px" }} />
                    </button>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="rounded-2xl border border-[var(--border)] p-5 mb-5" style={{ background: "var(--header-bg)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                      <Clock size={14} style={{ color: "#3B82F6" }} /> Operating Hours
                    </h4>
                    <button
                      onClick={() => updateChefProfile({ operatingHours: JSON.stringify(operatingHours) })}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 btn-premium flex items-center gap-1.5"
                    >
                      <Save size={12} /> Save Hours
                    </button>
                  </div>
                  <div className="space-y-3">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex items-center gap-3 flex-wrap">
                        <div className="w-24 flex items-center gap-2">
                          <button
                            onClick={() => setOperatingHours(prev => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }))}
                            className="relative w-9 h-5 rounded-full transition-all flex-shrink-0"
                            style={{ background: operatingHours[day]?.enabled ? "#10B981" : "var(--border)" }}
                          >
                            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all" style={{ left: operatingHours[day]?.enabled ? "18px" : "2px" }} />
                          </button>
                          <span className="text-xs font-medium text-[var(--text)] w-12">{day.slice(0, 3)}</span>
                        </div>
                        {operatingHours[day]?.enabled ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={operatingHours[day]?.open || "09:00"}
                              onChange={e => setOperatingHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}
                              className="px-2 py-1.5 rounded-lg text-xs border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[#3B82F6] transition"
                            />
                            <span className="text-xs text-[var(--text-muted)]">to</span>
                            <input
                              type="time"
                              value={operatingHours[day]?.close || "21:00"}
                              onChange={e => setOperatingHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}
                              className="px-2 py-1.5 rounded-lg text-xs border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[#3B82F6] transition"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kitchen Operations */}
                <div className="rounded-2xl border border-[var(--border)] p-5 mb-5" style={{ background: "var(--header-bg)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                      <Timer size={14} style={{ color: "#F59E0B" }} /> Kitchen Operations
                    </h4>
                    <button
                      onClick={() => updateChefProfile({
                        dailyOrderCap: chefProfile?.dailyOrderCap ?? null,
                        orderCutoffTime: chefProfile?.orderCutoffTime ?? null,
                        vacationStart: chefProfile?.vacationStart ? new Date(chefProfile.vacationStart).toISOString().split("T")[0] : null,
                        vacationEnd: chefProfile?.vacationEnd ? new Date(chefProfile.vacationEnd).toISOString().split("T")[0] : null,
                      })}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 btn-premium flex items-center gap-1.5"
                    >
                      <Save size={12} /> Save
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Daily Order Cap</label>
                      <p className="text-[10px] text-[var(--text-muted)] mb-2">Maximum orders per day (leave empty for unlimited)</p>
                      <input
                        type="number"
                        min="0"
                        placeholder="Unlimited"
                        value={chefProfile?.dailyOrderCap ?? ""}
                        onChange={e => setChefProfile((p: any) => ({ ...p, dailyOrderCap: e.target.value ? parseInt(e.target.value) : null }))}
                        className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#F59E0B] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Order Cutoff Time</label>
                      <p className="text-[10px] text-[var(--text-muted)] mb-2">Customers cannot order same-day after this time</p>
                      <input
                        type="time"
                        value={chefProfile?.orderCutoffTime || ""}
                        onChange={e => setChefProfile((p: any) => ({ ...p, orderCutoffTime: e.target.value || null }))}
                        className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[#F59E0B] transition"
                      />
                    </div>
                  </div>

                  {/* Vacation Mode */}
                  <div className="rounded-xl p-4 border" style={{
                    background: (chefProfile?.vacationStart && chefProfile?.vacationEnd) ? "rgba(245,158,11,0.05)" : "var(--input)",
                    borderColor: (chefProfile?.vacationStart && chefProfile?.vacationEnd) ? "rgba(245,158,11,0.3)" : "var(--border)",
                  }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={14} style={{ color: "#F59E0B" }} />
                      <span className="text-xs font-semibold text-[var(--text)]">Vacation Mode</span>
                      {chefProfile?.vacationStart && chefProfile?.vacationEnd && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ color: "#F59E0B", background: "rgba(245,158,11,0.12)" }}>Active</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mb-3">Your kitchen will be hidden from customers during these dates</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-[var(--text-muted)] mb-1">Start Date</label>
                        <input
                          type="date"
                          value={chefProfile?.vacationStart ? new Date(chefProfile.vacationStart).toISOString().split("T")[0] : ""}
                          onChange={e => setChefProfile((p: any) => ({ ...p, vacationStart: e.target.value || null }))}
                          className="w-full px-3 py-2 rounded-lg text-xs border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[#F59E0B] transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[var(--text-muted)] mb-1">End Date</label>
                        <input
                          type="date"
                          value={chefProfile?.vacationEnd ? new Date(chefProfile.vacationEnd).toISOString().split("T")[0] : ""}
                          onChange={e => setChefProfile((p: any) => ({ ...p, vacationEnd: e.target.value || null }))}
                          className="w-full px-3 py-2 rounded-lg text-xs border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[#F59E0B] transition"
                        />
                      </div>
                    </div>
                    {chefProfile?.vacationStart && chefProfile?.vacationEnd && (
                      <button
                        onClick={() => {
                          setChefProfile((p: any) => ({ ...p, vacationStart: null, vacationEnd: null }));
                          updateChefProfile({ vacationStart: null, vacationEnd: null });
                        }}
                        className="mt-3 px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition"
                        style={{ color: "#EF4444", background: "rgba(239,68,68,0.08)" }}
                      >
                        <X size={12} /> Cancel Vacation
                      </button>
                    )}
                  </div>
                </div>

                {/* Bank Details */}
                <div className="rounded-2xl border border-[var(--border)] p-5" style={{ background: "var(--header-bg)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                      <Wallet size={14} style={{ color: "#8B5CF6" }} /> Bank Details
                    </h4>
                    <button
                      onClick={() => updateChefProfile({ bankDetails: JSON.stringify(bankDetails) })}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 btn-premium flex items-center gap-1.5"
                    >
                      <Save size={12} /> Save
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mb-4">Your earnings will be paid to this account</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Barclays"
                        value={bankDetails.bankName}
                        onChange={e => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Account Number</label>
                      <input
                        type="text"
                        placeholder="12345678"
                        value={bankDetails.accountNumber}
                        onChange={e => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Sort Code</label>
                      <input
                        type="text"
                        placeholder="12-34-56"
                        value={bankDetails.sortCode}
                        onChange={e => setBankDetails(prev => ({ ...prev, sortCode: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Online Payments */}
                <div className="rounded-2xl border border-[var(--border)] p-5 mt-5" style={{ background: "var(--header-bg)" }}>
                  <h4 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2 mb-1">
                    <CreditCard size={14} style={{ color: "#3B82F6" }} /> Online Payments
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] mb-5">Configure payment providers to accept online payments from customers</p>

                  <div className="space-y-5">
                    {/* Stripe Connect */}
                    <div className="rounded-xl border border-[var(--border)] p-4" style={{ background: "var(--card-bg)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-semibold text-[var(--text)]">Stripe Connect</h5>
                          {paymentConfig?.stripeConnectEnabled && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-700 bg-emerald-100">
                              <Check size={10} /> Connected
                            </span>
                          )}
                        </div>
                        <button
                          onClick={setupStripeConnect}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 flex items-center gap-1.5"
                          style={{ background: "#635BFF" }}
                        >
                          <ExternalLink size={12} /> {paymentConfig?.stripeConnectEnabled ? "Manage" : "Set Up Stripe Connect"}
                        </button>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)]">Recommended: Let Stripe handle payments, payouts, and compliance. No API keys needed.</p>
                    </div>

                    {/* Direct Stripe Keys */}
                    <div className="rounded-xl border border-[var(--border)] p-4" style={{ background: "var(--card-bg)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xs font-semibold text-[var(--text)]">Direct Stripe Keys</h5>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => testPaymentConnection("stripe")}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text)] border border-[var(--border)] transition hover:opacity-80 flex items-center gap-1.5"
                          >
                            <Zap size={10} /> Test Connection
                          </button>
                          <button
                            onClick={() => savePaymentConfig({ stripeSecretKey, stripePublishableKey })}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 btn-premium flex items-center gap-1.5"
                          >
                            <Save size={12} /> Save
                          </button>
                        </div>
                      </div>
                      {paymentTestResult && (
                        <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-medium ${paymentTestResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {paymentTestResult.message}
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Secret Key</label>
                          <input
                            type="password"
                            placeholder="sk_live_..."
                            value={stripeSecretKey}
                            onChange={e => setStripeSecretKey(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#635BFF] transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Publishable Key</label>
                          <input
                            type="password"
                            placeholder="pk_live_..."
                            value={stripePublishableKey}
                            onChange={e => setStripePublishableKey(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#635BFF] transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PayPal */}
                    <div className="rounded-xl border border-[var(--border)] p-4" style={{ background: "var(--card-bg)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xs font-semibold text-[var(--text)]">PayPal</h5>
                        <button
                          onClick={() => savePaymentConfig({ paypalClientId, paypalSecretKey })}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 btn-premium flex items-center gap-1.5"
                        >
                          <Save size={12} /> Save
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Client ID</label>
                          <input
                            type="text"
                            placeholder="PayPal Client ID"
                            value={paypalClientId}
                            onChange={e => setPaypalClientId(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#0070BA] transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Secret Key</label>
                          <input
                            type="password"
                            placeholder="PayPal Secret Key"
                            value={paypalSecretKey}
                            onChange={e => setPaypalSecretKey(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#0070BA] transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Menu Scheduler Page */}
          {activePage === "scheduler" && (() => {
            const { from } = getScheduleRange();
            const weekStart = new Date(from + "T00:00:00");
            const days: { date: string; label: string; dayName: string; isToday: boolean }[] = [];
            for (let i = 0; i < 14; i++) {
              const d = new Date(weekStart);
              d.setDate(d.getDate() + i);
              const ds = d.toISOString().split("T")[0];
              days.push({
                date: ds,
                label: d.getDate().toString(),
                dayName: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],
                isToday: ds === new Date().toISOString().split("T")[0],
              });
            }
            const selectedDayData = scheduleData.find((d: any) => d.date === selectedDate);
            const selectedItems = selectedDayData?.items || [];
            const selectedIsClosed = selectedDayData?.isClosed || false;
            const selectedOrderCount = selectedDayData?.orderCount || 0;
            const selectedNotes = selectedDayData?.notes || "";

            return (
            <>
              {/* Scheduler Header */}
              <div className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-4 animate-fade-in-up">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                      <Calendar size={22} color="white" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-[var(--text)]">Menu Scheduler</h2>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">Plan your menus for the next 2 weeks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => fetchSchedule()} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "var(--input)" }}>
                      <RefreshCw size={16} className={`text-[var(--text-muted)] ${scheduleLoading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                      onClick={copyWeek}
                      disabled={schedulerSaving}
                      className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition hover:opacity-90 border border-[var(--border)]"
                      style={{ background: "var(--input)", color: "var(--text)" }}
                    >
                      <Repeat size={13} />
                      <span>Copy Week</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Two-Week Calendar Strip */}
              <div className="rounded-2xl glass-card px-3 sm:px-4 py-3 mb-4 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
                {/* Week labels */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">This Week</span>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Next Week</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-1.5">
                  {days.slice(0, 7).map((day) => {
                    const dayData = scheduleData.find((d: any) => d.date === day.date);
                    const itemCount = dayData?.items?.length || 0;
                    const isClosed = dayData?.isClosed;
                    const isSelected = selectedDate === day.date;
                    const orderCt = dayData?.orderCount || 0;
                    let bg = "var(--input)";
                    let border = "transparent";
                    if (isClosed) { bg = "rgba(239,68,68,0.08)"; border = "rgba(239,68,68,0.3)"; }
                    else if (itemCount > 0) { bg = "rgba(16,185,129,0.08)"; border = "rgba(16,185,129,0.3)"; }
                    if (isSelected) { border = "#8B5CF6"; }

                    return (
                      <button
                        key={day.date}
                        onClick={() => selectScheduleDate(day.date)}
                        className="flex flex-col items-center py-2 px-1 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: bg, border: `2px solid ${border}` }}
                      >
                        <span className={`text-[10px] font-medium ${day.isToday ? "text-[#8B5CF6]" : "text-[var(--text-muted)]"}`}>{day.dayName}</span>
                        <span className={`text-sm font-bold mt-0.5 ${day.isToday ? "text-[#8B5CF6]" : "text-[var(--text)]"}`}>{day.label}</span>
                        {itemCount > 0 && (
                          <span className="text-[9px] mt-0.5 font-medium" style={{ color: isClosed ? "#EF4444" : "#10B981" }}>
                            {isClosed ? "Closed" : `${itemCount} items`}
                          </span>
                        )}
                        {orderCt > 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full mt-0.5 font-semibold" style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6" }}>
                            {orderCt} orders
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {days.slice(7, 14).map((day) => {
                    const dayData = scheduleData.find((d: any) => d.date === day.date);
                    const itemCount = dayData?.items?.length || 0;
                    const isClosed = dayData?.isClosed;
                    const isSelected = selectedDate === day.date;
                    const orderCt = dayData?.orderCount || 0;
                    let bg = "var(--input)";
                    let border = "transparent";
                    if (isClosed) { bg = "rgba(239,68,68,0.08)"; border = "rgba(239,68,68,0.3)"; }
                    else if (itemCount > 0) { bg = "rgba(16,185,129,0.08)"; border = "rgba(16,185,129,0.3)"; }
                    if (isSelected) { border = "#8B5CF6"; }

                    return (
                      <button
                        key={day.date}
                        onClick={() => selectScheduleDate(day.date)}
                        className="flex flex-col items-center py-2 px-1 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: bg, border: `2px solid ${border}` }}
                      >
                        <span className={`text-[10px] font-medium ${day.isToday ? "text-[#8B5CF6]" : "text-[var(--text-muted)]"}`}>{day.dayName}</span>
                        <span className={`text-sm font-bold mt-0.5 ${day.isToday ? "text-[#8B5CF6]" : "text-[var(--text)]"}`}>{day.label}</span>
                        {itemCount > 0 && (
                          <span className="text-[9px] mt-0.5 font-medium" style={{ color: isClosed ? "#EF4444" : "#10B981" }}>
                            {isClosed ? "Closed" : `${itemCount} items`}
                          </span>
                        )}
                        {orderCt > 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full mt-0.5 font-semibold" style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6" }}>
                            {orderCt} orders
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-3 px-1">
                  <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />Has Items</span>
                  <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-red-400" />Closed</span>
                  <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full" style={{ background: "var(--text-muted)", opacity: 0.4 }} />Empty</span>
                </div>
              </div>

              {/* Selected Day Panel */}
              <div className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text)]">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-[var(--text-muted)]">{selectedItems.length} items</span>
                      <span className="text-[11px]" style={{ color: selectedIsClosed ? "#EF4444" : "#10B981" }}>
                        {selectedIsClosed ? "Closed" : "Open"}
                      </span>
                      {selectedOrderCount > 0 && (
                        <span className="text-[11px] font-medium" style={{ color: "#3B82F6" }}>{selectedOrderCount} orders</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => toggleDayClosed(selectedDate)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition border"
                      style={{
                        background: selectedIsClosed ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                        borderColor: selectedIsClosed ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
                        color: selectedIsClosed ? "#10B981" : "#EF4444",
                      }}
                    >
                      <Power size={12} />
                      {selectedIsClosed ? "Open Day" : "Close Day"}
                    </button>
                    <button
                      onClick={() => setSchedulerShowAddItem(!schedulerShowAddItem)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition btn-premium text-white"
                    >
                      <PlusCircle size={12} />
                      Add Item
                    </button>
                    <button
                      onClick={() => setSchedulerShowCopy(!schedulerShowCopy)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition border border-[var(--border)]"
                      style={{ background: "var(--input)", color: "var(--text)" }}
                    >
                      <Repeat size={12} />
                      Copy To...
                    </button>
                    {selectedItems.length > 0 && (
                      <button
                        onClick={() => setSchedulerShowTemplate(!schedulerShowTemplate)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition border border-[var(--border)]"
                        style={{ background: "var(--input)", color: "var(--text)" }}
                      >
                        <Save size={12} />
                        Save Template
                      </button>
                    )}
                  </div>
                </div>

                {/* Add Item Form */}
                {schedulerShowAddItem && (
                  <div className="rounded-xl p-4 mb-4 border border-[var(--border)]" style={{ background: "var(--input)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-[var(--text)]">Add Item to {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</h4>
                      <button onClick={() => setSchedulerShowAddItem(false)} className="text-[var(--text-muted)] hover:text-[var(--text)] transition"><X size={16} /></button>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex gap-1 mb-3 p-0.5 rounded-lg" style={{ background: "var(--bg)" }}>
                      <button onClick={() => setSchedulerAddMode("menu")} className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${schedulerAddMode === "menu" ? "bg-[#8B5CF6] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
                        From Menu
                      </button>
                      <button onClick={() => setSchedulerAddMode("new")} className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${schedulerAddMode === "new" ? "bg-[#8B5CF6] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
                        New Item
                      </button>
                    </div>

                    {schedulerAddMode === "menu" ? (
                      /* Pick from existing menu items */
                      <div>
                        {menuItems.length === 0 ? (
                          <p className="text-xs text-[var(--text-muted)] text-center py-4">No dishes yet. Create dishes in &quot;Add Dish&quot; first, or switch to &quot;New Item&quot;.</p>
                        ) : (
                          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                            {menuItems.map((dish: any) => {
                              const alreadyAdded = selectedItems.some((si: any) => si.name === dish.name);
                              return (
                                <div key={dish.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[var(--border)] hover:border-[rgba(139,92,246,0.3)] transition" style={{ background: "var(--bg)" }}>
                                  {dish.image ? (
                                    <img src={dish.image} alt={dish.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: dish.isVeg ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
                                      <span className="text-xs">{dish.isVeg ? "🥬" : "🍖"}</span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-[var(--text)] truncate block">{dish.name}</span>
                                    <span className="text-[11px] font-medium" style={{ color: "#8B5CF6" }}>£{typeof dish.price === "number" ? dish.price.toFixed(2) : dish.price}</span>
                                    {dish.category?.name && <span className="text-[10px] text-[var(--text-muted)] ml-2">{dish.category.name}</span>}
                                  </div>
                                  <button
                                    onClick={() => addExistingDishToSchedule(dish)}
                                    disabled={schedulerSaving || alreadyAdded}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${alreadyAdded ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "btn-premium text-white"} disabled:opacity-50`}
                                  >
                                    {alreadyAdded ? "Added" : schedulerSaving ? "..." : "+ Add"}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* New item form with all fields */
                      <div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Dish Name *</label>
                            <input type="text" placeholder="e.g. Chicken Biryani" value={schedulerNewItem.name} onChange={e => setSchedulerNewItem(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition" />
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Price (£) *</label>
                            <input type="number" placeholder="0.00" value={schedulerNewItem.price} onChange={e => setSchedulerNewItem(p => ({ ...p, price: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                          <div>
                            <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Category</label>
                            <select value={schedulerNewItem.categoryId} onChange={e => setSchedulerNewItem(p => ({ ...p, categoryId: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[#8B5CF6] transition">
                              <option value="">Select category</option>
                              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Offer Price (£)</label>
                            <input type="number" placeholder="Special offer" value={schedulerNewItem.offerPrice} onChange={e => setSchedulerNewItem(p => ({ ...p, offerPrice: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition" />
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Prep Time (mins)</label>
                            <input type="number" placeholder="e.g. 30" value={schedulerNewItem.prepTime} onChange={e => setSchedulerNewItem(p => ({ ...p, prepTime: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                          <div>
                            <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Serving Size</label>
                            <input type="text" placeholder="e.g. 1-2 persons" value={schedulerNewItem.servingSize} onChange={e => setSchedulerNewItem(p => ({ ...p, servingSize: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition" />
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Stock Count</label>
                            <input type="number" placeholder="Leave empty for unlimited" value={schedulerNewItem.stockCount} onChange={e => setSchedulerNewItem(p => ({ ...p, stockCount: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition" />
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Allergen Info</label>
                            <input type="text" placeholder="e.g. Contains dairy" value={schedulerNewItem.allergens} onChange={e => setSchedulerNewItem(p => ({ ...p, allergens: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="text-[10px] font-medium text-[var(--text-muted)] mb-1 block">Description</label>
                          <textarea placeholder="Describe your dish..." value={schedulerNewItem.description} onChange={e => setSchedulerNewItem(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition resize-none" />
                        </div>

                        {/* Diet type + Egg option row */}
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] font-medium text-[var(--text-muted)]">Diet:</label>
                            <label className="flex items-center gap-1.5 text-xs text-[var(--text)]">
                              <input type="radio" name="schedVeg" checked={schedulerNewItem.isVeg} onChange={() => setSchedulerNewItem(p => ({ ...p, isVeg: true }))} className="accent-emerald-500" />
                              Veg
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-[var(--text)]">
                              <input type="radio" name="schedVeg" checked={!schedulerNewItem.isVeg} onChange={() => setSchedulerNewItem(p => ({ ...p, isVeg: false }))} className="accent-red-500" />
                              Non-Veg
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] font-medium text-[var(--text-muted)]">Egg:</label>
                            <select value={schedulerNewItem.eggOption} onChange={e => setSchedulerNewItem(p => ({ ...p, eggOption: e.target.value }))} className="px-2 py-1 rounded-lg text-xs border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[#8B5CF6] transition">
                              <option value="">None</option>
                              <option value="egg">Egg</option>
                              <option value="eggless">Eggless</option>
                              <option value="both">Both</option>
                            </select>
                          </div>
                        </div>

                        {/* Image upload */}
                        <div className="flex items-center gap-2 mt-3">
                          <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] cursor-pointer hover:border-[#8B5CF6] transition">
                            <Upload size={12} />
                            {imageUploading ? "Uploading..." : "Upload Image"}
                            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleSchedulerImageUpload(file, "new"); }} />
                          </label>
                          {schedulerNewItem.image && (
                            <div className="relative">
                              <img src={schedulerNewItem.image} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-[var(--border)]" />
                              <button type="button" onClick={() => setSchedulerNewItem(p => ({ ...p, image: "" }))} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"><X size={8} /></button>
                            </div>
                          )}
                        </div>

                        {/* Submit */}
                        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                          <button onClick={() => setSchedulerShowAddItem(false)} className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:opacity-80 transition">Cancel</button>
                          <button
                            onClick={addSchedulerItem}
                            disabled={schedulerSaving || !schedulerNewItem.name || !schedulerNewItem.price}
                            className="px-4 py-1.5 rounded-lg text-xs font-medium text-white btn-premium transition disabled:opacity-50"
                          >
                            {schedulerSaving ? "Adding..." : "Add Item"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Copy To Panel */}
                {schedulerShowCopy && (
                  <div className="rounded-xl p-4 mb-4 border border-[var(--border)]" style={{ background: "var(--input)" }}>
                    <h4 className="text-xs font-semibold text-[var(--text)] mb-3">Copy menu to other dates</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {days.filter(d => d.date !== selectedDate).map((day) => {
                        const isSelected = schedulerCopyTarget.includes(day.date);
                        return (
                          <button
                            key={day.date}
                            onClick={() => setSchedulerCopyTarget(prev => isSelected ? prev.filter(d => d !== day.date) : [...prev, day.date])}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition border"
                            style={{
                              background: isSelected ? "rgba(139,92,246,0.1)" : "var(--bg)",
                              borderColor: isSelected ? "#8B5CF6" : "var(--border)",
                              color: isSelected ? "#8B5CF6" : "var(--text)",
                            }}
                          >
                            {day.dayName} {day.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSchedulerShowCopy(false); setSchedulerCopyTarget([]); }} className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:opacity-80 transition">Cancel</button>
                      <button
                        onClick={copyDayTo}
                        disabled={schedulerSaving || schedulerCopyTarget.length === 0}
                        className="px-4 py-1.5 rounded-lg text-xs font-medium text-white btn-premium transition disabled:opacity-50"
                      >
                        {schedulerSaving ? "Copying..." : `Copy to ${schedulerCopyTarget.length} day(s)`}
                      </button>
                    </div>
                  </div>
                )}

                {/* Save as Template Panel */}
                {schedulerShowTemplate && (
                  <div className="rounded-xl p-4 mb-4 border border-[var(--border)]" style={{ background: "var(--input)" }}>
                    <h4 className="text-xs font-semibold text-[var(--text)] mb-3">Save current menu as template</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Template name (e.g. Monday Special)"
                        value={schedulerTemplateName}
                        onChange={e => setSchedulerTemplateName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition"
                      />
                      <button onClick={() => setSchedulerShowTemplate(false)} className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:opacity-80 transition">Cancel</button>
                      <button
                        onClick={saveAsTemplate}
                        disabled={schedulerSaving || !schedulerTemplateName.trim()}
                        className="px-4 py-1.5 rounded-lg text-xs font-medium text-white btn-premium transition disabled:opacity-50"
                      >
                        {schedulerSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Day Notes */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MessageSquare size={12} className="text-[var(--text-muted)]" />
                    <span className="text-[11px] font-medium text-[var(--text-muted)]">Day Notes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add a note for this day..."
                      value={schedulerDayNotes}
                      onChange={e => setSchedulerDayNotes(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition"
                    />
                    <button
                      onClick={() => updateDayNotes(selectedDate, schedulerDayNotes)}
                      className="px-3 py-2 rounded-lg text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition border border-[var(--border)]"
                      style={{ background: "var(--input)" }}
                    >
                      <Save size={13} />
                    </button>
                  </div>
                </div>

                {/* Items List */}
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8">
                    <UtensilsCrossed size={32} className="mx-auto mb-2 text-[var(--text-muted)] opacity-40" />
                    <p className="text-xs text-[var(--text-muted)]">No items for this day</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">Add items or apply a template to get started</p>
                  </div>
                ) : (
                  <>
                  <div className="space-y-2">
                    {selectedItems.map((item: any, idx: number) => (
                      <div key={item.id || idx}>
                        {/* Inline edit form */}
                        {schedulerEditItem === item.id ? (
                          <div className="rounded-xl p-3 border-2 border-[#8B5CF6] space-y-2" style={{ background: "var(--input)" }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input type="text" placeholder="Dish name *" value={schedulerEditForm.name} onChange={e => setSchedulerEditForm(p => ({ ...p, name: e.target.value }))} className="px-3 py-2 rounded-lg text-xs border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[#8B5CF6] transition" />
                              <input type="number" placeholder="Price (£) *" value={schedulerEditForm.price} onChange={e => setSchedulerEditForm(p => ({ ...p, price: e.target.value }))} className="px-3 py-2 rounded-lg text-xs border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[#8B5CF6] transition" />
                              <input type="text" placeholder="Description" value={schedulerEditForm.description} onChange={e => setSchedulerEditForm(p => ({ ...p, description: e.target.value }))} className="px-3 py-2 rounded-lg text-xs border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[#8B5CF6] transition" />
                              <input type="number" placeholder="Stock count" value={schedulerEditForm.stockCount} onChange={e => setSchedulerEditForm(p => ({ ...p, stockCount: e.target.value }))} className="px-3 py-2 rounded-lg text-xs border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[#8B5CF6] transition" />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] cursor-pointer hover:border-[#8B5CF6] transition">
                                <Upload size={11} />
                                {imageUploading ? "Uploading..." : "Image"}
                                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleSchedulerImageUpload(file, "edit"); }} />
                              </label>
                              {schedulerEditForm.image && (
                                <div className="relative">
                                  <img src={schedulerEditForm.image} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-[var(--border)]" />
                                  <button type="button" onClick={() => setSchedulerEditForm(p => ({ ...p, image: "" }))} className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center"><X size={7} /></button>
                                </div>
                              )}
                              <label className="flex items-center gap-1.5 text-xs text-[var(--text)]">
                                <input type="checkbox" checked={schedulerEditForm.isVeg} onChange={e => setSchedulerEditForm(p => ({ ...p, isVeg: e.target.checked }))} className="accent-emerald-500" />
                                Veg
                              </label>
                              <div className="flex-1" />
                              <button onClick={() => setSchedulerEditItem(null)} className="px-2.5 py-1 rounded-lg text-[11px] text-[var(--text-muted)] hover:opacity-80 transition">Cancel</button>
                              <button
                                onClick={() => schedulerDayMenu?.id && editSchedulerItem(schedulerDayMenu.id, item.id)}
                                disabled={schedulerSaving || !schedulerEditForm.name || !schedulerEditForm.price}
                                className="px-3 py-1 rounded-lg text-[11px] font-medium text-white btn-premium transition disabled:opacity-50"
                              >
                                {schedulerSaving ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Normal item display */
                          <div
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition hover:border-[rgba(139,92,246,0.3)] ${!item.isAvailable ? "opacity-60 border-red-200 dark:border-red-900" : "border-[var(--border)]"}`}
                            style={{ background: "var(--input)" }}
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.isVeg ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
                                <span className="text-sm">{item.isVeg ? "🥬" : "🍖"}</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[var(--text)] truncate">{item.name}</span>
                                {item.isVeg && <span className="w-3 h-3 rounded-sm border-2 border-emerald-500 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></span>}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-semibold" style={{ color: "#8B5CF6" }}>£{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</span>
                                {item.offerPrice && <span className="text-[10px] line-through text-[var(--text-muted)]">£{item.offerPrice}</span>}
                                {item.stockCount !== null && item.stockCount !== undefined && (
                                  <span className="text-[10px] text-[var(--text-muted)]">Stock: {item.stockCount}</span>
                                )}
                                {!item.isAvailable && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-medium">Sold Out</span>
                                )}
                              </div>
                            </div>
                            {/* Sold Out toggle */}
                            <button
                              onClick={() => schedulerDayMenu?.id && toggleItemSoldOut(schedulerDayMenu.id, item.id)}
                              className={`p-1.5 rounded-lg transition ${item.isAvailable ? "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-[var(--text-muted)] hover:text-amber-600" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"}`}
                              title={item.isAvailable ? "Mark sold out" : "Mark available"}
                            >
                              <Power size={14} />
                            </button>
                            {/* Edit button */}
                            <button
                              onClick={() => {
                                setSchedulerEditItem(item.id);
                                setSchedulerEditForm({
                                  name: item.name || "",
                                  price: typeof item.price === 'number' ? item.price.toString() : item.price || "",
                                  description: item.description || "",
                                  stockCount: item.stockCount != null ? item.stockCount.toString() : "",
                                  image: item.image || "",
                                  isVeg: item.isVeg ?? true,
                                });
                              }}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-[var(--text-muted)] hover:text-blue-500"
                              title="Edit item"
                            >
                              <Pencil size={14} />
                            </button>
                            {/* Delete button */}
                            <button
                              onClick={() => schedulerDayMenu?.id && deleteSchedulerItem(schedulerDayMenu.id, item.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-[var(--text-muted)] hover:text-red-500"
                              title="Delete item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bulk Price Update */}
                  {selectedItems.length > 0 && (
                    <div className="mt-3">
                      {!schedulerShowBulkPrice ? (
                        <button
                          onClick={() => setSchedulerShowBulkPrice(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[var(--text-muted)] border border-[var(--border)] hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition"
                          style={{ background: "var(--input)" }}
                        >
                          <PoundSterling size={12} />
                          Bulk Update Prices
                        </button>
                      ) : (
                        <div className="rounded-xl p-3 border border-[var(--border)]" style={{ background: "var(--input)" }}>
                          <h4 className="text-xs font-semibold text-[var(--text)] mb-2 flex items-center gap-1.5">
                            <PoundSterling size={13} />
                            Bulk Price Update
                          </h4>
                          <div className="flex items-center gap-3 mb-2">
                            <label className="flex items-center gap-1.5 text-xs text-[var(--text)]">
                              <input type="radio" name="bulkType" checked={schedulerBulkType === "percentage"} onChange={() => setSchedulerBulkType("percentage")} className="accent-[#8B5CF6]" />
                              Percentage (%)
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-[var(--text)]">
                              <input type="radio" name="bulkType" checked={schedulerBulkType === "fixed"} onChange={() => setSchedulerBulkType("fixed")} className="accent-[#8B5CF6]" />
                              Fixed amount (£)
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder={schedulerBulkType === "percentage" ? "e.g. 10 for +10%" : "e.g. 0.50 for +£0.50"}
                              value={schedulerBulkValue}
                              onChange={e => setSchedulerBulkValue(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg text-xs border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition"
                            />
                            <button onClick={() => { setSchedulerShowBulkPrice(false); setSchedulerBulkValue(""); }} className="px-2.5 py-1.5 rounded-lg text-[11px] text-[var(--text-muted)] hover:opacity-80 transition">Cancel</button>
                            <button
                              onClick={() => {
                                const val = parseFloat(schedulerBulkValue);
                                if (!isNaN(val) && val !== 0) {
                                  bulkUpdatePrices(schedulerBulkType, val);
                                  setSchedulerShowBulkPrice(false);
                                  setSchedulerBulkValue("");
                                }
                              }}
                              disabled={schedulerSaving || !schedulerBulkValue || parseFloat(schedulerBulkValue) === 0}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white btn-premium transition disabled:opacity-50"
                            >
                              {schedulerSaving ? "Updating..." : "Apply"}
                            </button>
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Use negative values to decrease prices. Applies to all {selectedItems.length} items.</p>
                        </div>
                      )}
                    </div>
                  )}
                  </>
                )}
              </div>

              {/* Templates Section */}
              <div className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                    <Box size={15} className="text-[var(--text-muted)]" />
                    Menu Templates
                  </h3>
                </div>

                {/* Apply Template */}
                <div className="flex items-center gap-2 mb-3">
                  <select
                    value={schedulerApplyTemplateId}
                    onChange={e => setSchedulerApplyTemplateId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[#8B5CF6] transition"
                  >
                    <option value="">Select template to apply...</option>
                    {templates.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name} ({Array.isArray(t.items) ? t.items.length : 0} items)</option>
                    ))}
                  </select>
                  <button
                    onClick={applyTemplate}
                    disabled={!schedulerApplyTemplateId || schedulerSaving}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-white btn-premium transition disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>

                {/* Template List */}
                {templates.length === 0 ? (
                  <p className="text-[11px] text-[var(--text-muted)] text-center py-3">No templates yet. Save a day&apos;s menu as a template to reuse it.</p>
                ) : (
                  <div className="space-y-1.5">
                    {templates.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-[var(--border)]" style={{ background: "var(--input)" }}>
                        <div>
                          <span className="text-xs font-medium text-[var(--text)]">{t.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)] ml-2">{Array.isArray(t.items) ? t.items.length : 0} items</span>
                        </div>
                        <button
                          onClick={() => deleteTemplate(t.id)}
                          className="p-1 rounded-lg hover:bg-red-50 transition text-[var(--text-muted)] hover:text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
            );
          })()}

          {/* Menu Management Page */}
          {activePage === "menu" && (
            <>
              {/* Menu Header */}
              <div
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <UtensilsCrossed size={22} color="white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Menu Management</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />{menuItems.filter(i => i.isAvailable).length} Active Items</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-red-400" />{menuItems.filter(i => !i.isAvailable).length} Unavailable</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button onClick={() => fetchMenuItems()} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition hover:opacity-80" style={{ background: "var(--input)" }}>
                      <RefreshCw size={16} className={`text-[var(--text-muted)] ${menuLoading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                      onClick={() => setActivePage("add-dish")}
                      className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition hover:opacity-90 btn-premium"
                    >
                      <PlusCircle size={14} />
                      <span>Add Dish</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Menu Table */}
              <div className="rounded-2xl glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs hidden md:table">
                    <thead>
                      <tr style={{ background: "var(--input)" }}>
                        <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Dish Name</th>
                        <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Category</th>
                        <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Price</th>
                        <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Prep Time</th>
                        <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Stock</th>
                        <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Available</th>
                        <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center text-[var(--text-muted)]">
                          <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-20" />
                          <p className="text-sm font-medium">{menuLoading ? "Loading menu items..." : "No dishes added yet"}</p>
                          <p className="text-[11px] mt-1">Click &quot;Add Dish&quot; to create your first menu item</p>
                        </td>
                      </tr>
                      ) : menuItems.map((item: any) => (
                      <tr key={item.id} className="border-t border-[var(--border)] hover:bg-[var(--input)] transition">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--input)" }}>
                                <UtensilsCrossed size={16} className="text-[var(--text-muted)]" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-[var(--text)]">{item.name}</p>
                              <p className="text-[10px] text-[var(--text-muted)]">{item.isVeg ? "Veg" : "Non-Veg"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{getCategoryName(item.categoryId)}</td>
                        <td className="px-4 py-3 text-center">
                          {item.offerPrice ? (
                            <div>
                              <span className="line-through text-[var(--text-muted)]">&pound;{Number(item.price).toFixed(2)}</span>
                              <span className="ml-1 font-semibold" style={{ color: "#10B981" }}>&pound;{Number(item.offerPrice).toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="font-semibold text-[var(--text)]">&pound;{Number(item.price).toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-[var(--text-muted)]">{item.prepTime ? `${item.prepTime} min` : "-"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{
                            color: item.stockCount == null ? "#8B5CF6" : item.stockCount > 5 ? "#10B981" : item.stockCount > 0 ? "#F59E0B" : "#EF4444",
                            background: item.stockCount == null ? "rgba(139,92,246,0.1)" : item.stockCount > 5 ? "rgba(16,185,129,0.1)" : item.stockCount > 0 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                          }}>
                            {item.stockCount == null ? "Unlimited" : item.stockCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleItemAvailability(item.menuId, item.id)}
                            className="relative w-11 h-6 rounded-full transition-all"
                            style={{ background: item.isAvailable ? "#10B981" : "var(--border)" }}
                          >
                            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all" style={{ left: item.isAvailable ? "22px" : "2px" }} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => startEditItem(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--input)] transition" title="Edit">
                              <Pencil size={14} style={{ color: "#3B82F6" }} />
                            </button>
                            <button onClick={() => deleteMenuItem(item.menuId, item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--input)] transition" title="Delete">
                              <Trash2 size={14} style={{ color: "#EF4444" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Mobile Cards */}
                  <div className="md:hidden p-4">
                    {menuItems.length === 0 ? (
                    <div className="text-center py-16 animate-fade-in-up">
                      <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                        <UtensilsCrossed size={36} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-[var(--text)] mb-1">{menuLoading ? "Loading..." : "No dishes added yet"}</h3>
                      <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Click &quot;Add Dish&quot; to create your first menu item</p>
                    </div>
                    ) : (
                    <div className="space-y-3">
                      {menuItems.map((item: any) => (
                      <div key={item.id} className="rounded-xl border border-[var(--border)] p-4 animate-fade-in-up" style={{ background: "var(--header-bg)" }}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "var(--input)" }}>
                                <UtensilsCrossed size={18} className="text-[var(--text-muted)]" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-[var(--text)]">{item.name}</p>
                              <p className="text-[11px] text-[var(--text-muted)]">{getCategoryName(item.categoryId)} {item.isVeg ? "- Veg" : "- Non-Veg"}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleItemAvailability(item.menuId, item.id)}
                            className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                            style={{ background: item.isAvailable ? "#10B981" : "var(--border)" }}
                          >
                            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all" style={{ left: item.isAvailable ? "22px" : "2px" }} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            {item.offerPrice ? (
                              <>
                                <span className="line-through text-[var(--text-muted)] text-xs">&pound;{Number(item.price).toFixed(2)}</span>
                                <span className="ml-1 text-sm font-bold" style={{ color: "#10B981" }}>&pound;{Number(item.offerPrice).toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-[var(--text)]">&pound;{Number(item.price).toFixed(2)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {item.prepTime && <span className="text-[11px] text-[var(--text-muted)]">{item.prepTime} min</span>}
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{
                              color: item.stockCount == null ? "#8B5CF6" : item.stockCount > 0 ? "#10B981" : "#EF4444",
                              background: item.stockCount == null ? "rgba(139,92,246,0.1)" : item.stockCount > 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                            }}>
                              {item.stockCount == null ? "Unlimited" : `${item.stockCount} left`}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                          <button onClick={() => startEditItem(item)} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition hover:opacity-80" style={{ color: "#3B82F6", background: "rgba(59,130,246,0.1)" }}>
                            <Pencil size={12} /> Edit
                          </button>
                          <button onClick={() => deleteMenuItem(item.menuId, item.id)} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition hover:opacity-80" style={{ color: "#EF4444", background: "rgba(239,68,68,0.1)" }}>
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                      ))}
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Active Orders Page */}
          {activePage === "active-orders" && (() => {
            const activeOrders = orders.filter(o => !["DELIVERED","CANCELLED","REJECTED"].includes(o.status));
            const activeCount = activeOrders.length;
            const preparingCount = activeOrders.filter(o => o.status === "PREPARING").length;
            const newCount = activeOrders.filter(o => o.status === "PLACED").length;
            const readyCount = activeOrders.filter(o => o.status === "READY").length;
            const outCount = activeOrders.filter(o => o.status === "OUT_FOR_DELIVERY").length;
            const acceptedCount = activeOrders.filter(o => o.status === "ACCEPTED").length;

            const filterTabs = [
              { label: "All Orders", count: activeCount, color: "#8B5CF6", statusFilter: null as string | null },
              { label: "New", count: newCount, color: "#3B82F6", statusFilter: "PLACED" },
              { label: "Accepted", count: acceptedCount, color: "#6366F1", statusFilter: "ACCEPTED" },
              { label: "Preparing", count: preparingCount, color: "#F59E0B", statusFilter: "PREPARING" },
              { label: "Ready", count: readyCount, color: "#10B981", statusFilter: "READY" },
              { label: "Out for Delivery", count: outCount, color: "#8B5CF6", statusFilter: "OUT_FOR_DELIVERY" },
            ];

            const filteredOrders = activeOrderFilter === "All Orders"
              ? activeOrders
              : activeOrders.filter(o => {
                  const tab = filterTabs.find(t => t.label === activeOrderFilter);
                  return tab?.statusFilter ? o.status === tab.statusFilter : true;
                });

            function renderActionButtons(order: any) {
              const btnBase = "px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all hover:opacity-90 active:scale-95";
              switch (order.status) {
                case "PLACED":
                  return (
                    <div className="flex gap-1.5">
                      <button className={btnBase} style={{ background: "#10B981" }} onClick={() => updateOrderStatus(order.id, "ACCEPTED")}>Accept</button>
                      <button className={btnBase} style={{ background: "#EF4444" }} onClick={() => updateOrderStatus(order.id, "REJECTED")}>Reject</button>
                    </div>
                  );
                case "ACCEPTED":
                  return <button className={btnBase} style={{ background: "#F59E0B" }} onClick={() => updateOrderStatus(order.id, "PREPARING")}>Start Cooking</button>;
                case "PREPARING":
                  return <button className={btnBase} style={{ background: "#10B981" }} onClick={() => updateOrderStatus(order.id, "READY")}>Mark Ready</button>;
                case "READY":
                  return <button className={btnBase} style={{ background: "#3B82F6" }} onClick={() => updateOrderStatus(order.id, "OUT_FOR_DELIVERY")}>Out for Delivery</button>;
                case "OUT_FOR_DELIVERY":
                  return <button className={btnBase} style={{ background: "#059669" }} onClick={() => updateOrderStatus(order.id, "DELIVERED")}>Delivered</button>;
                default:
                  return null;
              }
            }

            return (
            <>
              <div
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <ClipboardList size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Active Orders</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />{activeCount} Active</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-amber-500" />{preparingCount} Preparing</span>
                    </div>
                  </div>
                </div>
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80"
                  style={{ background: "var(--input)" }}
                  onClick={() => fetchOrders()}
                >
                  <RefreshCw size={18} className={`text-[var(--text-muted)] ${orderLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Order Status Tabs */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:overflow-x-visible mb-6">
                {filterTabs.map((tab) => {
                  const isActive = activeOrderFilter === tab.label;
                  return (
                  <button
                    key={tab.label}
                    onClick={() => setActiveOrderFilter(tab.label)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    style={{
                      background: isActive ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "var(--header-bg)",
                      color: isActive ? "#FFFFFF" : "var(--text-muted)",
                      border: isActive ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {tab.label}
                    <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{
                      background: isActive ? "rgba(255,255,255,0.2)" : `${tab.color}15`,
                      color: isActive ? "#FFFFFF" : tab.color,
                    }}>{tab.count}</span>
                  </button>
                  );
                })}
              </div>

              {/* Orders Table */}
              <div className="rounded-2xl glass-card overflow-hidden">
                <table className="w-full text-xs hidden md:table">
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
                    {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-[var(--text-muted)]">
                        <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No active orders</p>
                        <p className="text-[11px] mt-1">New orders will appear here with real-time notifications</p>
                      </td>
                    </tr>
                    ) : filteredOrders.map((order: any) => {
                      const sc = ORDER_STATUS_CONFIG[order.status] || { label: order.status, color: "#6B7280", bg: "rgba(107,114,128,0.12)" };
                      return (
                      <tr key={order.id} className="border-t border-[var(--border)] hover:bg-[var(--input)] transition">
                        <td className="px-5 py-3 font-mono font-semibold text-[var(--text)]">#{order.id.slice(0, 8)}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-[var(--text)]">{order.user?.name || "Customer"}</div>
                          <div className="text-[10px] text-[var(--text-muted)]">{order.user?.email || ""}</div>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)] max-w-[200px] truncate">{getOrderItemsSummary(order.items)}</td>
                        <td className="px-4 py-3 text-center font-semibold text-[var(--text)]">&pound;{Number(order.total || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-[var(--text-muted)]">{formatRelativeTime(order.createdAt)}</td>
                        <td className="px-4 py-3 text-center">{renderActionButtons(order)}</td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Mobile Cards */}
                <div className="md:hidden p-4">
                  {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 animate-fade-in-up">
                    <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                      <ClipboardList size={36} className="text-white" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text)] mb-1">No active orders</h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">New orders will appear here with real-time notifications</p>
                  </div>
                  ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order: any) => {
                      const sc = ORDER_STATUS_CONFIG[order.status] || { label: order.status, color: "#6B7280", bg: "rgba(107,114,128,0.12)" };
                      return (
                      <div key={order.id} className="rounded-xl border border-[var(--border)] p-4 animate-fade-in-up" style={{ background: "var(--header-bg)" }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="font-mono text-xs font-semibold text-[var(--text)]">#{order.id.slice(0, 8)}</span>
                            <p className="text-sm font-medium text-[var(--text)] mt-0.5">{order.user?.name || "Customer"}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-2">{getOrderItemsSummary(order.items)}</p>
                        {order.deliveryMethod === "PICKUP" ? (
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">Pickup</span>
                          </div>
                        ) : order.address ? (
                          <div className="mb-2 space-y-1">
                            <div className="flex items-start gap-1.5 text-[11px] text-[var(--text-muted)]">
                              <MapPin size={12} className="shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{[order.address.line1, order.address.city, order.address.zipCode].filter(Boolean).join(", ")}</span>
                            </div>
                            {order.user?.phone && (
                              <a href={`tel:${order.user.phone}`} className="flex items-center gap-1.5 text-[11px] text-blue-500 hover:underline">
                                <Phone size={11} /> {order.user.phone}
                              </a>
                            )}
                            {order.address.latitude && order.address.longitude && (
                              <a href={`https://www.google.com/maps/dir/?api=1&destination=${order.address.latitude},${order.address.longitude}&travelmode=driving`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                                <MapPin size={10} /> Navigate to Customer
                              </a>
                            )}
                          </div>
                        ) : null}
                        {!order.address && order.user?.phone && order.deliveryMethod !== "PICKUP" && (
                          <a href={`tel:${order.user.phone}`} className="flex items-center gap-1.5 mb-2 text-[11px] text-blue-500 hover:underline">
                            <Phone size={11} /> {order.user.phone}
                          </a>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-[var(--text)]">&pound;{Number(order.total || 0).toFixed(2)}</span>
                          <span className="text-[11px] text-[var(--text-muted)]">{formatRelativeTime(order.createdAt)}</span>
                        </div>
                        <div className="flex justify-end">{renderActionButtons(order)}</div>
                      </div>
                      );
                    })}
                  </div>
                  )}
                </div>
              </div>
            </>
            );
          })()}

          {/* Order History Page */}
          {activePage === "order-history" && (() => {
            const historyOrders = orders.filter(o => ["DELIVERED","CANCELLED","REJECTED"].includes(o.status));
            const completedCount = historyOrders.filter(o => o.status === "DELIVERED").length;
            const cancelledCount = historyOrders.filter(o => o.status === "CANCELLED" || o.status === "REJECTED").length;
            const totalHistoryCount = historyOrders.length;
            const avgOrderValue = totalHistoryCount > 0
              ? (historyOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0) / totalHistoryCount)
              : 0;

            const filteredHistory = historyFilter === "All"
              ? historyOrders
              : historyFilter === "Completed"
              ? historyOrders.filter(o => o.status === "DELIVERED")
              : historyFilter === "Cancelled"
              ? historyOrders.filter(o => o.status === "CANCELLED" || o.status === "REJECTED")
              : historyOrders;

            return (
            <>
              <div
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <Package size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Order History</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />{completedCount} Completed</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-red-400" />{cancelledCount} Cancelled</span>
                    </div>
                  </div>
                </div>
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:opacity-80"
                  style={{ background: "var(--input)" }}
                  onClick={() => fetchOrders()}
                >
                  <RefreshCw size={18} className={`text-[var(--text-muted)] ${orderLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* History Filters */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:overflow-x-visible mb-6">
                {[
                  { label: "All", color: "#8B5CF6" },
                  { label: "Completed", color: "#10B981" },
                  { label: "Cancelled", color: "#EF4444" },
                ].map((tab) => {
                  const isActive = historyFilter === tab.label;
                  return (
                  <button
                    key={tab.label}
                    onClick={() => setHistoryFilter(tab.label)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0"
                    style={{
                      background: isActive ? "linear-gradient(135deg, var(--badge-from), var(--badge-to))" : "var(--header-bg)",
                      color: isActive ? "#FFFFFF" : "var(--text-muted)",
                      border: isActive ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {tab.label}
                  </button>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Total Orders", value: String(totalHistoryCount), icon: Package, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Completed", value: String(completedCount), icon: Check, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "Cancelled", value: String(cancelledCount), icon: AlertCircle, color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
                  { label: "Avg. Order Value", value: `\u00A3${avgOrderValue.toFixed(2)}`, icon: PoundSterling, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
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
                      <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* History Table */}
              <div className="rounded-2xl glass-card overflow-hidden">
                <table className="w-full text-xs hidden md:table">
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
                    {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-[var(--text-muted)]">
                        <Package size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No order history yet</p>
                        <p className="text-[11px] mt-1">Completed and cancelled orders will appear here</p>
                      </td>
                    </tr>
                    ) : filteredHistory.map((order: any) => {
                      const sc = ORDER_STATUS_CONFIG[order.status] || { label: order.status, color: "#6B7280", bg: "rgba(107,114,128,0.12)" };
                      return (
                      <tr key={order.id} className="border-t border-[var(--border)] hover:bg-[var(--input)] transition">
                        <td className="px-5 py-3 font-mono font-semibold text-[var(--text)]">#{order.id.slice(0, 8)}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-[var(--text)]">{order.user?.name || "Customer"}</div>
                          <div className="text-[10px] text-[var(--text-muted)]">{order.user?.email || ""}</div>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)] max-w-[200px] truncate">{getOrderItemsSummary(order.items)}</td>
                        <td className="px-4 py-3 text-center font-semibold text-[var(--text)]">&pound;{Number(order.total || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-[var(--text-muted)]">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Mobile Cards */}
                <div className="md:hidden p-4">
                  {filteredHistory.length === 0 ? (
                  <div className="text-center py-16 animate-fade-in-up">
                    <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                      <Package size={36} className="text-white" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text)] mb-1">No order history yet</h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Completed and cancelled orders will appear here</p>
                  </div>
                  ) : (
                  <div className="space-y-3">
                    {filteredHistory.map((order: any) => {
                      const sc = ORDER_STATUS_CONFIG[order.status] || { label: order.status, color: "#6B7280", bg: "rgba(107,114,128,0.12)" };
                      return (
                      <div key={order.id} className="rounded-xl border border-[var(--border)] p-4 animate-fade-in-up" style={{ background: "var(--header-bg)" }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="font-mono text-xs font-semibold text-[var(--text)]">#{order.id.slice(0, 8)}</span>
                            <p className="text-sm font-medium text-[var(--text)] mt-0.5">{order.user?.name || "Customer"}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-2">{getOrderItemsSummary(order.items)}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[var(--text)]">&pound;{Number(order.total || 0).toFixed(2)}</span>
                          <span className="text-[11px] text-[var(--text-muted)]">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                  )}
                </div>
              </div>
            </>
            );
          })()}

          {/* Notifications Page */}
          {activePage === "notifications" && (
            <>
              <div
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
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
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:overflow-x-visible mb-6">
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
                      className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
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
              <div className="rounded-2xl glass-card p-8">
                <div className="text-center py-16 animate-fade-in-up">
                  <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                    <Bell size={36} className="text-white" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text)] mb-1">No notifications yet</h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">You&apos;ll be notified about new orders, reviews and system updates</p>
                </div>
              </div>
            </>
          )}

          {/* Tiffin Subscriptions Page */}
          {activePage === "subscriptions" && (
            <>
              <div
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <Calendar size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Tiffin Subscriptions</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />{tiffinSubscribers.filter((s: any) => s.status === "ACTIVE").length} Active</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-amber-500" />{tiffinSubscribers.filter((s: any) => s.status === "PAUSED").length} Paused</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreatePlan(true)}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition hover:opacity-90 btn-premium"
                >
                  <PlusCircle size={16} />
                  <span>Create Plan</span>
                </button>
              </div>

              {/* Create Plan Form */}
              {showCreatePlan && (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 mb-6 animate-fade-in-up space-y-4">
                  <h3 className="text-sm font-bold text-[var(--text)]">Create New Tiffin Plan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Plan Name *</label>
                      <input type="text" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} placeholder="e.g. Weekly Tiffin" className="w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none" style={{ background: "var(--input)", border: "1px solid var(--border)" }} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Price (£) *</label>
                      <input type="number" step="0.01" value={newPlan.price} onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })} placeholder="35.00" className="w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none" style={{ background: "var(--input)", border: "1px solid var(--border)" }} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Frequency</label>
                      <select value={newPlan.frequency} onChange={(e) => setNewPlan({ ...newPlan, frequency: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text)] outline-none" style={{ background: "var(--input)", border: "1px solid var(--border)" }}>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Meals per Day</label>
                      <input type="number" min="1" max="5" value={newPlan.mealsPerDay} onChange={(e) => setNewPlan({ ...newPlan, mealsPerDay: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text)] outline-none" style={{ background: "var(--input)", border: "1px solid var(--border)" }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Description</label>
                    <textarea value={newPlan.description} onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })} placeholder="Describe what's included in this plan..." rows={2} className="w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none resize-none" style={{ background: "var(--input)", border: "1px solid var(--border)" }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isVeg" checked={newPlan.isVeg} onChange={(e) => setNewPlan({ ...newPlan, isVeg: e.target.checked })} className="accent-[var(--primary)]" />
                    <label htmlFor="isVeg" className="text-xs font-medium text-[var(--text)]">Vegetarian only</label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCreatePlan(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--input)] transition">Cancel</button>
                    <button onClick={handleCreatePlan} disabled={creatingPlan} className="flex-1 btn-premium text-sm font-semibold py-2.5 rounded-xl text-white disabled:opacity-50 flex items-center justify-center gap-2">
                      {creatingPlan ? <><RefreshCw size={14} className="animate-spin" /> Creating...</> : <><PlusCircle size={14} /> Create Plan</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Subscription Plans Overview */}
              {tiffinLoading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw size={24} className="animate-spin text-primary" />
                </div>
              ) : tiffinPlans.length === 0 ? (
                <div className="text-center py-16 animate-fade-in-up">
                  <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                    <Calendar size={36} className="text-white" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text)] mb-1">No tiffin plans yet</h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto mb-4">Create your first tiffin subscription plan and customers can subscribe for recurring meals.</p>
                  <button onClick={() => setShowCreatePlan(true)} className="btn-premium px-6 py-2.5 rounded-xl text-white text-sm font-medium inline-flex items-center gap-2">
                    <PlusCircle size={16} /> Create Your First Plan
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {tiffinPlans.map((plan: any) => {
                      const colors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];
                      const color = colors[tiffinPlans.indexOf(plan) % colors.length];
                      const bg = color + "14";
                      return (
                        <div key={plan.id} className="rounded-2xl border border-[var(--border)] p-5" style={{ background: "var(--header-bg)" }}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                              <Repeat size={20} style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-[var(--text)] truncate">{plan.name}</h4>
                              <p className="text-[10px] text-[var(--text-muted)]">{plan.mealsPerDay} meal{plan.mealsPerDay > 1 ? "s" : ""}/day{plan.isVeg ? " · Veg" : ""}</p>
                            </div>
                          </div>
                          {plan.description && <p className="text-[11px] text-[var(--text-muted)] mb-3 line-clamp-2">{plan.description}</p>}
                          <div className="mb-3">
                            <span className="text-2xl font-bold" style={{ color }}>£{plan.price.toFixed(2)}</span>
                            <span className="text-xs text-[var(--text-muted)]">/{plan.frequency === "WEEKLY" ? "week" : "month"}</span>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                            <span className="text-[11px] text-[var(--text-muted)]">{plan._count?.subscriptions || 0} subscribers</span>
                            <button onClick={() => togglePlanActive(plan.id, !plan.isActive)} className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ color: plan.isActive ? color : "#EF4444", background: plan.isActive ? bg : "rgba(239,68,68,0.08)" }}>
                              {plan.isActive ? "Active" : "Inactive"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subscribers Table */}
                  <div className="rounded-2xl glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[var(--text)]">Subscribers</h3>
                    </div>
                    {tiffinSubscribers.length === 0 ? (
                      <div className="p-8 text-center">
                        <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium text-[var(--text-muted)]">No subscribers yet</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">Customers who subscribe to your tiffin plans will appear here</p>
                      </div>
                    ) : (
                      <>
                        <table className="w-full text-xs hidden md:table">
                          <thead>
                            <tr style={{ background: "var(--input)" }}>
                              <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Customer</th>
                              <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Plan</th>
                              <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Start Date</th>
                              <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Next Delivery</th>
                              <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tiffinSubscribers.map((sub: any) => (
                              <tr key={sub.id} className="border-t border-[var(--border)] hover:bg-[var(--input)] transition">
                                <td className="px-5 py-3 font-semibold text-[var(--text)]">{sub.user?.name || "Customer"}</td>
                                <td className="px-4 py-3 text-[var(--text-muted)]">{sub.tiffinPlan?.name || sub.name}</td>
                                <td className="px-4 py-3 text-center text-[var(--text-muted)]">{new Date(sub.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                                <td className="px-4 py-3 text-center text-[var(--text-muted)]">{sub.nextDelivery ? new Date(sub.nextDelivery).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${sub.status === "ACTIVE" ? "text-emerald-600 bg-emerald-100" : sub.status === "PAUSED" ? "text-amber-600 bg-amber-100" : "text-red-600 bg-red-100"}`}>
                                    {sub.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-[var(--border)]">
                          {tiffinSubscribers.map((sub: any) => (
                            <div key={sub.id} className="p-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-[var(--text)]">{sub.user?.name || "Customer"}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sub.status === "ACTIVE" ? "text-emerald-600 bg-emerald-100" : sub.status === "PAUSED" ? "text-amber-600 bg-amber-100" : "text-red-600 bg-red-100"}`}>
                                  {sub.status}
                                </span>
                              </div>
                              <p className="text-xs text-[var(--text-muted)]">{sub.tiffinPlan?.name || sub.name} · £{sub.price?.toFixed(2)}/{sub.frequency === "WEEKLY" ? "wk" : "mo"}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Earnings Page */}
          {activePage === "earnings" && (
            <>
              <div
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <PoundSterling size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Earnings</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />&pound;{earnings?.today?.amount?.toFixed(2) || '0.00'} Today</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-amber-500" />{earnings?.today?.orders || 0} orders</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => fetchEarnings()} className="px-4 py-2 rounded-xl text-xs font-medium transition hover:opacity-80 flex items-center gap-1.5" style={{ background: "var(--input)", color: "var(--text)" }}>
                  <RefreshCw size={12} className={earningsLoading ? "animate-spin" : ""} /> Refresh
                </button>
              </div>

              {/* Earnings Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Today's Earnings", value: `\u00A3${earnings?.today?.amount?.toFixed(2) || '0.00'}`, sub: `${earnings?.today?.orders || 0} orders`, icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                  { label: "This Week", value: `\u00A3${earnings?.week?.amount?.toFixed(2) || '0.00'}`, sub: `${earnings?.week?.orders || 0} orders`, icon: Wallet, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
                  { label: "This Month", value: `\u00A3${earnings?.month?.amount?.toFixed(2) || '0.00'}`, sub: `${earnings?.month?.orders || 0} orders`, icon: PoundSterling, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Total Earnings", value: `\u00A3${earnings?.total?.amount?.toFixed(2) || '0.00'}`, sub: `${earnings?.total?.orders || 0} all time`, icon: Crown, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
                ].map((s, i) => {
                  const SI = s.icon;
                  return (
                    <div key={i} className="p-4 rounded-2xl border border-[var(--border)] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl" style={{ background: "var(--header-bg)" }}>
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

              {/* Revenue Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Meals & Tiffin", value: `\u00A3${earnings?.total?.amount?.toFixed(2) || '0.00'}`, icon: UtensilsCrossed, color: "#FF5A1F", pct: "100%" },
                  { label: "Homemade Products", value: "\u00A30.00", icon: Store, color: "#8B5CF6", pct: "0%" },
                  { label: "Subscriptions", value: "\u00A30.00", icon: Repeat, color: "#10B981", pct: "0%" },
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
                        <div className="h-full rounded-full transition-all" style={{ background: item.color, width: item.pct === "100%" && earnings?.total?.amount > 0 ? "100%" : "0%" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Transactions Table */}
              <div className="rounded-2xl glass-card overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--text)]">Recent Transactions</h3>
                </div>
                <table className="w-full text-xs hidden md:table">
                  <thead>
                    <tr style={{ background: "var(--input)" }}>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--text)]">Order ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text)]">Customer</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Amount</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Home Maker Payout</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--text)]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!earnings?.transactions || earnings.transactions.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-[var(--text-muted)]">
                        <PoundSterling size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">{earningsLoading ? "Loading transactions..." : "No transactions yet"}</p>
                        <p className="text-[11px] mt-1">Your earnings and payouts will be listed here</p>
                      </td>
                    </tr>
                    ) : earnings.transactions.map((txn: any) => (
                    <tr key={txn.id} className="border-t border-[var(--border)] hover:bg-[var(--input)] transition">
                      <td className="px-5 py-3 font-mono font-semibold text-[var(--text)]">#{(txn.orderId || txn.id || '').slice(0, 8)}</td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{txn.order?.user?.name || "Customer"}</td>
                      <td className="px-4 py-3 text-center font-semibold text-[var(--text)]">&pound;{Number(txn.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center font-semibold" style={{ color: "#10B981" }}>&pound;{Number(txn.chefPayout || txn.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{
                          color: txn.status === "COMPLETED" ? "#10B981" : txn.status === "PENDING" ? "#F59E0B" : "#3B82F6",
                          background: txn.status === "COMPLETED" ? "rgba(16,185,129,0.12)" : txn.status === "PENDING" ? "rgba(245,158,11,0.12)" : "rgba(59,130,246,0.12)",
                        }}>{txn.status || "Completed"}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-[var(--text-muted)]">{txn.createdAt ? new Date(txn.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "-"}</td>
                    </tr>
                    ))}
                  </tbody>
                </table>
                {/* Mobile Cards */}
                <div className="md:hidden p-4">
                  {(!earnings?.transactions || earnings.transactions.length === 0) ? (
                  <div className="text-center py-16 animate-fade-in-up">
                    <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                      <PoundSterling size={36} className="text-white" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text)] mb-1">{earningsLoading ? "Loading..." : "No transactions yet"}</h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Your earnings and payouts will be listed here</p>
                  </div>
                  ) : (
                  <div className="space-y-3">
                    {earnings.transactions.map((txn: any) => (
                    <div key={txn.id} className="rounded-xl border border-[var(--border)] p-4" style={{ background: "var(--header-bg)" }}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-mono text-xs font-semibold text-[var(--text)]">#{(txn.orderId || txn.id || '').slice(0, 8)}</span>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">{txn.order?.user?.name || "Customer"}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{
                          color: txn.status === "COMPLETED" ? "#10B981" : "#F59E0B",
                          background: txn.status === "COMPLETED" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                        }}>{txn.status || "Completed"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold" style={{ color: "#10B981" }}>&pound;{Number(txn.chefPayout || txn.amount || 0).toFixed(2)}</span>
                        <span className="text-[11px] text-[var(--text-muted)]">{txn.createdAt ? new Date(txn.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "-"}</span>
                      </div>
                    </div>
                    ))}
                  </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Reviews Page */}
          {activePage === "reviews" && (() => {
            const avgRating = reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length) : 0;
            const ratingCounts = [5,4,3,2,1].map(r => reviews.filter((rv: any) => rv.rating === r).length);
            const needsReplyCount = reviews.filter((r: any) => !r.reply).length;

            return (
            <>
              <div
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
                    <Star size={24} color="white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">Reviews</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-500" />{needsReplyCount} Needs Reply</span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><span className="w-2 h-2 rounded-full bg-gray-400" />{reviews.length} Total</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => fetchReviews()} className="px-4 py-2 rounded-xl text-xs font-medium transition hover:opacity-80 flex items-center gap-1.5" style={{ background: "var(--input)", color: "var(--text)" }}>
                  <RefreshCw size={12} className={reviewsLoading ? "animate-spin" : ""} /> Refresh
                </button>
              </div>

              {/* Rating Overview */}
              <div className="rounded-2xl border border-[var(--border)] p-5 mb-6" style={{ background: "var(--header-bg)" }}>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: "#F59E0B" }}>{avgRating.toFixed(1)}</div>
                    <div className="flex items-center gap-0.5 mt-1 justify-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} style={{ color: s <= Math.round(avgRating) ? "#F59E0B" : "var(--border)" }} fill={s <= Math.round(avgRating) ? "#F59E0B" : "var(--border)"} />
                      ))}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{reviews.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating, idx) => (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-[11px] font-medium text-[var(--text-muted)] w-4">{rating}</span>
                        <Star size={12} style={{ color: "#F59E0B" }} />
                        <div className="flex-1 h-2 rounded-full bg-[var(--input)]">
                          <div className="h-full rounded-full transition-all" style={{ background: "#F59E0B", width: reviews.length > 0 ? `${(ratingCounts[idx] / reviews.length) * 100}%` : "0%" }} />
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] w-6">{ratingCounts[idx]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
              <div className="rounded-2xl glass-card p-8">
                <div className="text-center py-16 animate-fade-in-up">
                  <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                    <Star size={36} className="text-white" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text)] mb-1">{reviewsLoading ? "Loading reviews..." : "No reviews yet"}</h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Customer reviews and ratings will appear here once you start receiving orders</p>
                </div>
              </div>
              ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                <div key={review.id} className="rounded-2xl border border-[var(--border)] p-5 transition-all" style={{ background: "var(--header-bg)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold badge-gradient">
                        {(review.user?.name || "C").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">{review.user?.name || "Customer"}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} style={{ color: s <= (review.rating || 0) ? "#F59E0B" : "var(--border)" }} fill={s <= (review.rating || 0) ? "#F59E0B" : "var(--border)"} />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-[var(--text-soft)] mb-3 leading-relaxed">{review.comment}</p>
                  )}
                  {review.reply ? (
                    <div className="rounded-xl p-3 mt-2" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={12} style={{ color: "#8B5CF6" }} />
                        <span className="text-[11px] font-semibold" style={{ color: "#8B5CF6" }}>Your Reply</span>
                      </div>
                      <p className="text-xs text-[var(--text-soft)]">{review.reply}</p>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={replyTexts[review.id] || ''}
                          onChange={e => setReplyTexts(prev => ({ ...prev, [review.id]: e.target.value }))}
                          className="flex-1 px-3 py-2 rounded-lg text-xs border border-[var(--border)] bg-[var(--input)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#8B5CF6] transition"
                        />
                        <button
                          onClick={() => replyToReview(review.id)}
                          disabled={!replyTexts[review.id]?.trim()}
                          className="px-3 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 btn-premium disabled:opacity-50 flex items-center gap-1"
                        >
                          <Send size={12} /> Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                ))}
              </div>
              )}
            </>
            );
          })()}

          {/* Analytics Page */}
          {activePage === "analytics" && (
            <>
              <div
                className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient">
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
                    <div key={i} className="p-4 rounded-2xl border border-[var(--border)] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl" style={{ background: "var(--header-bg)" }}>
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
                <table className="w-full text-xs hidden md:table">
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
                {/* Mobile Cards */}
                <div className="md:hidden">
                  <div className="text-center py-16 animate-fade-in-up">
                    <div className="w-20 h-20 rounded-2xl badge-gradient mx-auto mb-4 flex items-center justify-center animate-float">
                      <BarChart3 size={36} className="text-white" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text)] mb-1">No data yet</h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Analytics data will populate once you start receiving orders</p>
                  </div>
                </div>
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
                  className="rounded-2xl glass-card px-4 sm:px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 badge-gradient"
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
                        className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition hover:opacity-90 shrink-0 btn-premium"
                      >
                        <PlusCircle size={16} />
                        <span>{meta.cta}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Panel */}
                <div className="rounded-2xl glass-card p-6">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)]" style={{ background: "var(--header-bg)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-around px-2 py-2" style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}>
          {[
            { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
            { icon: ClipboardList, label: "Orders", id: "active-orders" },
            { icon: UtensilsCrossed, label: "Menu", id: "menu" },
            { icon: Bell, label: "Alerts", id: "notifications" },
          ].map((item) => {
            const BIcon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px] active:scale-95"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? "badge-gradient" : ""}`}>
                  <BIcon size={18} style={{ color: isActive ? "#FFFFFF" : "var(--text-muted)" }} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "gradient-text" : ""}`} style={!isActive ? { color: "var(--text-muted)" } : undefined}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
