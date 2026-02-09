"use client";

import { Leaf } from "lucide-react";
import { POPULAR_CUISINES } from "../lib/constants";

interface CuisineFiltersProps {
  selectedCuisines: string[];
  vegetarianOnly: boolean;
  onToggleCuisine: (cuisine: string) => void;
  onToggleVegetarian: () => void;
}

export default function CuisineFilters({
  selectedCuisines,
  vegetarianOnly,
  onToggleCuisine,
  onToggleVegetarian,
}: CuisineFiltersProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:overflow-x-visible">
        {/* Vegetarian chip */}
        <button
          onClick={onToggleVegetarian}
          className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-2 rounded-full transition-all duration-200 whitespace-nowrap shrink-0 ${
            vegetarianOnly
              ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md"
              : "bg-[var(--input)] text-[var(--text-soft)] border border-[var(--border)] hover:border-accent/40"
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          Vegetarian
        </button>

        {/* Cuisine chips */}
        {POPULAR_CUISINES.map((cuisine) => {
          const active = selectedCuisines.includes(cuisine.name);
          return (
            <button
              key={cuisine.name}
              onClick={() => onToggleCuisine(cuisine.name)}
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-2 rounded-full transition-all duration-200 whitespace-nowrap shrink-0 ${
                active
                  ? `bg-gradient-to-r ${cuisine.gradient} text-white shadow-md`
                  : "bg-[var(--input)] text-[var(--text-soft)] border border-[var(--border)] hover:border-primary/30"
              }`}
            >
              <span>{cuisine.emoji}</span>
              {cuisine.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
