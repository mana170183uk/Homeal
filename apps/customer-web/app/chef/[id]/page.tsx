"use client";

import { useState, useEffect, use } from "react";
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
} from "lucide-react";
import { api } from "../../lib/api";
import { parseCuisineTypes } from "../../lib/utils";
import Header from "../../components/Header";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isVeg: boolean;
  calories: number | null;
  prepTime: number | null;
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
  operatingHours: string | null;
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

export default function ChefProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [chef, setChef] = useState<ChefDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setCart(getCart());
  }, []);

  useEffect(() => {
    async function fetchChef() {
      try {
        const res = await api<ChefDetail>(`/chefs/${id}`);
        if (res.success && res.data) {
          setChef(res.data);
        } else {
          setError("Chef not found.");
        }
      } catch {
        setError("Failed to load chef profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchChef();
  }, [id]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  function addToCart(item: MenuItem) {
    if (!chef) return;

    let currentCart = getCart();

    // Single-chef policy
    if (currentCart.length > 0 && currentCart[0].chefId !== chef.id) {
      const confirmed = window.confirm(
        `Your cart has items from "${currentCart[0].chefName}". Adding items from "${chef.kitchenName}" will clear your current cart. Continue?`
      );
      if (!confirmed) return;
      currentCart = [];
    }

    const existing = currentCart.find((c) => c.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      currentCart.push({
        id: item.id,
        name: item.name,
        price: item.price,
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
            {error || "Chef not found"}
          </h1>
          <a href="/" className="text-primary font-medium hover:underline">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  const allItems = chef.menus.flatMap((m) => m.items);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack maxWidth="max-w-5xl" />

      {/* Banner */}
      <div className="h-56 md:h-72 relative overflow-hidden">
        {chef.bannerImage ? (
          <img
            src={chef.bannerImage}
            alt={chef.kitchenName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full badge-gradient opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/80 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-[1]">
        {/* Chef Info Card */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-lg p-6 mb-8">
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
              <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-1">
                {chef.kitchenName}
              </h1>
              <p className="text-[var(--text-soft)] mb-3">
                by {chef.user.name}
              </p>
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
                  Up to {chef.deliveryRadius} km
                </div>
                {allItems.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full text-primary">
                    <UtensilsCrossed className="w-4 h-4" />
                    {allItems.length} dishes
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
        </div>

        {/* Menu Items */}
        {allItems.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-5">
              Menu
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {allItems.map((item) => {
                const qty = getItemQty(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 flex gap-4 hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 badge-gradient opacity-20 rounded-xl flex items-center justify-center shrink-0">
                        <UtensilsCrossed className="w-8 h-8 text-white opacity-60" />
                      </div>
                    )}
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
                      {/* Price + Add to cart */}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-primary font-bold">
                          &pound;{item.price.toFixed(2)}
                        </span>
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="badge-gradient text-white text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1 hover:opacity-90 transition"
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
                              className="w-7 h-7 rounded-full badge-gradient flex items-center justify-center text-white hover:opacity-90 transition"
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
          </section>
        )}

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
              onClick={() => {
                alert(`Ordering coming soon! Your cart has ${cartCount} item${cartCount !== 1 ? "s" : ""} totalling \u00A3${cartTotal.toFixed(2)}. Your cart has been saved.`);
              }}
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
