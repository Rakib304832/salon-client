import { cn } from "@/lib/utils";

/**
 * Skeleton blocks are shown while lists load. They use the Blush Light token so
 * they read as "content is coming" rather than as an error or empty result.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-blush-light", className)}
    />
  );
}

/** One service-card-shaped loading placeholder. */
export function SkeletonCard() {
  return (
    <div className="rounded-card border border-line bg-white p-4">
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="mt-5 h-4 w-2/3" />
      <Skeleton className="mt-3 h-3 w-1/3" />
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
      <Skeleton className="mt-5 h-10 w-full rounded-full" />
    </div>
  );
}

/**
 * Responsive grid of card skeletons: 1 column on mobile, 2 on tablet, 3 on
 * desktop — the same breakpoints the real service grids use.
 */
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading services"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <span className="sr-only">Loading services…</span>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

/** Generic table/list skeleton for dashboard pages. */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading records"
      className="overflow-hidden rounded-card border border-line bg-white"
    >
      <span className="sr-only">Loading records…</span>
      <div className="bg-blush-light px-5 py-4">
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="ml-auto h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
