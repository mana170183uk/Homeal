"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, LogOut, User } from "lucide-react";
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

  async function handleLogout() {
    await signOut(getFirebaseAuth());
    localStorage.removeItem("homeal_token");
    localStorage.removeItem("homeal_refresh_token");
    window.location.href = "/";
  }

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const avatar = user?.photoURL;

  return (
    <header className="bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-10">
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
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
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
              className="text-xs sm:text-sm font-semibold bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-light transition"
            >
              Sign up
            </a>
          </>
        )}
      </div>
    </header>
  );
}
