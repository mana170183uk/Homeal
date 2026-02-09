"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChefHat, ShieldCheck, Heart, Truck, Star } from "lucide-react";
import Header from "../components/Header";
import ChefCard from "../components/ChefCard";
import ChefCardSkeleton from "../components/ChefCardSkeleton";
import SearchControls from "../components/SearchControls";
import CuisineFilters from "../components/CuisineFilters";
import { api } from "../lib/api";
import { parseCuisineTypes } from "../lib/utils";
import { Chef } from "../lib/types";
import { SortOption } from "../lib/constants";
import {
  getSavedLocation,
  saveLocation,
  getSavedRadius,
  saveRadius,
  clearSavedLocation,
} from "../lib/location";

function getMinPrice(chef: Chef): number | null {
  const prices = chef.menus.flatMap((m) => m.items.map((i) => i.price));
  return prices.length > 0 ? Math.min(...prices) : null;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params
  const urlLat = searchParams.get("lat");
  const urlLng = searchParams.get("lng");
  const urlPostcode = searchParams.get("postcode") || "";
  const urlArea = searchParams.get("area") || "";
  const urlRadius = searchParams.get("radius");
  const urlCuisine = searchParams.get("cuisine");

  // Location state
  const [lat, setLat] = useState<string | null>(null);
  const [lng, setLng] = useState<string | null>(null);
  const [postcode, setPostcode] = useState("");
  const [area, setArea] = useState("");

  // Data state
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  // Filter/sort state
  const [radius, setRadiusState] = useState(15);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [vegetarianOnly, setVegetarianOnly] = useState(false);

  const hasLocation = !!(lat && lng);

  // Initialize from URL or localStorage
  useEffect(() => {
    if (urlLat && urlLng) {
      setLat(urlLat);
      setLng(urlLng);
      setPostcode(urlPostcode);
      setArea(urlArea);
      const r = urlRadius ? Number(urlRadius) : getSavedRadius();
      setRadiusState(r);
      saveLocation({ postcode: urlPostcode, lat: urlLat, lng: urlLng, area: urlArea, radius: r });
      setSortBy("nearest");
    } else {
      const saved = getSavedLocation();
      if (saved) {
        setLat(saved.lat);
        setLng(saved.lng);
        setPostcode(saved.postcode);
        setArea(saved.area);
        setRadiusState(saved.radius);
        setSortBy("nearest");
      }
    }
    if (urlCuisine) {
      setSelectedCuisines([urlCuisine]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch chefs
  const fetchChefs = useCallback(async (
    fetchLat: string | null,
    fetchLng: string | null,
    fetchRadius: number
  ) => {
    setLoading(true);
    setError("");
    try {
      let path = "/chefs";
      if (fetchLat && fetchLng) {
        path += `?lat=${fetchLat}&lng=${fetchLng}&radius=${fetchRadius}`;
      }
      const res = await api<Chef[]>(path);
      if (res.success && res.data) {
        setChefs(res.data);
      } else {
        setError("Failed to load chefs. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChefs(lat, lng, radius);
  }, [lat, lng, radius, fetchChefs]);

  // Postcode search
  async function handleSearch(newPostcode: string) {
    setSearching(true);
    setError("");
    try {
      const res = await api<{ lat: number; lng: number; area: string; postcode: string }>(
        `/chefs/geocode?postcode=${encodeURIComponent(newPostcode.trim())}`
      );
      if (!res.success || !res.data) throw new Error("Invalid postcode");

      const newLat = String(res.data.lat);
      const newLng = String(res.data.lng);
      const newArea = res.data.area || "";
      const pc = res.data.postcode;

      saveLocation({ postcode: pc, lat: newLat, lng: newLng, area: newArea, radius });
      setLat(newLat);
      setLng(newLng);
      setPostcode(pc);
      setArea(newArea);
      setSortBy("nearest");
      router.replace(
        `/search?lat=${newLat}&lng=${newLng}&postcode=${encodeURIComponent(pc)}&area=${encodeURIComponent(newArea)}&radius=${radius}`,
        { scroll: false }
      );
    } finally {
      setSearching(false);
    }
  }

  // Radius change
  function handleRadiusChange(newRadius: number) {
    setRadiusState(newRadius);
    saveRadius(newRadius);
    if (lat && lng) {
      router.replace(
        `/search?lat=${lat}&lng=${lng}&postcode=${encodeURIComponent(postcode)}&area=${encodeURIComponent(area)}&radius=${newRadius}`,
        { scroll: false }
      );
    }
  }

  // Clear location
  function handleClearLocation() {
    clearSavedLocation();
    setLat(null);
    setLng(null);
    setPostcode("");
    setArea("");
    setSortBy("recommended");
    router.replace("/search", { scroll: false });
  }

  // Client-side filter + sort
  const filteredChefs = useMemo(() => {
    let result = [...chefs];

    if (selectedCuisines.length > 0) {
      result = result.filter((chef) => {
        if (!chef.cuisineTypes) return false;
        const types = parseCuisineTypes(chef.cuisineTypes).map((t) => t.toLowerCase());
        return selectedCuisines.some((c) => types.includes(c.toLowerCase()));
      });
    }

    if (vegetarianOnly) {
      result = result.filter((chef) =>
        chef.menus.some((m) => m.items.some((item) => item.isVeg))
      );
    }

    switch (sortBy) {
      case "nearest":
        result.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        break;
      case "price_low":
        result.sort((a, b) => (getMinPrice(a) ?? Infinity) - (getMinPrice(b) ?? Infinity));
        break;
      case "rating_high":
        result.sort((a, b) => b.avgRating - a.avgRating);
        break;
      default:
        break;
    }

    return result;
  }, [chefs, selectedCuisines, vegetarianOnly, sortBy]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header showBack />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page title */}
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)] mb-6">
          {hasLocation ? (
            <>Chefs near <span className="gradient-text">{postcode}</span></>
          ) : (
            <>Discover <span className="gradient-text">home chefs</span></>
          )}
        </h1>

        {/* Controls */}
        <SearchControls
          postcode={postcode}
          area={area}
          radius={radius}
          sortBy={sortBy}
          hasLocation={hasLocation}
          onSearch={handleSearch}
          onRadiusChange={handleRadiusChange}
          onSortChange={setSortBy}
          onClearLocation={handleClearLocation}
          searching={searching}
        />

        {/* Cuisine filters */}
        <CuisineFilters
          selectedCuisines={selectedCuisines}
          vegetarianOnly={vegetarianOnly}
          onToggleCuisine={(c) =>
            setSelectedCuisines((prev) =>
              prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
            )
          }
          onToggleVegetarian={() => setVegetarianOnly((v) => !v)}
        />

        {/* Why Homeal strip */}
        {!hasLocation && !loading && chefs.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 mb-8">
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              {[
                { icon: ShieldCheck, text: "Verified Home Chefs" },
                { icon: Heart, text: "Made with Love" },
                { icon: Truck, text: "Delivered Fresh" },
                { icon: Star, text: "Rated & Reviewed" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-soft)] font-medium">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-[var(--text-muted)] mb-4">
            {filteredChefs.length} {filteredChefs.length === 1 ? "chef" : "chefs"} found
            {hasLocation && ` within ${radius} miles`}
            {selectedCuisines.length > 0 && ` \u00B7 ${selectedCuisines.join(", ")}`}
            {vegetarianOnly && " \u00B7 Vegetarian"}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChefCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-2">Oops!</h2>
            <p className="text-[var(--text-soft)] mb-6 max-w-sm mx-auto">{error}</p>
            <a href="/" className="gradient-text font-semibold hover:opacity-80 transition">
              Go back and try again
            </a>
          </div>
        ) : filteredChefs.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
              {chefs.length === 0 ? "No chefs found nearby" : "No chefs match your filters"}
            </h2>
            <p className="text-[var(--text-soft)] mb-6 max-w-sm mx-auto">
              {chefs.length === 0
                ? `We couldn\u2019t find any chefs within ${radius} miles. Try a different postcode or increase your search radius.`
                : "Try removing some filters or expanding your search."}
            </p>
            {chefs.length === 0 && hasLocation && (
              <button onClick={handleClearLocation} className="gradient-text font-semibold hover:opacity-80 transition">
                Browse all chefs instead
              </button>
            )}
            {chefs.length > 0 && (selectedCuisines.length > 0 || vegetarianOnly) && (
              <button
                onClick={() => { setSelectedCuisines([]); setVegetarianOnly(false); }}
                className="gradient-text font-semibold hover:opacity-80 transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChefs.map((chef) => (
              <ChefCard key={chef.id} chef={chef} showDistance={hasLocation} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full overflow-x-hidden">
          <Header showBack />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="h-8 w-48 bg-[var(--input)] rounded animate-pulse mb-6" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ChefCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
