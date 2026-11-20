import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton, SkeletonGrid } from "@/components/ui";
import { ServiceBrowser } from "@/components/services";

/**
 * BROWSE SERVICES PAGE
 * --------------------
 * Server Component shell + Client Component data section.
 *
 * Next.js 16 note: useSearchParams() must be wrapped in a Suspense boundary on
 * a prerendered route, otherwise `next build` fails with a CSR-bailout error.
 * The fallback below gives visitors a realistic loading screen instead of a
 * blank area while the browser hydrates the filter controls.
 *
 * The page itself is still statically prerendered: the heading, description and
 * skeleton HTML are shared by every visitor. Only the filtered results wait for
 * the browser to read the query string.
 */
export const metadata: Metadata = {
  title: "Browse services",
  description:
    "Search SalonBook services by name, category and price to find your next appointment.",
};

function ServiceBrowserFallback() {
  return (
    <div>
      <div className="rounded-card border border-line bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-18 w-full rounded-input" />
          <Skeleton className="h-18 w-full rounded-input" />
          <Skeleton className="h-18 w-full rounded-input" />
          <Skeleton className="h-11 w-full rounded-full md:mt-auto" />
        </div>
      </div>
      <div className="mt-8">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="mt-6">
        <SkeletonGrid count={6} />
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-ivory py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-gold">
            Our service menu
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Browse services</h1>
          <p className="mt-4 text-sm leading-6 text-muted">
            Search by name, narrow down by category, and sort by price to find
            exactly what you need.
          </p>
        </div>

        <div className="mt-10">
          <Suspense fallback={<ServiceBrowserFallback />}>
            <ServiceBrowser />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
