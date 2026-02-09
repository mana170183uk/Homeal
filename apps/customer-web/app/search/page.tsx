"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MapPin,
  Star,
  Clock,
  Search,
  ChefHat,
  Navigation,
  UtensilsCrossed,
} from "lucide-react";
import { api } from "../lib/api";
import { parseCuisineTypes } from "../lib/utils";
import Header from "../components/Header";

interface Chef {
  id: string;
  kitchenName: string;
  description: string | null;
  cuisineTypes: string | null;
  bannerImage: string | null;
  avgRating: number;
  totalReviews: number;
  deliveryRadius: number;
  distance?: number;
  user: { name: string; avatar: string | null };
  menus: {
    id: string;
    name: string;
    items: { id: string; name: string; price: number; image: string | null }[];
  }[];
}

function getMinPrice(chef: Chef): number | null {
  let min: number | null = null;
  for (const menu of chef.menus) {
    for (const item of menu.items) {
      if (min === null || item.price < min) min = item.price;
    }
  }
  return min;
}

function getTotalDishes(chef: Chef): number {
  return chef.menus.reduce((sum, m) => sum + m.items.length, 0);
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const postcode = searchParams.get("postcode") || "";
  const area = searchParams.get("area") || "";

  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPostcode, setNewPostcode] = useState("");
  const [searching, setSearching] = useState(false);

  const fetchChefs = useCallback(async (latitude: string, longitude: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await api<Chef[]>(
        `/chefs?lat=${latitude}&lng=${longitude}&radius=15`
      );
      if (res.success && res.data) {
        setChefs(res.data);
      } else {
        setError("Failed to load chefs.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (lat && lng) {
      fetchChefs(lat, lng);
    } else {
      setLoading(false);
      setError("Please enter a postcode to find chefs near you.");
    }
  }, [lat, lng, fetchChefs]);

  async function handleNewSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!newPostcode.trim()) return;
    setSearching(true);
    try {
      const res = await api<{
        lat: number;
        lng: number;
        area: string;
        postcode: string;
      }>(`/chefs/geocode?postcode=${encodeURIComponent(newPostcode.trim())}`);
      if (res.success && res.data) {
        router.push(
          `/search?lat=${res.data.lat}&lng=${res.data.lng}&postcode=${encodeURIComponent(res.data.postcode)}&area=${encodeURIComponent(res.data.area || "")}`
        );
      } else {
        setError("Invalid postcode. Please try again.");
      }
    } catch {
      setError("Geocoding failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Location & Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[var(--text-soft)] mb-1">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Showing results near</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-[var(--text)]">
              {postcode}
              {area && (
                <span className="text-[var(--text-soft)] font-normal text-lg">
                  {" "}
                  &middot; {area}
                </span>
              )}
            </h1>
          </div>
          <form
            onSubmit={handleNewSearch}
            className="flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-1.5"
          >
            <div className="flex items-center gap-2 px-2">
              <MapPin className="w-4 h-4 text-primary" />
              <input
                type="text"
                value={newPostcode}
                onChange={(e) => setNewPostcode(e.target.value)}
                placeholder="New postcode..."
                className="py-2 text-sm bg-transparent outline-none w-36"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="badge-gradient text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
            >
              {searching ? "..." : <Search className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-[var(--text-soft)]">
              Finding chefs near you...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-alert mb-4">{error}</p>
            <a
              href="/"
              className="text-primary font-medium hover:underline"
            >
              Go back and try again
            </a>
          </div>
        ) : chefs.length === 0 ? (
          <div className="text-center py-20">
            <ChefHat className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
              No chefs found nearby
            </h2>
            <p className="text-[var(--text-soft)] mb-6 max-w-sm mx-auto">
              We couldn&apos;t find any chefs within 15 miles of your location.
              Try a different postcode or check back later.
            </p>
            <a
              href="/"
              className="text-primary font-medium hover:underline"
            >
              Try a different postcode
            </a>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              {chefs.length} chef{chefs.length !== 1 ? "s" : ""} found within 15
              miles
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {chefs.map((chef) => {
                const minPrice = getMinPrice(chef);
                const totalDishes = getTotalDishes(chef);
                return (
                  <a
                    key={chef.id}
                    href={`/chef/${chef.id}`}
                    className="group bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                  >
                    {/* Banner */}
                    <div className="h-40 relative overflow-hidden">
                      {chef.bannerImage ? (
                        <img
                          src={chef.bannerImage}
                          alt={chef.kitchenName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full badge-gradient opacity-80" />
                      )}
                      {/* Distance badge */}
                      {chef.distance != null && (
                        <div className="absolute top-3 right-3 glass bg-white/80 dark:bg-[var(--card)]/80 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <MapPin className="w-3 h-3 text-primary" />
                          {chef.distance} mi
                        </div>
                      )}
                      {/* Price badge */}
                      {minPrice != null && (
                        <div className="absolute bottom-3 left-3 badge-gradient text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                          from &pound;{minPrice.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg text-[var(--text)] leading-tight">
                          {chef.kitchenName}
                        </h3>
                        {chef.avgRating > 0 && (
                          <div className="flex items-center gap-1 shrink-0 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-semibold">
                              {chef.avgRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-[var(--text-soft)] mb-3">
                        by {chef.user.name}
                      </p>

                      {chef.cuisineTypes && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {parseCuisineTypes(chef.cuisineTypes)
                            .slice(0, 3)
                            .map((cuisine) => (
                              <span
                                key={cuisine}
                                className="text-xs badge-gradient text-white px-2.5 py-1 rounded-full font-medium"
                              >
                                {cuisine}
                              </span>
                            ))}
                        </div>
                      )}

                      {totalDishes > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                          {totalDishes} dishes available
                        </div>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
