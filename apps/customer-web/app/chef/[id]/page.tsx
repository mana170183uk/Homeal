"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  MapPin,
  Clock,
  ChefHat,
  Leaf,
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingBag,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Bell,
  BellOff,
  Repeat,
  Loader2,
} from "lucide-react";
import { api } from "../../lib/api";
import { parseCuisineTypes } from "../../lib/utils";
import Header from "../../components/Header";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  offerPrice: number | null;
  image: string | null;
  isVeg: boolean;
  calories: number | null;
  prepTime: number | null;
  stockCount: number | null;
  eggOption: string | null;
}

interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string; avatar: string | null };
}

interface Service {
  id: string;
  type: string;
  name: string;
  description: string | null;
  basePrice: number;
}

interface ChefDetail {
  id: string;
  kitchenName: string;
  description: string | null;
  cuisineTypes: string | null;
  bannerImage: string | null;
  avgRating: number;
  totalReviews: number;
  deliveryRadius: number;
  isOnline?: boolean;
  isOpen?: boolean;
  operatingHours: string | null;
  orderCutoffTime?: string | null;
  vacationStart?: string | null;
  vacationEnd?: string | null;
  dailyOrderCap?: number | null;
  user: { name: string; avatar: string | null };
  menus: Menu[];
  reviews: Review[];
  services: Service[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  chefId: string;
  chefName: string;
}

interface DayHours {
  open: string;
  close: string;
  enabled: boolean;
}

type OperatingHoursMap = Record<string, DayHours>;

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function parseOperatingHours(raw: string | null): OperatingHoursMap | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as OperatingHoursMap;
    }
    return null;
  } catch {
    return null;
  }
}

