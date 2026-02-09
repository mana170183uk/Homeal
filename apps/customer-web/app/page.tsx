"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChefHat,
  MapPin,
  Truck,
  UtensilsCrossed,
  ArrowRight,
  Star,
} from "lucide-react";
import { api } from "./lib/api";
import ThemeToggle from "./components/ThemeToggle";

export default function HomePage() {
  const router = useRouter();
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!postcode.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await api<{ lat: number; lng: number; area: string; postcode: string }>(
        `/chefs/geocode?postcode=${encodeURIComponent(postcode.trim())}`
      );

      if (!res.success || !res.data) {
        setError("Invalid postcode. Please enter a valid UK postcode.");
        return;
      }

      router.push(
        `/search?lat=${res.data.lat}&lng=${res.data.lng}&postcode=${encodeURIComponent(res.data.postcode)}&area=${encodeURIComponent(res.data.area || "")}`
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between max-w-7xl mx-auto">
        <a href="/" className="flex items-center gap-2" aria-label="Homeal - Home">
          <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--logo-bg)" }}>
            <img src="/favicon-final-2.png" alt="" className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg" />
          </div>
          <img src="/logo-full.png" alt="Homeal - Healthy food, from home" className="hidden lg:block h-12 w-auto shrink-0" />
        </a>
        <nav className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <a
            href="/login"
            className="text-sm font-medium text-[var(--text-soft)] hover:text-primary transition"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="text-sm font-semibold bg-primary text-white px-4 sm:px-5 py-2.5 rounded-xl hover:bg-primary-light transition"
          >
            Sign up
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 pt-10 sm:pt-16 pb-14 sm:pb-20 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent font-medium text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-full mb-6">
          <Star className="w-4 h-4" />
          Trusted by 500+ home chefs across the UK
        </div>
        <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-[var(--text)] leading-tight mb-4 sm:mb-6">
          Homemade food,
          <br />
          <span className="text-primary">delivered to your door</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-[var(--text-soft)] max-w-2xl mx-auto mb-8 sm:mb-10">
          Discover authentic home-cooked meals from talented local chefs in your
          area. Fresh, healthy, and made with love.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="max-w-xl mx-auto flex items-center gap-2 bg-[var(--card)] rounded-2xl shadow-lg shadow-primary/10 border border-[var(--border)] p-2"
        >
          <div className="flex items-center gap-2 flex-1 px-3">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <input
              type="text"
              value={postcode}
              onChange={(e) => {
                setPostcode(e.target.value);
                setError("");
              }}
              placeholder="Enter your postcode (e.g. SW1A 1AA)"
              className="w-full py-3 text-base bg-transparent outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-light text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Find Chefs</span>
          </button>
        </form>
        {error && <p className="text-alert text-sm mt-3">{error}</p>}
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 py-12 sm:py-20 bg-[var(--card)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[var(--text)] mb-3 sm:mb-4">
            How it works
          </h2>
          <p className="text-center text-[var(--text-soft)] text-sm sm:text-base mb-10 sm:mb-14 max-w-lg mx-auto">
            Getting delicious homemade food is as easy as 1-2-3
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Search",
                description:
                  "Enter your postcode to find home chefs cooking within 10 miles of you.",
                color: "bg-primary/10 text-primary",
                step: "1",
              },
              {
                icon: UtensilsCrossed,
                title: "Order",
                description:
                  "Browse menus, pick your favourite dishes, and place your order in seconds.",
                color: "bg-accent/10 text-accent",
                step: "2",
              },
              {
                icon: Truck,
                title: "Enjoy",
                description:
                  "Get fresh, homemade food delivered straight to your door. Bon appetit!",
                color: "bg-primary/10 text-primary",
                step: "3",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center p-5 sm:p-8 rounded-2xl border border-[var(--border)] hover:shadow-lg transition"
              >
                <div
                  className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-5`}
                >
                  <item.icon className="w-8 h-8" />
                </div>
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                  {item.title}
                </h3>
                <p className="text-[var(--text-soft)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join as Chef CTA */}
      <section className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary-light rounded-3xl p-6 sm:p-10 md:p-14 text-center text-white">
          <ChefHat className="w-12 sm:w-14 h-12 sm:h-14 mx-auto mb-4 sm:mb-5 opacity-90" />
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Are you a home chef?
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto">
            Turn your passion for cooking into a business. Join Homeal and start
            serving customers in your area today.
          </p>
          <a
            href="/signup?role=chef"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition text-lg"
          >
            Join as a Chef
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 sm:py-10 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2" aria-label="Homeal - Home">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--logo-bg)" }}>
              <img src="/favicon-final-2.png" alt="" className="w-6 h-6 rounded-lg" />
            </div>
            <img src="/logo-full.png" alt="Homeal - Healthy food, from home" className="hidden lg:block h-9 w-auto shrink-0" />
          </a>
          <p className="text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Homeal. Healthy Food, From Home.
          </p>
          <div className="flex items-center gap-6 text-sm text-[var(--text-soft)]">
            <a href="/signup" className="hover:text-primary transition">
              Sign up
            </a>
            <a href="/login" className="hover:text-primary transition">
              Log in
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
