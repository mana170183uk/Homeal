"use client";

import { Star, MapPin } from "lucide-react";
import { Chef } from "../lib/types";

interface FeaturedChefsProps {
  chefs: Chef[];
  hasLocation: boolean;
}

export default function FeaturedChefs({ chefs, hasLocation }: FeaturedChefsProps) {
  const featured = [...chefs]
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] mb-4">
        {hasLocation ? (
          <>Featured <span className="gradient-text">near you</span></>
        ) : (
          <>Popular <span className="gradient-text">chefs</span></>
        )}
      </h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {featured.map((chef) => (
          <a
            key={chef.id}
            href={`/chef/${chef.id}`}
            className="min-w-[260px] max-w-[280px] bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex-shrink-0"
          >
            <div className="relative h-28 overflow-hidden">
              {chef.bannerImage ? (
                <img src={chef.bannerImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full badge-gradient opacity-80" />
              )}
              {chef.avgRating > 0 && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {chef.avgRating.toFixed(1)}
                </div>
              )}
              {hasLocation && chef.distance != null && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-0.5 rounded-full">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="text-[#2D2D3F]">{chef.distance.toFixed(1)} mi</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm text-[var(--text)] line-clamp-1">{chef.kitchenName}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">by {chef.user.name}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
