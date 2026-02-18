"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Repeat,
  Loader2,
  Pause,
  Play,
  XCircle,
  CheckCircle2,
  UtensilsCrossed,
  Leaf,
  Calendar,
} from "lucide-react";
import Header from "../components/Header";
import { api } from "../lib/api";

interface Subscription {
  id: string;
  name: string;
  plan: string;
  price: number;
  status: string;
  frequency: string | null;
  startDate: string;
  endDate: string;
  nextDelivery: string | null;
  chef: { id: string; kitchenName: string } | null;
  tiffinPlan: { name: string; frequency: string; price: number; mealsPerDay: number; isVeg: boolean } | null;
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <SubscriptionsContent />
    </Suspense>
  );
}

function SubscriptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem("homeal_token");
    if (!token) {
      router.push("/login?redirect=/subscriptions");
      return;
    }
    fetchSubscriptions(token);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchSubscriptions(token: string) {
    setLoading(true);
    try {
      const res = await api<Subscription[]>("/subscriptions/my", { token });
      if (res.success && res.data) {
        setSubscriptions(res.data);
      }
    } catch {
      // no subscriptions
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(subId: string, action: "pause" | "resume" | "cancel") {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    setActionLoading(`${subId}-${action}`);
    try {
      const res = await api<Subscription>(`/subscriptions/${subId}/${action}`, {
        method: "POST",
        token,
      });
      if (res.success) {
        fetchSubscriptions(token);
      }
    } catch {
      // failed
    } finally {
      setActionLoading(null);
    }
  }

  const active = subscriptions.filter((s) => s.status === "ACTIVE");
  const paused = subscriptions.filter((s) => s.status === "PAUSED");
  const cancelled = subscriptions.filter((s) => s.status === "CANCELLED");

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in-up">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)] mb-6">
          My <span className="gradient-text">Subscriptions</span>
        </h1>

        {/* Success banner */}
        {showSuccess && (
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 animate-fade-in-up">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Subscription started!</p>
              <p className="text-xs text-[var(--text-soft)]">Your tiffin subscription is now active. You&apos;ll receive regular deliveries as per your plan.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-[var(--text-muted)]">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--input)] flex items-center justify-center">
              <Repeat className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
              No subscriptions yet
            </h2>
            <p className="text-[var(--text-soft)] mb-6 max-w-sm mx-auto">
              Subscribe to tiffin plans from your favourite kitchens for regular home-cooked meals.
            </p>
            <a
              href="/search"
              className="btn-premium inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Browse Kitchens
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active */}
            {active.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Active ({active.length})</h2>
                <div className="space-y-3">
                  {active.map((sub) => (
                    <SubscriptionCard key={sub.id} sub={sub} actionLoading={actionLoading} onAction={handleAction} />
                  ))}
                </div>
              </div>
            )}

            {/* Paused */}
            {paused.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Paused ({paused.length})</h2>
                <div className="space-y-3">
                  {paused.map((sub) => (
                    <SubscriptionCard key={sub.id} sub={sub} actionLoading={actionLoading} onAction={handleAction} />
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled */}
            {cancelled.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Cancelled ({cancelled.length})</h2>
                <div className="space-y-3">
                  {cancelled.map((sub) => (
                    <SubscriptionCard key={sub.id} sub={sub} actionLoading={actionLoading} onAction={handleAction} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SubscriptionCard({
  sub,
  actionLoading,
  onAction,
}: {
  sub: Subscription;
  actionLoading: string | null;
  onAction: (id: string, action: "pause" | "resume" | "cancel") => void;
}) {
  const statusColors: Record<string, string> = {
    ACTIVE: "text-emerald-600 bg-emerald-100",
    PAUSED: "text-amber-600 bg-amber-100",
    CANCELLED: "text-red-600 bg-red-100",
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--text)] truncate">
            {sub.tiffinPlan?.name || sub.name}
          </h3>
          <p className="text-xs text-[var(--text-soft)] mt-0.5">
            from <span className="font-medium text-[var(--text)]">{sub.chef?.kitchenName || "Kitchen"}</span>
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 ${statusColors[sub.status] || "text-gray-600 bg-gray-100"}`}>
          {sub.status}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
        <div>
          <p className="text-[var(--text-muted)]">Price</p>
          <p className="font-bold text-primary">£{sub.price.toFixed(2)}<span className="font-normal text-[var(--text-muted)]">/{sub.frequency === "WEEKLY" ? "wk" : "mo"}</span></p>
        </div>
        <div>
          <p className="text-[var(--text-muted)]">Meals/day</p>
          <p className="font-semibold text-[var(--text)] flex items-center gap-1">
            {sub.tiffinPlan?.mealsPerDay || 1}
            {sub.tiffinPlan?.isVeg && <Leaf className="w-3 h-3 text-green-500" />}
          </p>
        </div>
        <div>
          <p className="text-[var(--text-muted)]">Started</p>
          <p className="font-semibold text-[var(--text)]">{new Date(sub.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
        </div>
        <div>
          <p className="text-[var(--text-muted)]">Next delivery</p>
          <p className="font-semibold text-[var(--text)] flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {sub.nextDelivery ? new Date(sub.nextDelivery).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
          </p>
        </div>
      </div>

      {/* Actions */}
      {sub.status !== "CANCELLED" && (
        <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
          {sub.status === "ACTIVE" && (
            <button
              onClick={() => onAction(sub.id, "pause")}
              disabled={actionLoading === `${sub.id}-pause`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--input)] transition disabled:opacity-50"
            >
              {actionLoading === `${sub.id}-pause` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
              Pause
            </button>
          )}
          {sub.status === "PAUSED" && (
            <button
              onClick={() => onAction(sub.id, "resume")}
              disabled={actionLoading === `${sub.id}-resume`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold btn-premium text-white disabled:opacity-50"
            >
              {actionLoading === `${sub.id}-resume` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Resume
            </button>
          )}
          <button
            onClick={() => onAction(sub.id, "cancel")}
            disabled={actionLoading === `${sub.id}-cancel`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 transition disabled:opacity-50"
          >
            {actionLoading === `${sub.id}-cancel` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
