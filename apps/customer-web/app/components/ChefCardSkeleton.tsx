export default function ChefCardSkeleton() {
  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
      {/* Banner */}
      <div className="h-40 bg-[var(--input)] animate-pulse" />

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Title + rating */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-3/4 bg-[var(--input)] rounded animate-pulse" />
          <div className="h-5 w-12 bg-[var(--input)] rounded-full animate-pulse" />
        </div>

        {/* Chef name */}
        <div className="h-4 w-1/3 bg-[var(--input)] rounded animate-pulse" />

        {/* Cuisine tags */}
        <div className="flex gap-1.5">
          <div className="h-5 w-14 bg-[var(--input)] rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-[var(--input)] rounded-full animate-pulse" />
          <div className="h-5 w-12 bg-[var(--input)] rounded-full animate-pulse" />
        </div>

        {/* Dishes line */}
        <div className="h-3 w-1/2 bg-[var(--input)] rounded animate-pulse" />
      </div>
    </div>
  );
}
