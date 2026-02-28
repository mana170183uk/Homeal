"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  ArrowRight,
  Search,
} from "lucide-react";
import Header from "../components/Header";

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

const DELIVERY_FEE = 2.5;

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
  }, []);

  function updateQuantity(itemId: string, delta: number) {
    const current = getCart();
    const idx = current.findIndex((c) => c.id === itemId);
    if (idx === -1) return;

    current[idx].quantity += delta;
    if (current[idx].quantity <= 0) {
      current.splice(idx, 1);
    }

    saveCart(current);
    setCart([...current]);
  }

  function removeItem(itemId: string) {
    const current = getCart().filter((c) => c.id !== itemId);
    saveCart(current);
    setCart([...current]);
  }

  function clearCart() {
    saveCart([]);
    setCart([]);
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const kitchenName = cart.length > 0 ? cart[0].chefName : "";

  if (!mounted) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden">
        <Header showBack />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="h-8 w-48 bg-[var(--input)] rounded-lg animate-pulse mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-[var(--input)] rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in-up">
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)]">
            Your <span className="gradient-text">Cart</span>
          </h1>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-medium text-[var(--text-muted)] hover:text-alert transition px-3 py-1.5 rounded-lg hover:bg-alert/5"
            >
              Clear all
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--input)] flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
              Your cart is empty
            </h2>
            <p className="text-[var(--text-soft)] mb-6 max-w-sm mx-auto">
              Discover delicious homemade food, cakes, pickles &amp; more from local sellers near you.
            </p>
            <a
              href="/search"
              className="btn-premium inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl"
            >
              <Search className="w-4 h-4" />
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Kitchen name header */}
            <div className="flex items-center gap-2 text-sm text-[var(--text-soft)]">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              <span>
                Items from <span className="font-semibold text-[var(--text)]">{kitchenName}</span>
              </span>
            </div>

            {/* Items list */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="glass-card rounded-2xl p-4 flex gap-4 animate-fade-in-up"
                >
                  {/* Image */}
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-[var(--text)] truncate">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-alert hover:bg-alert/5 transition shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-primary font-bold mt-1">
                      &pound;{(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-[var(--input)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-primary/10 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-[var(--text)] w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full badge-gradient flex items-center justify-center text-white hover:opacity-90 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-semibold text-[var(--text)]">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--text-soft)]">
                  <span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
                  <span>&pound;{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-soft)]">
                  <span>Delivery fee</span>
                  <span className="text-xs italic">Calculated at checkout</span>
                </div>
                <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-[var(--text)]">
                  <span>Total</span>
                  <span className="gradient-text">&pound;{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout button */}
            <button
              onClick={() => router.push("/checkout")}
              className="btn-premium w-full font-semibold py-4 rounded-xl text-white flex items-center justify-center gap-2 text-lg"
            >
              Continue to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
