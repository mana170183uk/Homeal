"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  CreditCard,
  UtensilsCrossed,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Check,
  Banknote,
  ShoppingBag,
} from "lucide-react";
import Header from "../components/Header";
import { api } from "../lib/api";
import type { Address } from "../lib/types";

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

const DELIVERY_FEE = 0.3;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New address form
  const [newLabel, setNewLabel] = useState("Home");
  const [newLine1, setNewLine1] = useState("");
  const [newLine2, setNewLine2] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newPostcode, setNewPostcode] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Order state
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("homeal_token");
    if (!token) {
      router.push("/login?redirect=/checkout");
      return;
    }

    setCart(getCart());
    setMounted(true);
    fetchAddresses(token);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchAddresses(token: string) {
    setLoadingAddresses(true);
    try {
      const res = await api<Address[]>("/users/addresses", { token });
      if (res.success && res.data) {
        setAddresses(res.data);
        const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddress(true);
        }
      }
    } catch {
      // no addresses yet
      setShowNewAddress(true);
    } finally {
      setLoadingAddresses(false);
    }
  }

  async function handleSaveAddress() {
    if (!newLine1.trim() || !newCity.trim() || !newPostcode.trim()) {
      setAddressError("Please fill in address line 1, city, and postcode.");
      return;
    }

    setSavingAddress(true);
    setAddressError("");

    try {
      const token = localStorage.getItem("homeal_token")!;

      // Geocode postcode
      let latitude: number | undefined;
      let longitude: number | undefined;

      try {
        const geoRes = await api<{ lat: number; lng: number; area: string }>(
          `/chefs/geocode?postcode=${encodeURIComponent(newPostcode.trim())}`
        );
        if (geoRes.success && geoRes.data) {
          latitude = geoRes.data.lat;
          longitude = geoRes.data.lng;
        }
      } catch {
        // proceed without geocode
      }

      const res = await api<Address>("/users/addresses", {
        method: "POST",
        token,
        body: JSON.stringify({
          label: newLabel.trim() || "Home",
          line1: newLine1.trim(),
          line2: newLine2.trim() || undefined,
          city: newCity.trim(),
          zipCode: newPostcode.trim(),
          latitude,
          longitude,
          isDefault: addresses.length === 0,
        }),
      });

      if (res.success && res.data) {
        setAddresses((prev) => [...prev, res.data!]);
        setSelectedAddressId(res.data.id);
        setShowNewAddress(false);
        setNewLabel("Home");
        setNewLine1("");
        setNewLine2("");
        setNewCity("");
        setNewPostcode("");
      } else {
        setAddressError(res.error || "Failed to save address.");
      }
    } catch {
      setAddressError("Something went wrong. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      setOrderError("Please select or add a delivery address.");
      return;
    }
    if (cart.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    setPlacing(true);
    setOrderError("");

    try {
      const token = localStorage.getItem("homeal_token")!;

      const res = await api<{ id: string }>("/orders", {
        method: "POST",
        token,
        body: JSON.stringify({
          chefId: cart[0].chefId,
          addressId: selectedAddressId,
          items: cart.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
          specialInstructions: specialInstructions.trim() || undefined,
          paymentMethod: "COD",
        }),
      });

      if (res.success && res.data) {
        // Clear cart
        localStorage.removeItem("homeal_cart");
        window.dispatchEvent(new Event("cart-updated"));
        router.push(`/orders/${res.data.id}`);
      } else {
        setOrderError(res.error || "Failed to place order. Please try again.");
      }
    } catch {
      setOrderError("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = cart.length > 0 ? subtotal + DELIVERY_FEE : 0;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!mounted) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden">
        <Header showBack />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="h-8 w-48 bg-[var(--input)] rounded-lg animate-pulse mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-[var(--input)] rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in-up">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)] mb-6">
          <span className="gradient-text">Checkout</span>
        </h1>

        <div className="space-y-6">
          {/* Delivery Address Section */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-[var(--text)]">
                Delivery Address
              </h2>
            </div>

            {loadingAddresses ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Existing addresses */}
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedAddressId === addr.id
                        ? "border-primary bg-primary/5"
                        : "border-[var(--border)] hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => {
                        setSelectedAddressId(addr.id);
                        setShowNewAddress(false);
                      }}
                      className="mt-1 accent-[var(--primary)]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text)]">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-medium badge-gradient text-white px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-soft)] mt-0.5">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ""}
                        , {addr.city} {addr.zipCode}
                      </p>
                    </div>
                  </label>
                ))}

                {/* Add new address toggle */}
                {!showNewAddress && (
                  <button
                    onClick={() => {
                      setShowNewAddress(true);
                      setSelectedAddressId(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[var(--border)] text-sm font-medium text-[var(--text-soft)] hover:border-primary hover:text-primary transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add new address
                  </button>
                )}

                {/* New address form */}
                {showNewAddress && (
                  <div className="border border-primary/30 rounded-xl p-4 bg-primary/5 space-y-3 animate-fade-in-up">
                    <h3 className="text-sm font-semibold text-[var(--text)]">
                      New Address
                    </h3>
                    <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">
                        Label
                      </label>
                      <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="e.g. Home, Work, Office"
                        className="premium-input w-full px-3 py-2.5 rounded-xl outline-none text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={newLine1}
                        onChange={(e) => setNewLine1(e.target.value)}
                        placeholder="Street address"
                        className="premium-input w-full px-3 py-2.5 rounded-xl outline-none text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={newLine2}
                        onChange={(e) => setNewLine2(e.target.value)}
                        placeholder="Flat, floor, building (optional)"
                        className="premium-input w-full px-3 py-2.5 rounded-xl outline-none text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">
                          City *
                        </label>
                        <input
                          type="text"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          placeholder="City"
                          className="premium-input w-full px-3 py-2.5 rounded-xl outline-none text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">
                          Postcode *
                        </label>
                        <input
                          type="text"
                          value={newPostcode}
                          onChange={(e) => setNewPostcode(e.target.value)}
                          placeholder="SW1A 1AA"
                          className="premium-input w-full px-3 py-2.5 rounded-xl outline-none text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]"
                        />
                      </div>
                    </div>

                    {addressError && (
                      <div className="flex items-center gap-2 text-alert text-sm bg-alert/5 border border-alert/20 rounded-xl px-3 py-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {addressError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {addresses.length > 0 && (
                        <button
                          onClick={() => {
                            setShowNewAddress(false);
                            if (addresses.length > 0) {
                              setSelectedAddressId(addresses[0].id);
                            }
                          }}
                          className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--input)] transition"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={handleSaveAddress}
                        disabled={savingAddress}
                        className="flex-1 btn-premium text-sm font-semibold py-2.5 rounded-xl text-white disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {savingAddress ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Save Address
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Special Instructions */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-[var(--text)]">
                Special Instructions
              </h2>
            </div>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any allergies, dietary requirements, product preferences, or delivery notes..."
              rows={3}
              className="premium-input w-full px-4 py-3 rounded-xl outline-none text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] resize-none"
            />
          </div>

          {/* Order Summary */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-[var(--text)]">
                Order Summary
              </h2>
            </div>

            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[var(--input)] flex items-center justify-center text-xs font-bold text-[var(--text-soft)]">
                      {item.quantity}
                    </span>
                    <span className="text-[var(--text)] truncate">{item.name}</span>
                  </div>
                  <span className="text-[var(--text-soft)] shrink-0 ml-2">
                    &pound;{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border)] pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-[var(--text-soft)]">
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
                <span>&pound;{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-soft)]">
                <span>Delivery fee</span>
                <span>&pound;{DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-[var(--text)]">
                <span>Total</span>
                <span className="gradient-text">&pound;{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-[var(--text)]">
                Payment Method
              </h2>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--input)] border border-[var(--border)]">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  Cash on Delivery
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Pay when your order arrives
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-green-500 ml-auto" />
            </div>
          </div>

          {/* Error */}
          {orderError && (
            <div className="flex items-center gap-2 text-alert text-sm bg-alert/5 border border-alert/20 rounded-xl px-4 py-3 animate-fade-in-up">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {orderError}
            </div>
          )}

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={placing || !selectedAddressId}
            className="btn-premium w-full font-semibold py-4 rounded-xl text-white flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:transform-none"
          >
            {placing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                Place Order - &pound;{total.toFixed(2)}
              </>
            )}
          </button>

          <p className="text-center text-xs text-[var(--text-muted)] pb-4">
            By placing this order, you agree to our terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
