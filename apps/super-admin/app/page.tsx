"use client";

import { useState, useEffect } from "react";

const SIDEBAR_ITEMS = [
  { section: "OVERVIEW", items: [{ icon: "📊", label: "Dashboard", active: true }] },
  { section: "MANAGEMENT", items: [{ icon: "👨‍🍳", label: "Chefs" }, { icon: "👤", label: "Customers" }, { icon: "📋", label: "Orders" }] },
  { section: "PLATFORM", items: [{ icon: "🏷️", label: "Promo Codes" }, { icon: "📂", label: "Categories" }, { icon: "⚙️", label: "Settings" }] },
  { section: "REPORTS", items: [{ icon: "📈", label: "Analytics" }, { icon: "💰", label: "Revenue" }, { icon: "📄", label: "Reports" }] },
];

const STATS = [
  { label: "Total Users", value: "0", icon: "👤" },
  { label: "Active Chefs", value: "0", icon: "👨‍🍳" },
  { label: "Total Orders", value: "0", icon: "📦" },
  { label: "Revenue", value: "₹0", icon: "💰" },
];

export default function SuperAdminPage() {
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
            <div className="text-[10px] text-[var(--text-muted)]">Super Admin</div>
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
        <header className="px-6 py-3 bg-[var(--card)] border-b border-[var(--border)] flex justify-between items-center">
          <h1 className="text-lg font-bold text-[var(--text)]">Super Admin Dashboard</h1>
          <div className="flex gap-3 items-center">
            <span className="text-lg cursor-pointer opacity-50">🔔</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-xs font-bold">SA</div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {STATS.map((s, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
                  <span className="text-xl">{s.icon}</span>
                </div>
                <div className="text-2xl font-black text-[var(--primary)]">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Placeholder content */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6">
              <h2 className="text-sm font-bold text-[var(--text)] mb-4">Recent Chefs</h2>
              <p className="text-xs text-[var(--text-muted)] text-center py-8">No chefs registered yet</p>
            </div>
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6">
              <h2 className="text-sm font-bold text-[var(--text)] mb-4">Recent Orders</h2>
              <p className="text-xs text-[var(--text-muted)] text-center py-8">No orders yet</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
