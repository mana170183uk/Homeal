"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  LogOut,
  ShoppingBag,
  ChevronDown,
  ClipboardList,
  Compass,
  Package,
  MapPin,
  Store,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase";
import { useAuth } from "../lib/useAuth";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  showBack?: boolean;
  maxWidth?: string;
}

export default function Header({ showBack, maxWidth = "max-w-7xl" }: HeaderProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signupMenuOpen, setSignupMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const signupMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (signupMenuRef.current && !signupMenuRef.current.contains(e.target as Node)) {
        setSignupMenuOpen(false);
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

  useEffect(() => {
    const role = localStorage.getItem("homeal_user_role");
    setUserRole(role);
  }, []);

  async function handleLogout() {
    await signOut(getFirebaseAuth());
    localStorage.removeItem("homeal_token");
    localStorage.removeItem("homeal_refresh_token");
    localStorage.removeItem("homeal_cart");
    localStorage.removeItem("homeal_user_name");
    localStorage.removeItem("homeal_user_role");
    window.location.href = "/";
  }

  const storedName = typeof window !== "undefined" ? localStorage.getItem("homeal_user_name") : null;
  const displayName = storedName || user?.displayName || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "U";
  const avatar = user?.photoURL;

  const navLinks = [
    { label: "Discover", href: "/search", icon: Compass },
    { label: "Products", href: "/products", icon: Package },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

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
          <img src="/logo-full.png" alt="Homeal - Homemade products, from home" className="hidden lg:block h-10 w-auto shrink-0" />
        </a>

        {/* Desktop nav links — only visible when logged in */}
        {!loading && user && (
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-[var(--text-soft)] hover:bg-[var(--input)] hover:text-[var(--text)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </a>
              );
            })}
          </nav>
        )}

        <div className="flex-1" />
        <ThemeToggle />

        {/* Orders link (logged-in users) - desktop only */}
        {!loading && user && (
          <a
            href="/orders"
            className="relative p-2 rounded-xl hover:bg-[var(--input)] transition hidden md:flex"
            aria-label="My Orders"
          >
            <ClipboardList className="w-5 h-5 text-[var(--text-soft)]" />
          </a>
        )}

        {/* Cart indicator - desktop only */}
        {cartCount > 0 && (
          <a href="/cart" className="relative p-2 rounded-xl hover:bg-[var(--input)] transition hidden md:flex">
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
                <div className="w-8 h-8 rounded-full badge-gradient flex items-center justify-center text-xs font-bold text-white">
                  {initials}
                </div>
              )}
              <span className="text-sm font-medium text-[var(--text)] hidden sm:block max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:block" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-20">
                {/* User info */}
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-sm font-medium text-[var(--text)] truncate">{displayName}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                </div>

                {/* My Orders */}
                <a
                  href="/orders"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--input)] transition"
                >
                  <ClipboardList className="w-4 h-4 text-[var(--text-soft)]" />
                  My Orders
                </a>

                {/* My Addresses */}
                <a
                  href="/addresses"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--input)] transition"
                >
                  <MapPin className="w-4 h-4 text-[var(--text-soft)]" />
                  My Addresses
                </a>

                {/* Role switch links */}
                {userRole === "CHEF" && (
                  <a
                    href="https://admin.homeal.uk"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-accent hover:bg-accent/5 transition"
                  >
                    <Store className="w-4 h-4" />
                    Switch to Chef Portal
                  </a>
                )}
                {(userRole === "SUPER_ADMIN" || userRole === "ADMIN") && (
                  <a
                    href="https://superadmin.homeal.uk"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-accent hover:bg-accent/5 transition"
                  >
                    <Store className="w-4 h-4" />
                    Switch to Admin Portal
                  </a>
                )}

                {/* Divider before logout */}
                <div className="border-t border-[var(--border)]" />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-alert hover:bg-alert/5 transition"
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
            {/* Desktop: show both signup buttons */}
            <a
              href="/signup?role=customer"
              className="hidden sm:inline-flex text-xs font-semibold px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
            >
              Sign up as Customer
            </a>
            <a
              href="/signup?role=chef"
              className="hidden sm:inline-flex text-xs font-semibold px-3 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition"
            >
              Sign up as Chef
            </a>
            {/* Mobile: dropdown */}
            <div className="relative sm:hidden" ref={signupMenuRef}>
              <button
                onClick={() => setSignupMenuOpen(!signupMenuOpen)}
                className="text-xs font-semibold badge-gradient text-white px-3 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-1"
              >
                Sign up
                <ChevronDown className="w-3 h-3" />
              </button>
              {signupMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-20">
                  <a
                    href="/login"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--input)] transition border-b border-[var(--border)]"
                  >
                    Log in
                  </a>
                  <a
                    href="/signup?role=customer"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-primary font-medium hover:bg-primary/5 transition"
                  >
                    Sign up as Customer
                  </a>
                  <a
                    href="/signup?role=chef"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-accent font-medium hover:bg-accent/5 transition"
                  >
                    Sign up as Chef
                  </a>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
