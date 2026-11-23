"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState, ErrorState, SkeletonGrid, buttonStyles } from "@/components/ui";
import { ServiceCard } from "@/components/services";
import { servicesApi } from "@/lib/api";
import { ROUTES, preferFeaturedServices } from "@/lib/constants";
import type { Service } from "@/types";

/**
 * FEATURED SERVICES
 * -----------------
 * Reads the public /api/services endpoint and orders the catalogue so the
 * signature services from the Figma design appear first. Loading, failure and
 * retry states remain explicit so a slow API never leaves a blank grid.
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
        setServices(preferFeaturedServices(data).slice(0, FEATURED_LIMIT));
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
              Featured
            </p>
            <h2
              id="featured-services-heading"
              className="mt-3 text-3xl sm:text-4xl"
            >
              Our Signature Services
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
