import { Skeleton } from "@/components/ui";

/**
 * Suspense fallback for auth forms.
 *
 * The forms call useSearchParams() so they suspend during static prerendering.
 * Showing a form-shaped skeleton prevents layout shift when the real form
 * hydrates and keeps the split-screen auth shell visually stable.
 */
export function AuthFormSkeleton() {
  return (
    <div aria-label="Loading form" className="space-y-6" role="status">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>

      <Skeleton className="h-11 w-full rounded-full" />

      <div className="flex items-center gap-3">
        <Skeleton className="h-px flex-1" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-px flex-1" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>

      <span className="sr-only">Loading sign-in form…</span>
    </div>
  );
}
