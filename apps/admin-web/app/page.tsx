"use client";

import { useState, useEffect } from "react";

const SIDEBAR_ITEMS = [
  { section: "OVERVIEW", items: [{ icon: "📊", label: "Dashboard", active: true }] },
  { section: "ORDERS", items: [{ icon: "📋", label: "Active Orders" }, { icon: "📦", label: "Order History" }, { icon: "🔔", label: "Notifications" }] },
  { section: "FOOD & MENU", items: [{ icon: "🍽️", label: "Menu Management" }, { icon: "📝", label: "Add Dish" }] },
  { section: "BUSINESS", items: [{ icon: "💰", label: "Earnings" }, { icon: "⭐", label: "Reviews" }, { icon: "📈", label: "Analytics" }] },
];

const STATS = [
  { label: "Today's Orders", value: "0", sub: "Total orders", icon: "📦" },
  { label: "Active Now", value: "0", sub: "Being prepared", icon: "🔔" },
  { label: "Revenue", value: "₹0", sub: "Today's total", icon: "💰" },
];

export default function DashboardPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-[var(--card)] border-r border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-bold">H</div>
          <div>
            <div className="text-sm font-bold text-[var(--text)]">Homeal</div>
            <div className="text-[10px] text-[var(--text-muted)]">Chef Dashboard</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {SIDEBAR_ITEMS.map((group, gi) => (
            <div key={gi} className="mb-1">
              <div className="text-[9px] font-bold tracking-wider text-[var(--text-muted)] uppercase px-3 py-2">{group.section}</div>
              {group.items.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs ${
                    item.active
                      ? "bg-primary/10 text-[var(--primary)] font-bold"
                      : "text-[var(--text-muted)] hover:bg-[var(--input)]"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full text-xs py-2 px-3 rounded-lg bg-[var(--input)] text-[var(--text-soft)] hover:bg-[var(--border)] transition"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="px-6 py-3 bg-[var(--card)] border-b border-[var(--border)] flex justify-between items-center">
          <h1 className="text-lg font-bold text-[var(--text)]">Dashboard</h1>
          <div className="flex gap-3 items-center">
            <span className="text-lg cursor-pointer opacity-50">🔔</span>
            <span className="text-lg cursor-pointer opacity-50">⚙️</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold">AK</div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {STATS.map((s, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
                  <span className="text-xl">{s.icon}</span>
                </div>
                <div className="text-2xl font-black text-[var(--primary)]">{s.value}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Active Orders placeholder */}
          <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6">
            <h2 className="text-sm font-bold text-[var(--text)] mb-4">Active Orders</h2>
            <div className="text-center py-12 text-[var(--text-muted)]">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm">No active orders yet</p>
              <p className="text-xs mt-1">New orders will appear here with sound alerts</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
