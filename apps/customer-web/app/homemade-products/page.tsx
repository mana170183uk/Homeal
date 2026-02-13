"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Leaf,
  MapPin,
  ShoppingBasket,
  Star,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import Header from "../components/Header";
import { api } from "../lib/api";
import { getSavedLocation, getSavedRadius } from "../lib/location";
import { Category, Product } from "../lib/types";

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

const PAGE_LIMIT = 40;
const PRODUCT_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80&fit=crop";

function HomemadeProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Public page — no login required. Guests can browse products freely.

  const urlCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [vegOnly, setVegOnly] = useState(false);

  const [lat, setLat] = useState<string | null>(null);
  const [lng, setLng] = useState<string | null>(null);
  const [radius, setRadius] = useState(15);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const saved = getSavedLocation();
    if (saved) {
      setLat(saved.lat);
      setLng(saved.lng);
      setRadius(saved.radius);
    } else {
      setRadius(getSavedRadius());
    }
    setCart(getCart());
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api<Category[]>("/products/categories?type=PRODUCT");
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch {
        // silently fail
      }
    }
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(
    async (reset: boolean = true) => {
      if (reset) {
        setLoading(true);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }
      setError("");

      const currentOffset = reset ? 0 : offset + PAGE_LIMIT;

      try {
        const params = new URLSearchParams();
        params.set("categoryType", "PRODUCT");
        if (selectedCategory) params.set("category", selectedCategory);
        if (searchQuery) params.set("search", searchQuery);
        if (vegOnly) params.set("veg", "true");
        if (lat && lng) {
          params.set("lat", lat);
          params.set("lng", lng);
          params.set("radius", String(radius));
        }
        params.set("limit", String(PAGE_LIMIT));
        params.set("offset", String(currentOffset));

        const qs = params.toString();
        const res = await api<{
          products: Product[];
          total: number;
          limit: number;
          offset: number;
        }>(`/products${qs ? `?${qs}` : ""}`);

        if (res.success && res.data) {
          if (reset) {
            setProducts(res.data.products);
          } else {
            setProducts((prev) => [...prev, ...res.data!.products]);
          }
          setTotal(res.data.total);
          setOffset(currentOffset);
        } else {
          setError("Failed to load products. Please try again.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, searchQuery, vegOnly, lat, lng, radius, offset]
  );

  useEffect(() => {
    fetchProducts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery, vegOnly, lat, lng, radius]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchQuery) params.set("search", searchQuery);
    const qs = params.toString();
    router.replace(`/homemade-products${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [selectedCategory, searchQuery, router]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  }

  function handleCategorySelect(catId: string) {
    setSelectedCategory(catId === selectedCategory ? "" : catId);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  function addToCart(product: Product) {
    let currentCart = getCart();
    if (currentCart.length > 0 && currentCart[0].chefId !== product.chef.id) {
      const confirmed = window.confirm(
        `Your cart has items from "${currentCart[0].chefName}". Adding items from "${product.chef.kitchenName}" will clear your current cart. Continue?`
      );
      if (!confirmed) return;
      currentCart = [];
    }
    const existing = currentCart.find((c) => c.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      currentCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        chefId: product.chef.id,
        chefName: product.chef.kitchenName,
      });
    }
    saveCart(currentCart);
    setCart([...currentCart]);
    showToast(`Added "${product.name}" to cart`);
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
  const hasMore = products.length < total;
  const hasLocation = !!(lat && lng);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)]">
            Homemade <span className="gradient-text">Products</span>
          </h1>
          <p className="text-sm text-[var(--text-soft)] mt-1">
            Pickles, sweets, cakes, masalas & more from home kitchens near you
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search pickles, cakes, masalas..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--input)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 badge-gradient text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter row */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setVegOnly((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border transition-all duration-200 ${
              vegOnly
                ? "bg-green-500/10 border-green-500/30 text-green-600"
                : "bg-[var(--input)] border-[var(--border)] text-[var(--text-soft)]"
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            Veg Only
          </button>

          {hasLocation && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--input)] px-3 py-2 rounded-full border border-[var(--border)]">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Within {radius} miles
            </div>
          )}

          {(selectedCategory || searchQuery || vegOnly) && (
            <button
              onClick={() => {
                setSelectedCategory("");
                setSearchQuery("");
                setSearchInput("");
                setVegOnly(false);
              }}
              className="text-xs font-medium text-primary hover:text-primary/80 transition ml-auto"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="mb-6 -mx-4 sm:mx-0">
          <div className="flex gap-2 overflow-x-auto px-4 sm:px-0 pb-2 scrollbar-hide">
            <button
              onClick={() => handleCategorySelect("")}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                selectedCategory === ""
                  ? "badge-gradient text-white border-transparent shadow-md"
                  : "bg-[var(--card)] border-[var(--border)] text-[var(--text-soft)] hover:border-primary/30"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "badge-gradient text-white border-transparent shadow-md"
                    : "bg-[var(--card)] border-[var(--border)] text-[var(--text-soft)] hover:border-primary/30"
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-[var(--text-muted)] mb-4">
            {total} {total === 1 ? "product" : "products"} found
            {selectedCategory &&
              categories.find((c) => c.id === selectedCategory) &&
              ` in ${categories.find((c) => c.id === selectedCategory)!.name}`}
            {searchQuery && ` for "${searchQuery}"`}
            {vegOnly && " \u00B7 Vegetarian"}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden animate-pulse"
              >
                <div className="h-44 bg-[var(--input)]" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-[var(--input)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--input)] rounded w-1/2" />
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-[var(--input)] rounded w-16" />
                    <div className="h-8 bg-[var(--input)] rounded-full w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <ShoppingBasket className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
              Oops!
            </h2>
            <p className="text-[var(--text-soft)] mb-6 max-w-sm mx-auto">
              {error}
            </p>
            <button
              onClick={() => fetchProducts(true)}
              className="gradient-text font-semibold hover:opacity-80 transition"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--input)] flex items-center justify-center">
              <ShoppingBasket className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
              No products found
            </h2>
            <p className="text-[var(--text-soft)] mb-6 max-w-sm mx-auto">
              {searchQuery || selectedCategory || vegOnly
                ? "Try adjusting your filters or search terms."
                : "No homemade products are available right now. Check back later!"}
            </p>
            {(searchQuery || selectedCategory || vegOnly) && (
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchQuery("");
                  setSearchInput("");
                  setVegOnly(false);
                }}
                className="gradient-text font-semibold hover:opacity-80 transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Product grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => {
                const qty = getItemQty(product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-fade-in-up group"
                  >
                    {/* Image */}
                    <a
                      href={`/products/${product.id}`}
                      className="block relative h-44 overflow-hidden"
                    >
                      <img
                        src={product.image || PRODUCT_IMAGE_FALLBACK}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Price badge */}
                      <div className="absolute top-3 right-3 badge-gradient text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                        &pound;{product.price.toFixed(2)}
                      </div>

                      {/* Veg indicator */}
                      {product.isVeg && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow">
                          <Leaf className="w-3 h-3" />
                          Veg
                        </div>
                      )}

                      {/* Distance badge */}
                      {product.chef.distance != null && (
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {product.chef.distance.toFixed(1)} mi
                        </div>
                      )}
                    </a>

                    {/* Info */}
                    <div className="p-4">
                      <a href={`/products/${product.id}`}>
                        <h3 className="font-semibold text-[var(--text)] truncate mb-1 hover:text-primary transition">
                          {product.name}
                        </h3>
                      </a>

                      {/* Seller name */}
                      <a
                        href={`/chef/${product.chef.id}`}
                        className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-primary transition mb-2"
                      >
                        <ShoppingBasket className="w-3 h-3" />
                        <span className="truncate">
                          {product.chef.kitchenName}
                        </span>
                        {product.chef.avgRating > 0 && (
                          <span className="flex items-center gap-0.5 ml-auto shrink-0">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {product.chef.avgRating.toFixed(1)}
                          </span>
                        )}
                      </a>

                      {/* Category tag */}
                      {product.category && (
                        <span className="inline-block text-[10px] font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full mb-3">
                          {product.category.icon && `${product.category.icon} `}
                          {product.category.name}
                        </span>
                      )}

                      {/* Egg option badges */}
                      {product.eggOption && (
                        <div className="flex items-center gap-1.5 mb-2">
                          {(product.eggOption === "egg" || product.eggOption === "both") && (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              Egg
                            </span>
                          )}
                          {(product.eggOption === "eggless" || product.eggOption === "both") && (
                            <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                              Eggless
                            </span>
                          )}
                        </div>
                      )}

                      {/* Add to cart */}
                      <div className="flex items-center justify-between mt-2">
                        {product.description && (
                          <p className="text-xs text-[var(--text-muted)] line-clamp-1 mr-2 flex-1">
                            {product.description}
                          </p>
                        )}
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(product)}
                            className="badge-gradient text-white text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1 hover:opacity-90 transition shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => updateQuantity(product.id, -1)}
                              className="w-7 h-7 rounded-full bg-[var(--input)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-primary/10 transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-bold text-[var(--text)] w-5 text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => addToCart(product)}
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

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => fetchProducts(false)}
                  disabled={loadingMore}
                  className="btn-premium text-white font-semibold px-8 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Load More Products</>
                  )}
                </button>
              </div>
            )}
          </>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
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

export default function HomemadeProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full overflow-x-hidden">
          <Header showBack />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="h-8 w-64 bg-[var(--input)] rounded animate-pulse mb-2" />
            <div className="h-4 w-80 bg-[var(--input)] rounded animate-pulse mb-6" />
            <div className="h-12 bg-[var(--input)] rounded-xl animate-pulse mb-4" />
            <div className="flex gap-2 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-24 bg-[var(--input)] rounded-full animate-pulse"
                />
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden animate-pulse"
                >
                  <div className="h-44 bg-[var(--input)]" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-[var(--input)] rounded w-3/4" />
                    <div className="h-3 bg-[var(--input)] rounded w-1/2" />
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-[var(--input)] rounded w-16" />
                      <div className="h-8 bg-[var(--input)] rounded-full w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <HomemadeProductsContent />
    </Suspense>
  );
}
