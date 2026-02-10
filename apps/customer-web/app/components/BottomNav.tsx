"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Home, Compass, Package, ClipboardList, ShoppingBag } from "lucide-react";
import { useAuth } from "../lib/useAuth";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function updateCartCount() {
      try {
        const cart = JSON.parse(localStorage.getItem("homeal_cart") || "[]");
        const count = cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    }
    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Discover", href: "/search", icon: Compass },
    { label: "Products", href: "/products", icon: Package },
    { label: "Orders", href: "/orders", icon: ClipboardList },
    { label: "Cart", href: "/cart", icon: ShoppingBag },
  ];

  // Hide bottom nav entirely when not logged in, or on login/signup pages
  if (loading || !user || pathname === "/login" || pathname.startsWith("/signup")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div
        className="glass-card border-t border-[var(--border)]"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isCart = item.href === "/cart";

            return (
              <a
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  active
                    ? "text-primary"
                    : "text-[var(--text-muted)] hover:text-[var(--text-soft)]"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${active ? "text-primary" : ""}`}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  {isCart && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 badge-gradient text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium leading-tight ${
                    active ? "text-primary" : ""
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <div className="absolute -bottom-0.5 w-5 h-0.5 rounded-full badge-gradient" />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
