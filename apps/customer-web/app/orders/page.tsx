"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  ChevronRight,
  Search,
  UtensilsCrossed,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Header from "../components/Header";
import { api } from "../lib/api";
import type { Order } from "../lib/types";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PLACED: { label: "Placed", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-500/20" },
  ACCEPTED: { label: "Accepted", color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-500/20" },
  PREPARING: { label: "Preparing", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/20" },
  READY: { label: "Ready", color: "text-green-600", bg: "bg-green-100 dark:bg-green-500/20" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-500/20" },
  DELIVERED: { label: "Delivered", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-100 dark:bg-red-500/20" },
  REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-100 dark:bg-red-500/20" },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || { label: status, color: "text-gray-600", bg: "bg-gray-100" };
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMultiSuccess, setShowMultiSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("placed") === "multi") {
      setShowMultiSuccess(true);
      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => setShowMultiSuccess(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem("homeal_token");
    if (!token) {
      router.push("/login?redirect=/orders");
      return;
    }
    fetchOrders(token);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchOrders(token: string) {
    setLoading(true);
    try {
      const res = await api<Order[]>("/orders", { token });
      if (res.success && res.data) {
        setOrders(res.data);
      } else {
        setError(res.error || "Failed to load orders.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in-up">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)] mb-6">
          Your <span className="gradient-text">Orders</span>
        </h1>

        {/* Multi-vendor order success banner */}
        {showMultiSuccess && (
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 animate-fade-in-up">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Orders placed successfully!</p>
              <p className="text-xs text-[var(--text-soft)]">Your orders have been sent to each kitchen. You&apos;ll be notified when they&apos;re accepted.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-[var(--text-muted)]">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <ClipboardList className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-[var(--text)] mb-2">
              Oops!
            </h2>
            <p className="text-[var(--text-soft)] mb-4">{error}</p>
            <button
              onClick={() => {
                const token = localStorage.getItem("homeal_token");
                if (token) fetchOrders(token);
              }}
              className="text-primary font-medium hover:underline"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--input)] flex items-center justify-center">
              <ClipboardList className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
              No orders yet
            </h2>
            <p className="text-[var(--text-soft)] mb-6 max-w-sm mx-auto">
              Discover homemade food, cakes, pickles &amp; more from local sellers.
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
          <div className="space-y-3">
            {orders.map((order) => {
              const statusCfg = getStatusConfig(order.status);
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <button
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="glass-card rounded-2xl p-4 w-full text-left hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Order ID + date */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      {/* Chef name */}
                      <div className="flex items-center gap-2 mb-2">
                        <UtensilsCrossed className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-semibold text-[var(--text)] truncate">
                          {order.chef.kitchenName}
                        </span>
                      </div>

                      {/* Items + total */}
                      <div className="flex items-center gap-3 text-sm text-[var(--text-soft)]">
                        <span>
                          {totalItems} item{totalItems !== 1 ? "s" : ""}
                        </span>
                        <span className="text-[var(--border)]">|</span>
                        <span className="font-semibold text-[var(--text)]">
                          &pound;{order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Status + arrow */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.color} ${statusCfg.bg}`}
                      >
                        {statusCfg.label}
                      </span>
                      <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-primary transition" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
