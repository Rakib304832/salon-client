"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState, ErrorState, SkeletonGrid, buttonStyles } from "@/components/ui";
import { ServiceCard } from "@/components/services";
import { servicesApi } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import type { Service } from "@/types";

/**
 * FEATURED SERVICES
 * -----------------
 * The only data-driven section on Home. It calls the public /api/services
 * endpoint, which already returns active-only services, and shows the first
 * six as the brief's featured-service section.
 *
 * Loading states are explicit:
 * - skeleton grid while the request is in flight
 * - inline ErrorState with Retry on failure (never a silent empty grid)
 * - EmptyState with a clear next action if the salon has no services yet
 *
 * Why this is a Client Component:
 * - The API origin is a public NEXT_PUBLIC_* value and this is a purely
 *   presentational read, so no server route is needed.
 * - Retry needs local state and a click handler.
 *
 * The effect only writes state inside promise callbacks. Initial `loading` is
 * true from useState, and Retry sets it from an event handler, so there is no
 * synchronous setState in the effect body.
 */
const FEATURED_LIMIT = 6;

export function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let active = true;

    servicesApi
      .list()
      .then((data) => {
        if (!active) return;
        setServices(data.slice(0, FEATURED_LIMIT));
        setError(null);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "We could not load featured services.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadCount]);

  function handleRetry() {
    setError(null);
    setLoading(true);
    setReloadCount((count) => count + 1);
  }

  return (
    <section
      aria-labelledby="featured-services-heading"
      className="bg-ivory py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-gold">
              Popular right now
            </p>
            <h2
              id="featured-services-heading"
              className="mt-3 text-3xl sm:text-4xl"
            >
              Featured services
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              A small taste of what is available. Browse the full menu to find
              your perfect appointment.
            </p>
          </div>

          <Link
            href={ROUTES.services}
            className={buttonStyles({ variant: "outline" })}
          >
            View all services
          </Link>
        </div>

        <div className="mt-10">
          {loading ? (
            <SkeletonGrid count={FEATURED_LIMIT} />
          ) : error ? (
            <ErrorState
              title="Featured services are unavailable"
              message={error}
              onRetry={handleRetry}
            />
          ) : services.length === 0 ? (
            <EmptyState
              title="No services yet"
              description="The salon has not published any services. Please check back soon."
              action={
                <button
                  type="button"
                  onClick={handleRetry}
                  className={buttonStyles({ variant: "outline" })}
                >
                  Refresh
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
