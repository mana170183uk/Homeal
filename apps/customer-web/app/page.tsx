"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChefHat,
  MapPin,
  Truck,
  UtensilsCrossed,
  ArrowRight,
  Star,
  Sparkles,
} from "lucide-react";
import { api } from "./lib/api";
import { saveLocation } from "./lib/location";
import { POPULAR_CUISINES } from "./lib/constants";
import Header from "./components/Header";

export default function HomePage() {
  const router = useRouter();
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, redirect to Discover page
  useEffect(() => {
    const token = localStorage.getItem("homeal_token");
    if (token) {
      router.push("/search");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

      saveLocation({
        postcode: res.data.postcode,
        lat: String(res.data.lat),
        lng: String(res.data.lng),
        area: res.data.area || "",
      });

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
      <Header />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-10 sm:pt-16 pb-14 sm:pb-20 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-[var(--badge-from)] opacity-[0.08] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-[var(--badge-to)] opacity-[0.08] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[var(--accent)] opacity-[0.05] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-[1]">
          <div className="inline-flex items-center gap-2 badge-gradient text-white font-medium text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full mb-6 shadow-lg">
            <Sparkles className="w-4 h-4" />
            Trusted by 500+ home makers across the UK
          </div>
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-[var(--text)] leading-tight mb-4 sm:mb-6">
            Homemade goodness,
            <br />
            <span className="gradient-text">delivered to your door</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[var(--text-soft)] max-w-2xl mx-auto mb-8 sm:mb-10">
            Discover authentic homemade food, cakes, pickles, masalas &amp; more from
            talented local home makers. Fresh, healthy, and made with love.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-xl mx-auto flex items-center gap-2 bg-[var(--card)] rounded-2xl shadow-lg shadow-primary/10 border border-[var(--border)] p-2 hover:shadow-glow transition-shadow duration-300"
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
              className="badge-gradient text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
          {error && <p className="text-alert text-sm mt-3">{error}</p>}
          <p className="text-sm text-[var(--text-muted)] mt-4">
            or{" "}
            <a href="/search" className="gradient-text font-semibold hover:opacity-80 transition">
              browse all products
            </a>
          </p>
        </div>
      </section>

      {/* Popular Cuisines */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--text)] mb-5">
            Popular Categories
          </h2>
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
            {POPULAR_CUISINES.map((cuisine) => (
              <a
                key={cuisine.name}
                href={`/search?cuisine=${encodeURIComponent(cuisine.name)}`}
                className={`inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r ${cuisine.gradient} text-white text-xs sm:text-sm font-medium px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full hover:scale-105 hover:shadow-lg transition-all duration-200`}
              >
                <span>{cuisine.emoji}</span>
                {cuisine.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 py-12 sm:py-20 bg-[var(--card)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[var(--text)] mb-3 sm:mb-4">
            How it works
          </h2>
          <p className="text-center text-[var(--text-soft)] text-sm sm:text-base mb-10 sm:mb-14 max-w-lg mx-auto">
            Getting delicious homemade products is as easy as 1-2-3
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Search",
                description:
                  "Enter your postcode to find home makers within 15 miles of you.",
                gradient: "from-orange-400 to-pink-500",
                step: "1",
              },
              {
                icon: UtensilsCrossed,
                title: "Order",
                description:
                  "Browse products, pick your favourites, and place your order in seconds.",
                gradient: "from-[var(--badge-from)] to-[var(--badge-to)]",
                step: "2",
              },
              {
                icon: Truck,
                title: "Enjoy",
                description:
                  "Get fresh, homemade products delivered straight to your door. Enjoy!",
                gradient: "from-emerald-400 to-teal-500",
                step: "3",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center p-5 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg)] hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="badge-gradient text-white text-xs font-bold uppercase tracking-wider mb-3 inline-flex px-3 py-1 rounded-full">
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
        <div className="max-w-4xl mx-auto badge-gradient rounded-3xl p-6 sm:p-10 md:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
          <div className="relative z-[1]">
            <ChefHat className="w-12 sm:w-14 h-12 sm:h-14 mx-auto mb-4 sm:mb-5 opacity-90" />
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Are you a home maker?
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto">
              Turn your passion into a business. Sell homemade food, cakes, pickles,
              masalas &amp; more to customers in your area.
            </p>
            <a
              href="/signup?role=chef"
              className="inline-flex items-center gap-2 bg-white text-[var(--badge-from)] font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition text-lg shadow-lg"
            >
              Start Selling
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 sm:py-10 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <a href="/" className="flex items-center gap-2" aria-label="Homeal - Home">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--logo-bg)" }}>
                <img src="/favicon-final-2.png" alt="" className="w-6 h-6 rounded-lg" />
              </div>
              <img src="/logo-full.png" alt="Homeal - Homemade products, from home" className="hidden lg:block h-9 w-auto shrink-0" />
            </a>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm">
              <a href="https://admin.homeal.uk" className="text-[var(--text-soft)] font-medium hover:text-accent transition">
                Chef Portal
              </a>
              <a href="https://superadmin.homeal.uk" className="text-[var(--text-soft)] font-medium hover:text-[var(--badge-to)] transition">
                Super Admin
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()} Homeal. Homemade Products, From Home.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Product owned &amp; designed by TotalCloudAI Limited
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
