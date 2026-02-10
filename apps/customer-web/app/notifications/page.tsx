"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ChefHat,
  Megaphone,
  MessageSquare,
  Info,
} from "lucide-react";
import Header from "../components/Header";
import { api } from "../lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: string | null;
  isRead: boolean;
  createdAt: string;
}

function groupByDate(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};
  for (const n of notifications) {
    const date = new Date(n.createdAt).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(n);
  }
  return groups;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "CHEF_UPDATE":
      return <ChefHat className="w-5 h-5 text-primary" />;
    case "ORDER_UPDATE":
      return <Check className="w-5 h-5 text-emerald-500" />;
    case "PROMOTION":
      return <Megaphone className="w-5 h-5 text-amber-500" />;
    case "CHAT":
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    default:
      return <Info className="w-5 h-5 text-[var(--text-muted)]" />;
  }
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function NotificationsPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth gate
  useEffect(() => {
    const token = localStorage.getItem("homeal_token");
    if (!token) {
      router.push("/login?redirect=/notifications");
      return;
    }
    setAuthChecked(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      const token = localStorage.getItem("homeal_token");
      if (!token) return;
      try {
        const res = await api<{ notifications: Notification[]; unreadCount: number }>(
          "/notifications",
          { token }
        );
        if (res.success && res.data) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.unreadCount);
        } else {
          setError("Failed to load notifications.");
        }
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    if (authChecked) {
      fetchNotifications();
    }
  }, [authChecked]);

  async function markAllAsRead() {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      await api("/notifications/read-all", { method: "POST", token });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }

  async function markAsRead(notificationId: string) {
    const token = localStorage.getItem("homeal_token");
    if (!token) return;
    try {
      await api(`/notifications/${notificationId}/read`, { method: "PATCH", token });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }

  function handleNotificationClick(notification: Notification) {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate for CHEF_UPDATE notifications
    if (notification.type === "CHEF_UPDATE" && notification.data) {
      try {
        const data = JSON.parse(notification.data);
        if (data.chefId) {
          router.push(`/chef/${data.chefId}`);
          return;
        }
      } catch {
        // invalid JSON, ignore
      }
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const grouped = groupByDate(notifications);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)]">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition sm:ml-auto"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--input)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--input)] rounded w-3/4" />
                    <div className="h-3 bg-[var(--input)] rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
              Oops!
            </h2>
            <p className="text-[var(--text-soft)] mb-6 max-w-sm mx-auto">
              {error}
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--input)] flex items-center justify-center">
              <BellOff className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
              No notifications yet
            </h2>
            <p className="text-[var(--text-soft)] max-w-sm mx-auto">
              When chefs you follow post updates or your orders change status, you will see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                  {date}
                </h3>
                <div className="space-y-2">
                  {items.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left bg-[var(--card)] rounded-xl border p-4 flex items-start gap-3 transition-all duration-200 hover:shadow-md ${
                        notification.isRead
                          ? "border-[var(--border)] opacity-70"
                          : "border-primary/20 bg-primary/[0.02]"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          notification.isRead
                            ? "bg-[var(--input)]"
                            : "bg-primary/10"
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`text-sm font-semibold truncate ${
                              notification.isRead
                                ? "text-[var(--text-soft)]"
                                : "text-[var(--text)]"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
                          {notification.body}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notification.isRead && (
                        <div className="w-2.5 h-2.5 rounded-full badge-gradient shrink-0 mt-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
