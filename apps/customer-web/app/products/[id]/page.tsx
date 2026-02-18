"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Flame,
  Leaf,
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingBag,
  Check,
  ChefHat,
  AlertTriangle,
  Users,
  Info,
} from "lucide-react";
import { api } from "../../lib/api";
import { ProductDetail } from "../../lib/types";
import Header from "../../components/Header";

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

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState("");

  // Auth gate
  useEffect(() => {
    const token = localStorage.getItem("homeal_token");
    if (!token) {
      router.push(`/login?redirect=/products/${id}`);
      return;
    }
    setAuthChecked(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setCart(getCart());
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        const res = await api<ProductDetail>(`/products/${id}`);
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setError("Product not found.");
        }
      } catch {
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  function addToCart() {
    if (!product) return;

    let currentCart = getCart();

    // Max 3 vendor policy
    const vendorIds = new Set(currentCart.map((c) => c.chefId));
    if (!vendorIds.has(product.chef.id) && vendorIds.size >= 3) {
      window.alert("You can order from up to 3 kitchens at a time. Remove items from an existing kitchen to add from a new one.");
      return;
    }

    const existing = currentCart.find((c) => c.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      currentCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        chefId: product.chef.id,
        chefName: product.chef.kitchenName,
      });
    }

    saveCart(currentCart);
    setCart([...currentCart]);
    showToast(
      `Added ${quantity} x "${product.name}" to cart`
    );
    setQuantity(1);
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const existingQty = product
    ? cart.find((c) => c.id === product.id)?.quantity || 0
    : 0;

  // Auth gate
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden">
        <Header showBack maxWidth="max-w-5xl" />
        <div className="animate-pulse">
          <div className="h-64 md:h-80 bg-[var(--input)]" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            <div className="h-8 bg-[var(--input)] rounded w-2/3 mb-4" />
            <div className="h-4 bg-[var(--input)] rounded w-1/2 mb-3" />
            <div className="h-4 bg-[var(--input)] rounded w-full mb-2" />
            <div className="h-4 bg-[var(--input)] rounded w-3/4 mb-6" />
            <div className="flex gap-3 mb-6">
              <div className="h-10 bg-[var(--input)] rounded-full w-24" />
              <div className="h-10 bg-[var(--input)] rounded-full w-24" />
              <div className="h-10 bg-[var(--input)] rounded-full w-24" />
            </div>
            <div className="h-32 bg-[var(--input)] rounded-2xl mb-6" />
            <div className="h-14 bg-[var(--input)] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden">
        <Header showBack maxWidth="max-w-5xl" />
        <div className="flex items-center justify-center px-6 py-20">
          <div className="text-center">
            <UtensilsCrossed className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
              {error || "Product not found"}
            </h1>
            <p className="text-[var(--text-soft)] mb-6">
              The product you are looking for might have been removed or is
              temporarily unavailable.
            </p>
            <a
              href="/products"
              className="gradient-text font-semibold hover:opacity-80 transition"
            >
              Browse all products
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack maxWidth="max-w-5xl" />

      {/* Hero image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full badge-gradient opacity-30 flex items-center justify-center">
            <UtensilsCrossed className="w-20 h-20 text-white opacity-60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/80 to-transparent" />

        {/* Badges on image */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="badge-gradient text-white font-bold px-4 py-2 rounded-full shadow-lg text-lg">
            &pound;{product.price.toFixed(2)}
          </div>
        </div>
        {product.isVeg && (
          <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow">
            <Leaf className="w-3.5 h-3.5" />
            Vegetarian
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative z-[1]">
        {/* Main content card */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-lg p-6 mb-6 animate-fade-in-up">
          {/* Name + category */}
          <div className="mb-4">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)] mb-2">
              {product.name}
            </h1>
            {product.category && (
              <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                {product.category.icon && `${product.category.icon} `}
                {product.category.name}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-[var(--text-soft)] text-sm leading-relaxed mb-5">
              {product.description}
            </p>
          )}

          {/* Quick info badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            {product.calories != null && (
              <div className="flex items-center gap-1.5 bg-[var(--input)] px-3 py-2 rounded-full text-xs font-medium text-[var(--text-soft)]">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                {product.calories} cal
              </div>
            )}
            {product.prepTime != null && (
              <div className="flex items-center gap-1.5 bg-[var(--input)] px-3 py-2 rounded-full text-xs font-medium text-[var(--text-soft)]">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {product.prepTime} min prep
              </div>
            )}
            {product.servingSize && (
              <div className="flex items-center gap-1.5 bg-[var(--input)] px-3 py-2 rounded-full text-xs font-medium text-[var(--text-soft)]">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                {product.servingSize}
              </div>
            )}
            {product.chef.distance != null && (
              <div className="flex items-center gap-1.5 bg-[var(--input)] px-3 py-2 rounded-full text-xs font-medium text-[var(--text-soft)]">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {product.chef.distance.toFixed(1)} miles away
              </div>
            )}
          </div>

          {/* Ingredients */}
          {product.ingredients && (
            <div className="mb-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text)] mb-2">
                <Info className="w-4 h-4 text-primary" />
                Ingredients
              </h3>
              <p className="text-sm text-[var(--text-soft)] leading-relaxed">
                {product.ingredients}
              </p>
            </div>
          )}

          {/* Allergens */}
          {product.allergens && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 mb-1">
                <AlertTriangle className="w-4 h-4" />
                Allergens
              </h3>
              <p className="text-sm text-[var(--text-soft)]">
                {product.allergens}
              </p>
            </div>
          )}

          {/* Quantity selector + Add to cart */}
          <div className="border-t border-[var(--border)] pt-5">
            {existingQty > 0 && (
              <p className="text-xs text-[var(--text-muted)] mb-3">
                Already {existingQty} in cart
              </p>
            )}
            <div className="flex items-center gap-4">
              {/* Quantity selector */}
              <div className="flex items-center gap-3 bg-[var(--input)] border border-[var(--border)] rounded-xl px-3 py-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-primary/10 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold text-[var(--text)] w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-full badge-gradient flex items-center justify-center text-white hover:opacity-90 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to cart button */}
              <button
                onClick={addToCart}
                className="btn-premium flex-1 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 text-base hover:opacity-90 transition"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart &mdash; &pound;
                {(product.price * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>

        {/* Chef info card */}
        <a
          href={`/chef/${product.chef.id}`}
          className="block bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 mb-6 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 animate-fade-in-up"
        >
          <div className="flex items-center gap-4">
            {/* Chef avatar */}
            <div className="w-14 h-14 rounded-2xl p-0.5 badge-gradient shrink-0">
              <div className="w-full h-full bg-[var(--card)] rounded-[12px] flex items-center justify-center overflow-hidden">
                {product.chef.user.avatar ? (
                  <img
                    src={product.chef.user.avatar}
                    alt={product.chef.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ChefHat className="w-7 h-7 text-primary" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--text)] truncate">
                {product.chef.kitchenName}
              </h3>
              <p className="text-xs text-[var(--text-muted)] truncate">
                by {product.chef.user.name}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {product.chef.avgRating > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-[var(--text)]">
                      {product.chef.avgRating.toFixed(1)}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      ({product.chef.totalReviews})
                    </span>
                  </div>
                )}
                {product.chef.distance != null && (
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <MapPin className="w-3 h-3" />
                    {product.chef.distance.toFixed(1)} mi
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 text-xs font-medium text-primary">
              View Seller &rarr;
            </div>
          </div>
        </a>

        {/* More from this seller */}
        {product.moreFromSeller && product.moreFromSeller.length > 0 && (
          <section className="mb-10 animate-fade-in-up">
            <h2 className="font-display text-xl font-bold text-[var(--text)] mb-4">
              More from{" "}
              <span className="gradient-text">
                {product.chef.kitchenName}
              </span>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {product.moreFromSeller.map((item) => (
                <a
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="shrink-0 w-40 bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
                >
                  <div className="relative h-28 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full badge-gradient opacity-30 flex items-center justify-center">
                        <UtensilsCrossed className="w-8 h-8 text-white opacity-60" />
                      </div>
                    )}
                    {item.isVeg && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                        <Leaf className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-[var(--text)] truncate mb-1">
                      {item.name}
                    </h4>
                    <p className="text-primary font-bold text-sm">
                      &pound;{item.price.toFixed(2)}
                    </p>
                  </div>
                </a>
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
            <a
              href="/cart"
              className="badge-gradient text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition shadow-lg"
            >
              View Cart
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
