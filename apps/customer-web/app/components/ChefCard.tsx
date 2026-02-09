import { MapPin, Star, UtensilsCrossed } from "lucide-react";
import { Chef } from "../lib/types";
import { parseCuisineTypes } from "../lib/utils";

function getMinPrice(chef: Chef): number | null {
  const prices = chef.menus.flatMap((m) => m.items.map((i) => i.price));
  return prices.length > 0 ? Math.min(...prices) : null;
}

function getTotalDishes(chef: Chef): number {
  return chef.menus.reduce((sum, m) => sum + m.items.length, 0);
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
          <div className="w-full h-full badge-gradient opacity-80" />
        )}

        {/* Distance badge */}
        {showDistance && chef.distance != null && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-black/60 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-[var(--text)]">{chef.distance} mi</span>
          </div>
        )}

        {/* Price badge */}
        {minPrice != null && (
          <div className="absolute bottom-3 left-3 badge-gradient text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            from &pound;{minPrice.toFixed(2)}
          </div>
        )}
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

        {/* Popular dishes preview */}
        {popularDishes.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-[var(--text-muted)]">
            <UtensilsCrossed className="w-3 h-3 shrink-0" />
            <span className="line-clamp-1">{popularDishes.join(", ")}</span>
          </div>
        )}

        {/* Dish count */}
        <p className="text-xs text-[var(--text-muted)]">
          {totalDishes} {totalDishes === 1 ? "dish" : "dishes"} available
        </p>
      </div>
    </a>
  );
}