function formatTime(time24: string): string {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${ampm}`;
}

function getTodayName(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("homeal_cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem("homeal_cart", JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

const BANNER_FALLBACK = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80&fit=crop";
const MENU_ITEM_FALLBACK = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80&fit=crop";

export default function ChefProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [chef, setChef] = useState<ChefDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState("");
  const [showAllHours, setShowAllHours] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [dateMenuItems, setDateMenuItems] = useState<MenuItem[] | null>(null);
  const [dateMenuLoading, setDateMenuLoading] = useState(false);
  const [dateMenuClosed, setDateMenuClosed] = useState(false);
  const [isOnVacation, setIsOnVacation] = useState(false);
  const [pastCutoff, setPastCutoff] = useState(false);
  const [tiffinPlans, setTiffinPlans] = useState<any[]>([]);
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null);

  // Public page — no login required. Guests can browse chef profiles freely.

  useEffect(() => {
    setCart(getCart());
  }, []);

  useEffect(() => {
    async function fetchChef() {
      try {
        const token = localStorage.getItem("homeal_token") || undefined;
        const res = await api<ChefDetail>(`/chefs/${id}`, { token });
        if (res.success && res.data) {
          setChef(res.data);
        } else {
          setError("Home Maker not found.");
        }
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchChef();
  }, [id]);

  // Fetch tiffin plans for this chef
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await api<any[]>(`/subscriptions/plans/${id}`);
        if (res.success && res.data) setTiffinPlans(res.data);
      } catch { /* no plans available */ }
    }
    fetchPlans();
  }, [id]);

  async function handleSubscribe(planId: string) {
    const token = localStorage.getItem("homeal_token");
    if (!token) {
      router.push(`/login?redirect=/chef/${id}`);
      return;
    }
    setSubscribingPlanId(planId);
    try {
      const res = await api<{ url: string }>("/subscriptions/checkout", {
        method: "POST",
        token,
        body: JSON.stringify({ planId }),
      });
      if (res.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setToast(res.error || "Failed to start subscription.");
        setTimeout(() => setToast(""), 3000);
      }
    } catch {
      setToast("Something went wrong. Please try again.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSubscribingPlanId(null);
    }
  }

  // Fetch date-specific menu when date changes
  useEffect(() => {
    if (!chef) return;
    // Check vacation status
    if (chef.vacationStart && chef.vacationEnd) {
      const now = new Date().toISOString().split("T")[0];
      const vs = new Date(chef.vacationStart).toISOString().split("T")[0];
      const ve = new Date(chef.vacationEnd).toISOString().split("T")[0];
      setIsOnVacation(now >= vs && now <= ve);
    } else {
      setIsOnVacation(false);
    }

    // Check cutoff time for today
    const today = new Date().toISOString().split("T")[0];
    if (selectedDate === today && chef.orderCutoffTime) {
      const now = new Date();
      const [h, m] = chef.orderCutoffTime.split(":").map(Number);
      const cutoff = new Date();
      cutoff.setHours(h, m, 0, 0);
      setPastCutoff(now > cutoff);
    } else {
      setPastCutoff(false);
    }

    async function fetchDateMenu() {
      setDateMenuLoading(true);
      try {
        const res = await api<any>(`/menus/${chef!.id}?date=${selectedDate}`) as any;
        if (res.success) {
          if (res.vacation) {
            setIsOnVacation(true);
            setDateMenuItems([]);
            setDateMenuClosed(false);
          } else if (res.isClosed) {
            setDateMenuClosed(true);
            setDateMenuItems([]);
          } else {
            setDateMenuClosed(false);
            // data is an array of menus, flatten items
            const menus = Array.isArray(res.data) ? res.data : [];
            const items = menus.flatMap((m: any) => m.items || []);
            setDateMenuItems(items);
          }
        } else {
          setDateMenuItems([]);
          setDateMenuClosed(false);
        }
      } catch {
        setDateMenuItems(null);
      } finally {
        setDateMenuLoading(false);
      }
    }
    fetchDateMenu();
  }, [selectedDate, chef?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check follow status on mount
  useEffect(() => {
    async function checkFollow() {
      const token = localStorage.getItem("homeal_token");
      if (!token) return;
      try {
        const res = await api<{ following: boolean }>(`/follows/check/${id}`, { token });
        if (res.success && res.data) {
          setIsFollowing(res.data.following);
        }
      } catch {
        // silently fail
      }
    }
    checkFollow();
  }, [id]);

  async function toggleFollow() {
    const token = localStorage.getItem("homeal_token");
    if (!token) {
      router.push(`/login?redirect=/chef/${id}`);
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api(`/follows/${id}`, { method: "DELETE", token });
        setIsFollowing(false);
        showToast("Unfollowed");
      } else {
        await api(`/follows/${id}`, { method: "POST", token });
        setIsFollowing(true);
        showToast("You will be notified of updates");
      }
    } catch {
      // silently fail
    } finally {
      setFollowLoading(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  function addToCart(item: MenuItem) {
    if (!chef) return;

    // Block adding if kitchen is closed (use server-computed isOpen)
    if (chef.isOpen === false || chef.isOnline === false) return;

    // Block adding if sold out
    if (item.stockCount !== null && item.stockCount <= 0) return;

    let currentCart = getCart();

    // Single-vendor policy: only one kitchen at a time
    const existingChefId = currentCart.length > 0 ? currentCart[0].chefId : null;
    if (existingChefId && existingChefId !== chef.id) {
      const existingChefName = currentCart[0].chefName;
      const confirmed = window.confirm(
        `Your cart has items from ${existingChefName}. Adding this item will clear your cart. Continue?`
      );
      if (!confirmed) return;
      currentCart = [];
    }

    const effectivePrice =
      item.offerPrice != null && item.offerPrice < item.price
        ? item.offerPrice
        : item.price;

    const existing = currentCart.find((c) => c.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      currentCart.push({
        id: item.id,
        name: item.name,
        price: effectivePrice,
        image: item.image,
        quantity: 1,
        chefId: chef.id,
        chefName: chef.kitchenName,
      });
    }

    saveCart(currentCart);
    setCart([...currentCart]);
    showToast(`Added "${item.name}" to cart`);
  }

  function updateQuantity(itemId: string, delta: number) {
    const currentCart = getCart();
    const idx = currentCart.findIndex((c) => c.id === itemId);
    if (idx === -1) return;

    currentCart[idx].quantity += delta;
    if (currentCart[idx].quantity <= 0) {
      currentCart.splice(idx, 1);
    }

    saveCart(currentCart);
    setCart([...currentCart]);
  }

  function getItemQty(itemId: string): number {
    return cart.find((c) => c.id === itemId)?.quantity || 0;
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !chef) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
            {error || "Home Maker not found"}
          </h1>
          <a href="/" className="text-primary font-medium hover:underline">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  const allItems = chef.menus.flatMap((m) => m.items);
  const operatingHours = parseOperatingHours(chef.operatingHours);
  const todayName = getTodayName();
  const todayHours = operatingHours?.[todayName] ?? null;

  // Use server-computed isOpen for today's status (checks all signals including guest-hidden operatingHours)
  // For selected-date closures, also check dateMenuClosed state
  const isToggledOn = chef.isOnline !== false;
  const isTodayEnabled = todayHours ? todayHours.enabled !== false : true;
  const isKitchenOpen = chef.isOpen !== undefined
    ? (chef.isOpen && !dateMenuClosed)
    : (isToggledOn && isTodayEnabled && !isOnVacation && !dateMenuClosed);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack maxWidth="max-w-5xl" />

      {/* Banner */}
      <div className="h-56 md:h-72 relative overflow-hidden">
        <img
          src={chef.bannerImage || BANNER_FALLBACK}
          alt={chef.kitchenName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/80 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-[1]">
        {/* Chef Info Card */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-lg p-6 mb-4">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Avatar with gradient ring */}
            <div className="w-20 h-20 rounded-2xl p-0.5 badge-gradient shrink-0">
              <div className="w-full h-full bg-[var(--card)] rounded-[14px] flex items-center justify-center overflow-hidden">
                {chef.user.avatar ? (
                  <img
                    src={chef.user.avatar}
                    alt={chef.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ChefHat className="w-10 h-10 text-primary" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="font-display text-3xl font-bold text-[var(--text)]">
                  {chef.kitchenName}
                </h1>
                {/* Kitchen Open/Closed Badge */}
                {isKitchenOpen ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Kitchen Open
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    {isOnVacation ? "On Holiday" : dateMenuClosed ? "Closed Today" : !isTodayEnabled ? "Closed Today" : "Kitchen Closed"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[var(--text-soft)]">
                  by {chef.user.name}
                </p>
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ${
                    isFollowing
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "badge-gradient text-white hover:opacity-90"
                  } ${followLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {isFollowing ? (
                    <>
                      <BellOff className="w-3.5 h-3.5" />
                      Following
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      Notify me
                    </>
                  )}
                </button>
              </div>

              {/* Today's hours */}
              {operatingHours && (
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-soft)] mb-3">
                  <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                  {todayHours && todayHours.enabled ? (
                    <span>
                      Open today: {formatTime(todayHours.open)} &ndash; {formatTime(todayHours.close)}
                    </span>
                  ) : (
                    <span className="text-red-500 dark:text-red-400">Closed today</span>
                  )}
                </div>
              )}

              {chef.description && (
                <p className="text-[var(--text-soft)] text-sm mb-4">
                  {chef.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {chef.avgRating > 0 && (
                  <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">
                      {chef.avgRating.toFixed(1)}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      ({chef.totalReviews})
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-[var(--input)] px-3 py-1.5 rounded-full text-[var(--text-muted)]">
                  <MapPin className="w-4 h-4" />
                  Up to {chef.deliveryRadius} miles
                </div>
                {allItems.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full text-primary">
                    <UtensilsCrossed className="w-4 h-4" />
                    {allItems.length} items
                  </div>
                )}
              </div>
              {chef.cuisineTypes && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {parseCuisineTypes(chef.cuisineTypes).map((c) => (
                    <span
                      key={c}
                      className="text-xs badge-gradient text-white px-2.5 py-1 rounded-full font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Collapsible Operating Hours */}
          {operatingHours && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <button
                onClick={() => setShowAllHours(!showAllHours)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80 transition"
              >
                <Clock className="w-4 h-4" />
                {showAllHours ? "Hide hours" : "View all hours"}
                {showAllHours ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {showAllHours && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {DAY_ORDER.map((day) => {
                    const hours = operatingHours[day];
                    const isToday = day === todayName;
                    return (
                      <div
                        key={day}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                          isToday
                            ? "bg-primary/5 border border-primary/20"
                            : "bg-[var(--input)]/50"
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            isToday ? "text-primary" : "text-[var(--text)]"
                          }`}
                        >
                          {day}
                          {isToday && (
                            <span className="text-[10px] ml-1.5 text-primary/70 font-normal">
                              (Today)
                            </span>
                          )}
                        </span>
                        {hours && hours.enabled ? (
                          <span className="text-[var(--text-soft)]">
                            {formatTime(hours.open)} &ndash; {formatTime(hours.close)}
                          </span>
                        ) : (
                          <span className="text-red-400 text-xs font-medium">
                            Closed
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kitchen Closed Banner */}
        {!isKitchenOpen && (
          <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">
              This kitchen is currently closed. You can browse the menu but ordering is not available right now.
            </p>
          </div>
        )}

        {/* Vacation Banner */}
        {isOnVacation && (
          <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">On Holiday</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                This kitchen is currently on vacation. Please check back later!
              </p>
            </div>
          </div>
        )}

        {/* Past Cutoff Banner */}
        {pastCutoff && !isOnVacation && isKitchenOpen && (
          <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 mb-4">
            <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Same-day ordering has closed (cutoff: {chef.orderCutoffTime ? formatTime(chef.orderCutoffTime) : ""}). You can still order for future dates.
            </p>
          </div>
        )}

        {/* Date Closed Banner */}
        {dateMenuClosed && !isOnVacation && (
          <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">
              Kitchen is closed on this date.
            </p>
          </div>
        )}

        {/* Spacer when no banners */}
        {isKitchenOpen && !isOnVacation && !pastCutoff && !dateMenuClosed && <div className="mb-4" />}

        {/* Menu Items */}
        {(() => {
          const displayItems = dateMenuItems !== null ? dateMenuItems : allItems;
          const showDateSelector = true;
          const datePills: { date: string; label: string; dayName: string; isToday: boolean }[] = [];
          for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const ds = d.toISOString().split("T")[0];
            datePills.push({
              date: ds,
              label: d.getDate().toString(),
              dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],
              isToday: i === 0,
            });
          }
          return displayItems.length > 0 || showDateSelector ? (
          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-4">
              Menu
            </h2>

            {/* Date Selector Pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
              {datePills.map((pill) => (
                <button
                  key={pill.date}
                  onClick={() => setSelectedDate(pill.date)}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs font-medium transition-all shrink-0 border ${
                    selectedDate === pill.date
                      ? "badge-gradient text-white border-transparent shadow-lg"
                      : "bg-[var(--card)] border-[var(--border)] text-[var(--text)] hover:border-primary/30"
                  }`}
                >
                  <span className={`text-[10px] ${selectedDate === pill.date ? "text-white/80" : "text-[var(--text-muted)]"}`}>
                    {pill.dayName}
                  </span>
                  <span className="text-sm font-bold mt-0.5">{pill.label}</span>
                </button>
              ))}
            </div>

            {dateMenuLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-12 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                <UtensilsCrossed className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
                <p className="text-sm text-[var(--text-muted)]">No menu items for this date</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Try selecting a different day</p>
              </div>
            ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {displayItems.map((item) => {
                const qty = getItemQty(item.id);
                const isSoldOut = item.stockCount !== null && item.stockCount <= 0;
                const hasOffer =
                  item.offerPrice != null && item.offerPrice < item.price;
                const discountPct = hasOffer
                  ? Math.round((1 - item.offerPrice! / item.price) * 100)
                  : 0;
                const isAddDisabled = !isKitchenOpen || isSoldOut || isOnVacation || dateMenuClosed || (pastCutoff && selectedDate === new Date().toISOString().split("T")[0]);

                return (
                  <div
                    key={item.id}
                    className={`bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 flex gap-4 transition-all duration-200 ${
                      isSoldOut
                        ? "opacity-60"
                        : "hover:shadow-lg hover:scale-[1.01]"
                    }`}
                  >
                    {/* Image with offer badge */}
                    <div className="relative shrink-0">
                      <img
                        src={item.image || MENU_ITEM_FALLBACK}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      {hasOffer && (
                        <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {item.isVeg && (
                            <Leaf className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          )}
                          <h3 className="font-semibold text-[var(--text)] truncate">
                            {item.name}
                          </h3>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                        {item.calories && <span>{item.calories} cal</span>}
                        {item.prepTime && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {item.prepTime} min
                          </span>
                        )}
                      </div>

                      {/* Egg option badges */}
                      {item.eggOption && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {(item.eggOption === "egg" || item.eggOption === "both") && (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              Egg
                            </span>
                          )}
                          {(item.eggOption === "eggless" || item.eggOption === "both") && (
                            <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                              Eggless
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stock indicator */}
                      {item.stockCount !== null && (
                        <div className="mt-1.5">
                          {isSoldOut ? (
                            <span className="text-[10px] font-semibold text-red-500 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                              Sold Out
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                item.stockCount < 5
                                  ? "text-red-500 dark:text-red-400 bg-red-500/10"
                                  : item.stockCount <= 10
                                    ? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
                                    : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                              }`}
                            >
                              {item.stockCount} plates left
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price + Add to cart */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {hasOffer ? (
                            <>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                &pound;{item.offerPrice!.toFixed(2)}
                              </span>
                              <span className="text-[var(--text-muted)] text-xs line-through">
                                &pound;{item.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-primary font-bold">
                              &pound;{item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {isSoldOut ? (
                          <span className="text-xs text-[var(--text-muted)] font-medium px-3.5 py-1.5">
                            Unavailable
                          </span>
                        ) : qty === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            disabled={isAddDisabled}
                            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1 transition ${
                              isAddDisabled
                                ? "bg-[var(--input)] text-[var(--text-muted)] cursor-not-allowed"
                                : "badge-gradient text-white hover:opacity-90"
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-full bg-[var(--input)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-primary/10 transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-bold text-[var(--text)] w-5 text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              disabled={isAddDisabled}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                                isAddDisabled
                                  ? "bg-[var(--input)] text-[var(--text-muted)] cursor-not-allowed"
                                  : "badge-gradient text-white hover:opacity-90"
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </section>
          ) : null;
        })()}

        {/* Services */}
        {chef.services.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-5">
              Services
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {chef.services.map((service) => (
                <div
                  key={service.id}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-[var(--text)]">
                      {service.name}
                    </h3>
                    <span className="text-primary font-bold text-sm">
                      from &pound;{service.basePrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs badge-gradient text-white px-2 py-0.5 rounded-full font-medium inline-block">
                    {service.type.replace(/_/g, " ")}
                  </span>
                  {service.description && (
                    <p className="text-sm text-[var(--text-muted)] mt-2">
                      {service.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tiffin Subscription Plans */}
        {tiffinPlans.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-5 flex items-center gap-2">
              <Repeat className="w-6 h-6 text-primary" />
              Tiffin Plans
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tiffinPlans.map((plan: any) => (
                <div
                  key={plan.id}
                  className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[var(--text)]">{plan.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        {plan.mealsPerDay} meal{plan.mealsPerDay > 1 ? "s" : ""}/day · {plan.frequency === "WEEKLY" ? "Weekly" : "Monthly"}
                        {plan.isVeg && <span className="ml-1 text-green-600">· Veg</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">£{plan.price.toFixed(2)}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">/{plan.frequency === "WEEKLY" ? "week" : "month"}</p>
                    </div>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-[var(--text-soft)] mb-4">{plan.description}</p>
                  )}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribingPlanId === plan.id}
                    className="w-full btn-premium py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {subscribingPlanId === plan.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                    ) : (
                      <><Repeat className="w-4 h-4" /> Subscribe</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        {chef.reviews.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-5">
              Reviews
            </h2>
            <div className="space-y-4">
              {chef.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 badge-gradient rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {review.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[var(--text)]">
                        {review.user.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-[var(--text-muted)]">
                      {new Date(review.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-[var(--text-soft)]">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="badge-gradient text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium">
            <Check className="w-4 h-4" />
            {toast}
          </div>
        </div>
      )}

      {/* Sticky Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 glass bg-[var(--card)]/95 border-t border-[var(--border)] shadow-2xl">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 badge-gradient rounded-xl flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  {cartCount} item{cartCount !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  &pound;{cartTotal.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/cart")}
              className="badge-gradient text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition shadow-lg"
            >
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
