export const POPULAR_CUISINES = [
  { name: "Indian", emoji: "\uD83C\uDDEE\uD83C\uDDF3", gradient: "from-orange-400 to-red-500" },
  { name: "Chinese", emoji: "\uD83C\uDDE8\uD83C\uDDF3", gradient: "from-red-400 to-pink-500" },
  { name: "Thai", emoji: "\uD83C\uDDF9\uD83C\uDDED", gradient: "from-green-400 to-emerald-500" },
  { name: "Italian", emoji: "\uD83C\uDDEE\uD83C\uDDF9", gradient: "from-green-500 to-teal-500" },
  { name: "Caribbean", emoji: "\uD83C\uDF34", gradient: "from-yellow-400 to-orange-500" },
  { name: "Middle Eastern", emoji: "\uD83E\uDDC6", gradient: "from-amber-400 to-orange-500" },
  { name: "South Indian", emoji: "\uD83C\uDF5B", gradient: "from-yellow-500 to-red-400" },
  { name: "Japanese", emoji: "\uD83C\uDDEF\uD83C\uDDF5", gradient: "from-rose-400 to-red-500" },
];

export const RADIUS_OPTIONS = [5, 10, 15, 20, 30] as const;

export const SORT_OPTIONS = [
  { value: "nearest" as const, label: "Nearest", requiresLocation: true },
  { value: "recommended" as const, label: "Recommended", requiresLocation: false },
  { value: "price_low" as const, label: "Price: Low→High", requiresLocation: false },
  { value: "rating_high" as const, label: "Top Rated", requiresLocation: false },
];

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
