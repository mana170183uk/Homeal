"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChefHat,
  MapPin,
  UtensilsCrossed,
  Clock,
  Check,
  X,
  Loader2,
  AlertCircle,
  MessageSquare,
  Package,
  Truck,
  CircleCheckBig,
  Navigation,
  Phone,
} from "lucide-react";
import Header from "../../components/Header";
import { api } from "../../lib/api";
import type { Order } from "../../lib/types";

const ORDER_STEPS = [
  { key: "PLACED", label: "Placed", icon: Clock },
  { key: "ACCEPTED", label: "Accepted", icon: Check },
  { key: "PREPARING", label: "Preparing", icon: UtensilsCrossed },
  { key: "READY", label: "Ready", icon: Package },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CircleCheckBig },
];

const STEP_INDEX: Record<string, number> = {};
ORDER_STEPS.forEach((s, i) => {
  STEP_INDEX[s.key] = i;
});

const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED", "REJECTED"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [toast, setToast] = useState("");
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("homeal_token");
    if (!token) {
      router.push(`/login?redirect=/orders/${id}`);
      return;
    }
    fetchOrder(token);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchOrder(token: string) {
    try {
      const res = await api<Order>(`/orders/${id}`, { token });
      if (res.success && res.data) {
        // Check if status changed for toast
        if (prevStatusRef.current && prevStatusRef.current !== res.data.status) {
          showToast(`Order status updated to ${res.data.status.replace(/_/g, " ")}`);
        }
        prevStatusRef.current = res.data.status;
        setOrder(res.data);
      } else {
        setError(res.error || "Order not found.");
      }
    } catch {
      setError("Failed to load order.");
    } finally {
      setLoading(false);
    }
  }

  // Polling
  useEffect(() => {
    if (!order || TERMINAL_STATUSES.includes(order.status)) return;

    const token = localStorage.getItem("homeal_token");
    if (!token) return;

    const interval = setInterval(() => {
      fetchOrder(token);
    }, 10000);

    return () => clearInterval(interval);
  }, [order?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirmed) return;

    setCancelling(true);
    setCancelError("");

    try {
      const token = localStorage.getItem("homeal_token")!;
      const res = await api<Order>(`/orders/${id}/cancel`, {
        method: "POST",
        token,
      });

      if (res.success && res.data) {
        setOrder(res.data);
        prevStatusRef.current = res.data.status;
        showToast("Order cancelled successfully");
      } else {
        setCancelError(res.error || "Failed to cancel order.");
      }
    } catch {
      setCancelError("Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden">
        <Header showBack />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-[var(--text-muted)]">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden">
        <Header showBack />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-[var(--text)] mb-2">
              {error || "Order not found"}
            </h2>
            <button
              onClick={() => router.push("/orders")}
              className="text-primary font-medium hover:underline"
            >
              View all orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED" || order.status === "REJECTED";
  const currentStepIdx = STEP_INDEX[order.status] ?? -1;

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)]">
              Order <span className="gradient-text">#{order.id.slice(0, 8).toUpperCase()}</span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Progress Bar */}
          <div className="glass-card rounded-2xl p-5">
            {isCancelled ? (
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-600 text-lg">
                    Order {order.status === "CANCELLED" ? "Cancelled" : "Rejected"}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {order.status === "CANCELLED"
                      ? "This order has been cancelled."
                      : "This order was rejected by the chef."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display font-semibold text-[var(--text)] mb-4">
                  Order Status
                </h2>

                {/* Desktop progress bar */}
                <div className="hidden sm:block">
                  <div className="flex items-center justify-between relative">
                    {/* Connector line */}
                    <div className="absolute top-5 left-[calc(8.33%)] right-[calc(8.33%)] h-0.5 bg-[var(--border)]" />
                    <div
                      className="absolute top-5 left-[calc(8.33%)] h-0.5 badge-gradient transition-all duration-500"
                      style={{
                        width: currentStepIdx >= 0
                          ? `${(currentStepIdx / (ORDER_STEPS.length - 1)) * (100 - 16.66)}%`
                          : "0%",
                      }}
                    />

                    {ORDER_STEPS.map((step, i) => {
                      const isActive = i <= currentStepIdx;
                      const isCurrent = i === currentStepIdx;
                      const StepIcon = step.icon;

                      return (
                        <div key={step.key} className="flex flex-col items-center z-[1] relative" style={{ width: `${100 / ORDER_STEPS.length}%` }}>
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isActive
                                ? "badge-gradient text-white shadow-lg"
                                : "bg-[var(--input)] border border-[var(--border)] text-[var(--text-muted)]"
                            } ${isCurrent ? "ring-4 ring-[var(--badge-from)]/20 scale-110" : ""}`}
                          >
                            <StepIcon className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[10px] sm:text-xs mt-2 text-center font-medium transition-colors ${
                              isActive ? "text-[var(--text)]" : "text-[var(--text-muted)]"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile progress - vertical */}
                <div className="sm:hidden space-y-0">
                  {ORDER_STEPS.map((step, i) => {
                    const isActive = i <= currentStepIdx;
                    const isCurrent = i === currentStepIdx;
                    const StepIcon = step.icon;
                    const isLast = i === ORDER_STEPS.length - 1;

                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isActive
                                ? "badge-gradient text-white"
                                : "bg-[var(--input)] border border-[var(--border)] text-[var(--text-muted)]"
                            } ${isCurrent ? "ring-2 ring-[var(--badge-from)]/20 scale-110" : ""}`}
                          >
                            <StepIcon className="w-3.5 h-3.5" />
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 h-6 ${
                                isActive && i < currentStepIdx
                                  ? "badge-gradient"
                                  : "bg-[var(--border)]"
                              }`}
                            />
                          )}
                        </div>
                        <div className={`pt-1.5 ${!isLast ? "pb-3" : ""}`}>
                          <span
                            className={`text-sm font-medium ${
                              isActive ? "text-[var(--text)]" : "text-[var(--text-muted)]"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Chef Info */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-[var(--text)]">
                Chef
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl badge-gradient flex items-center justify-center text-white">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text)]">
                  {order.chef.kitchenName}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  by {order.chef.user.name}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-[var(--text)]">
                  Delivery Address
                </h2>
              </div>
              <div className="text-sm text-[var(--text-soft)]">
                <p className="font-medium text-[var(--text)] mb-0.5">
                  {order.address.label}
                </p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.city}
                  {order.address.state ? `, ${order.address.state}` : ""}{" "}
                  {order.address.zipCode}
                </p>
              </div>
            </div>
          )}

          {/* Kitchen Pickup Location - shown after payment for pickup orders */}
          {order.chefLocation && order.deliveryMethod === "PICKUP" && (
            <div className="glass-card rounded-2xl p-5 border border-green-200 dark:border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Navigation className="w-5 h-5 text-green-600" />
                <h2 className="font-display font-semibold text-[var(--text)]">
                  Pickup Location
                </h2>
              </div>
              <div className="text-sm text-[var(--text-soft)] space-y-2">
                <p className="font-medium text-[var(--text)]">
                  {order.chef.kitchenName}
                </p>
                {order.chefLocation.address && <p>{order.chefLocation.address}</p>}
                <p>
                  {order.chefLocation.city && `${order.chefLocation.city}, `}
                  {order.chefLocation.postcode}
                </p>
                {order.chefLocation.contactPhone && (
                  <a
                    href={`tel:${order.chefLocation.contactPhone}`}
                    className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {order.chefLocation.contactPhone}
                  </a>
                )}
                {order.chefLocation.latitude && order.chefLocation.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${order.chefLocation.latitude},${order.chefLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 badge-gradient text-white text-sm font-semibold rounded-xl shadow hover:shadow-lg transition"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-[var(--text)]">
                Items
              </h2>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.menuItem.image ? (
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg badge-gradient opacity-20 flex items-center justify-center shrink-0">
                        <UtensilsCrossed className="w-4 h-4 text-white opacity-60" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text)] truncate">
                        {item.menuItem.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text)] shrink-0 ml-2">
                    &pound;{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-[var(--border)] mt-4 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-[var(--text-soft)]">
                <span>Subtotal</span>
                <span>&pound;{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-soft)]">
                <span>Delivery fee</span>
                <span>&pound;{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-[var(--text)]">
                <span>Total</span>
                <span className="gradient-text">&pound;{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-[var(--text)]">
                  Special Instructions
                </h2>
              </div>
              <p className="text-sm text-[var(--text-soft)] italic">
                &ldquo;{order.specialInstructions}&rdquo;
              </p>
            </div>
          )}

          {/* Cancel button */}
          {order.status === "PLACED" && (
            <div className="space-y-2">
              {cancelError && (
                <div className="flex items-center gap-2 text-alert text-sm bg-alert/5 border border-alert/20 rounded-xl px-4 py-3 animate-fade-in-up">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {cancelError}
                </div>
              )}
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full font-semibold py-3 rounded-xl border-2 border-red-300 dark:border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Cancel Order
                  </>
                )}
              </button>
            </div>
          )}

          {/* Back to orders */}
          <button
            onClick={() => router.push("/orders")}
            className="w-full text-center text-sm font-medium text-[var(--text-muted)] hover:text-primary transition py-3"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Back to all orders
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="badge-gradient text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium">
            <Check className="w-4 h-4" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
