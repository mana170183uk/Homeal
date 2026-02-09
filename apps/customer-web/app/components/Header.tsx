"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, LogOut, ShoppingBag } from "lucide-react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase";
import { useAuth } from "../lib/useAuth";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  showBack?: boolean;
  maxWidth?: string;
}

export default function Header({ showBack, maxWidth = "max-w-7xl" }: HeaderProps) {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  async function handleLogout() {
    await signOut(getFirebaseAuth());
    localStorage.removeItem("homeal_token");
    localStorage.removeItem("homeal_refresh_token");
    localStorage.removeItem("homeal_cart");
    window.location.href = "/";
  }

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const avatar = user?.photoURL;

  return (
    <header
      className="bg-[var(--header-bg,var(--card))] sticky top-0 z-10"
      style={{
        borderBottom: "2px solid transparent",
        borderImage: "linear-gradient(90deg, var(--badge-from), var(--badge-to)) 1",
      }}
    >
      <div className={`px-4 sm:px-6 py-3 sm:py-4 ${maxWidth} mx-auto flex items-center gap-3 sm:gap-4`}>
        {showBack && (
          <a
            href="/"
            className="text-[var(--text-soft)] hover:text-primary transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
        )}
        <a href="/" className="flex items-center gap-2" aria-label="Homeal - Home">
          <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--logo-bg)" }}>
            <img src="/favicon-final-2.png" alt="" className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg" />
          </div>
          <img src="/logo-full.png" alt="Homeal - Healthy food, from home" className="hidden lg:block h-10 w-auto shrink-0" />
        </a>
        <div className="flex-1" />
        <ThemeToggle />

        {/* Cart indicator */}
        {cartCount > 0 && (
          <a href="#" onClick={(e) => { e.preventDefault(); alert(`Your cart has ${cartCount} item${cartCount !== 1 ? "s" : ""}. Ordering coming soon!`); }} className="relative p-2 rounded-xl hover:bg-[var(--input)] transition">
            <ShoppingBag className="w-5 h-5 text-[var(--text-soft)]" />
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 badge-gradient text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </a>
        )}

        {loading ? (
          <div className="w-8 h-8 rounded-full bg-[var(--input)] animate-pulse" />
        ) : user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--input)] transition"
            >
              {avatar ? (
                <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full badge-gradient flex items-center justify-center text-sm font-bold text-white">
                  {initial}
                </div>
              )}
              <span className="text-sm font-medium text-[var(--text)] hidden sm:block max-w-[120px] truncate">
                {displayName}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-20">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-sm font-medium text-[var(--text)] truncate">{displayName}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-alert hover:bg-alert/5 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <a
              href="/login"
              className="text-sm font-medium text-[var(--text-soft)] hover:text-primary transition hidden sm:block"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="text-xs sm:text-sm font-semibold badge-gradient text-white px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              Sign up
            </a>
          </>
        )}
      </div>
    </header>
  );
}
