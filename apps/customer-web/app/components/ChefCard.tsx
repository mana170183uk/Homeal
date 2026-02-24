import { MapPin, Star, UtensilsCrossed, Tag, Award } from "lucide-react";
import { Chef } from "../lib/types";
import { parseCuisineTypes } from "../lib/utils";

const CARD_COLORS = [
  "from-orange-400 to-rose-500",      // warm coral
  "from-violet-500 to-purple-600",     // rich purple
  "from-emerald-400 to-teal-500",      // fresh teal
  "from-blue-400 to-indigo-500",       // ocean blue
  "from-pink-400 to-fuchsia-500",      // vibrant pink
  "from-amber-400 to-orange-500",      // golden amber
  "from-cyan-400 to-blue-500",         // sky cyan
  "from-rose-400 to-red-500",          // ruby rose
];

function getCardColor(id: string): string {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CARD_COLORS[hash % CARD_COLORS.length];
}

function getMinPrice(chef: Chef): number | null {
  const allItems = chef.menus.flatMap((m) => m.items);
  const prices = allItems.map((i) => {
    if (i.offerPrice != null && i.offerPrice < i.price) return i.offerPrice;
    return i.price;
  });
  return prices.length > 0 ? Math.min(...prices) : null;
}

function getTotalDishes(chef: Chef): number {
  return chef.menus.reduce((sum, m) => sum + m.items.length, 0);
}

function hasOffers(chef: Chef): boolean {
  return chef.menus.some((m) =>
    m.items.some((i) => i.offerPrice != null && i.offerPrice < i.price)
  );
}

function isKitchenOpenNow(chef: Chef): boolean {
  if (chef.isOnline === false) return false;
  // Check today's operating hours
  if (chef.operatingHours) {
    try {
      const hours = typeof chef.operatingHours === "string"
        ? JSON.parse(chef.operatingHours)
        : chef.operatingHours;
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" }); // "Monday", "Tuesday", etc.
      const todayHours = hours[today];
      if (todayHours && todayHours.enabled === false) return false;
    } catch { /* ignore parse errors */ }
  }
  return true;
}

interface ChefCardProps {
  chef: Chef;
  showDistance?: boolean;
}

export default function ChefCard({ chef, showDistance }: ChefCardProps) {
  const minPrice = getMinPrice(chef);
  const totalDishes = getTotalDishes(chef);
  const cuisines = chef.cuisineTypes
    ? parseCuisineTypes(chef.cuisineTypes).slice(0, 3)
    : [];
  const popularDishes = chef.menus
    .flatMap((m) => m.items)
    .slice(0, 2)
    .map((i) => i.name);
  const isOnline = isKitchenOpenNow(chef);
  const chefHasOffers = hasOffers(chef);

  return (
    <a
      href={`/chef/${chef.id}`}
      className="group bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 block"
    >
      {/* Banner */}
      <div className="relative h-40 overflow-hidden">
        {chef.bannerImage ? (
          <img
            src={chef.bannerImage}
            alt={chef.kitchenName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getCardColor(chef.id)} flex items-center justify-center`}>
            <span className="text-white/30 text-7xl font-bold select-none">
              {chef.kitchenName?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        )}

        {/* Open/Closed badge - top right */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {isOnline ? (
            <span className="flex items-center gap-1 bg-white/90 dark:bg-black/60 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400">Open</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-white/90 dark:bg-black/60 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              <span className="text-red-500 dark:text-red-400">Closed</span>
            </span>
          )}

          {/* Distance badge */}
          {showDistance && chef.distance != null && (
            <span className="flex items-center gap-1 bg-white dark:bg-gray-900 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-gray-800 dark:text-gray-100">{chef.distance} mi</span>
            </span>
          )}
        </div>

        {/* Bottom badges row */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
          {/* Price badge */}
          {minPrice != null && (
            <span className="badge-gradient text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              from &pound;{minPrice.toFixed(2)}
            </span>
          )}

          {/* Offers badge */}
          {chefHasOffers && (
            <span className="flex items-center gap-1 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              <Tag className="w-3 h-3" />
              Offers
            </span>
          )}

          {/* Chef badges (e.g. Menu Innovator) */}
          {chef.badges && chef.badges.length > 0 && chef.badges.map((b) => (
            <span
              key={b.type}
              className="flex items-center gap-1 bg-purple-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
            >
              <Award className="w-3 h-3" />
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Kitchen name + rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-lg text-[var(--text)] leading-tight line-clamp-1">
            {chef.kitchenName}
          </h3>
          {chef.avgRating > 0 && (
            <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
              <Star className="w-3 h-3 fill-current" />
              {chef.avgRating.toFixed(1)}
              {chef.totalReviews > 0 && (
                <span className="text-[var(--text-muted)] font-normal">
                  ({chef.totalReviews})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chef name */}
        <p className="text-sm text-[var(--text-soft)] mb-3">
          by {chef.user.name}
        </p>

        {/* Cuisine tags */}
        {cuisines.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cuisines.map((c) => (
              <span
                key={c}
                className="badge-gradient text-white text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Popular items preview */}
        {popularDishes.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-[var(--text-muted)]">
            <UtensilsCrossed className="w-3 h-3 shrink-0" />
            <span className="line-clamp-1">{popularDishes.join(", ")}</span>
          </div>
        )}

        {/* Item count */}
        <p className="text-xs text-[var(--text-muted)]">
          {totalDishes} {totalDishes === 1 ? "item" : "items"} available
        </p>
      </div>
    </a>
  );
}
