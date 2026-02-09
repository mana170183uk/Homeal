"use client";

import { useState } from "react";
import { MapPin, Search, Navigation, X } from "lucide-react";
import { RADIUS_OPTIONS, SORT_OPTIONS, SortOption } from "../lib/constants";

interface SearchControlsProps {
  postcode: string;
  area: string;
  radius: number;
  sortBy: SortOption;
  hasLocation: boolean;
  onSearch: (postcode: string) => Promise<void>;
  onRadiusChange: (radius: number) => void;
  onSortChange: (sort: SortOption) => void;
  onClearLocation: () => void;
  searching: boolean;
}

export default function SearchControls({
  postcode,
  area,
  radius,
  sortBy,
  hasLocation,
  onSearch,
  onRadiusChange,
  onSortChange,
  onClearLocation,
  searching,
}: SearchControlsProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setError("");
    try {
      await onSearch(trimmed);
      setInput("");
    } catch {
      setError("Invalid postcode. Please try a valid UK postcode.");
    }
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Location display + postcode input */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Current location */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Navigation className="w-4 h-4 text-primary shrink-0" />
          {hasLocation ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-[var(--text-soft)] truncate">
                Near <span className="font-semibold text-[var(--text)]">{postcode}</span>
                {area && <span className="text-[var(--text-muted)]"> &middot; {area}</span>}
              </span>
              <button
                onClick={onClearLocation}
                className="text-[var(--text-muted)] hover:text-alert transition shrink-0"
                title="Clear location"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-sm text-[var(--text-muted)]">
              Showing all chefs &middot; enter a postcode to find nearby
            </span>
          )}
        </div>

        {/* Postcode input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder="Enter postcode"
              className="pl-9 pr-3 py-2 w-40 sm:w-44 text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl outline-none focus:border-primary transition text-[var(--text)] placeholder:text-[var(--text-muted)]"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !input.trim()}
            className="badge-gradient text-white text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1.5 transition hover:opacity-90 disabled:opacity-50"
          >
            {searching ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>

      {error && (
        <p className="text-alert text-xs">{error}</p>
      )}

      {/* Radius + Sort controls */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
        {/* Radius dropdown */}
        {hasLocation && (
          <select
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="text-xs font-medium bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-full px-3 py-1.5 outline-none focus:border-primary transition cursor-pointer shrink-0"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r} miles
              </option>
            ))}
          </select>
        )}

        {/* Sort pills */}
        {SORT_OPTIONS.filter((opt) => !opt.requiresLocation || hasLocation).map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap shrink-0 ${
              sortBy === opt.value
                ? "badge-gradient text-white shadow-sm"
                : "bg-[var(--input)] text-[var(--text-soft)] border border-[var(--border)] hover:border-[var(--text-muted)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
