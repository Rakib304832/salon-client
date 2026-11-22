"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Crown,
  Droplet,
  Flower2,
  Hand,
  Palette,
  Scissors,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { ErrorState, Skeleton } from "@/components/ui";
import { servicesApi } from "@/lib/api";
import { API_CATEGORIES, HOME_CATEGORIES, ROUTES } from "@/lib/constants";
import type { Service } from "@/types";

/**
 * HOME CATEGORY TILES
 * -------------------
 * The brief wants salon service categories on the Home page, and the dynamic
 * section should come from real data. This component reads the public
 * active-only service list, derives the categories actually in the catalogue,
 * and keeps the seven curated categories as a stable fallback/ordering. Extra
 * server categories such as Waxing or Bridal are appended automatically.
 *
 * Every tile links to /services?category=... . Loading, failure and retry are
 * explicit so a slow/offline API never leaves an empty grid.
 */
const CATEGORY_ICONS: Partial<Record<string, LucideIcon>> = {
  "Haircut & Styling": Scissors,
  "Hair Coloring": Palette,
  "Hair Treatment": Droplet,
  "Facial & Skincare": Sparkles,
  Makeup: Crown,
  "Manicure & Pedicure": Hand,
  "Spa & Massage": Flower2,
  Waxing: Sparkles,
  Bridal: Crown,
};

const KNOWN_CATEGORIES: readonly string[] = API_CATEGORIES;

interface CategoryTile {
  name: string;
  count: number;
}

function buildCategoryTiles(services: Service[]): CategoryTile[] {
  const counts = new Map<string, number>();

  for (const service of services) {
    const name = service.category?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const activeCategories = [...counts.keys()];
  const ordered = [
    ...KNOWN_CATEGORIES.filter((category) => counts.has(category)),
    ...HOME_CATEGORIES.filter((category) => !counts.has(category)),
    ...activeCategories
      .filter((category) => !KNOWN_CATEGORIES.includes(category))
      .sort((a, b) => a.localeCompare(b)),
  ];

  return ordered.map((name) => ({ name, count: counts.get(name) ?? 0 }));
}

export function CategoryTiles() {
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
        setServices(data);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "We could not load salon categories.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadCount]);

  const categories = useMemo(() => buildCategoryTiles(services), [services]);

  function handleRetry() {
    setError(null);
    setLoading(true);
    setReloadCount((count) => count + 1);
  }

  return (
    <section
      aria-labelledby="home-categories-heading"
      className="bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-gold">
            What are you looking for?
          </p>
          <h2 id="home-categories-heading" className="mt-3 text-3xl sm:text-4xl">
            Explore by category
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            From a quick trim to a full spa day, find the service that fits your
            plan.
          </p>
        </div>

        <div className="mt-10">
          {loading ? (
            <div
              role="status"
              aria-label="Loading service categories"
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            >
              <span className="sr-only">Loading categories…</span>
              {HOME_CATEGORIES.map((category) => (
                <Skeleton
                  key={category}
                  className="min-h-36 w-full rounded-card"
                />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Categories are unavailable"
              message={error}
              onRetry={handleRetry}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map(({ name, count }) => {
                const Icon = CATEGORY_ICONS[name] ?? Sparkles;
                const href = `${ROUTES.services}?category=${encodeURIComponent(name)}`;

                return (
                  <Link
                    key={name}
                    href={href}
                    className="group flex min-h-36 flex-col justify-between rounded-card border border-line bg-ivory p-5 transition duration-200 hover:-translate-y-1 hover:border-rose-gold hover:bg-blush-light focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-plum shadow-sm transition-colors group-hover:bg-plum group-hover:text-white">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>

                    <span className="mt-4 flex items-end justify-between gap-2">
                      <span className="text-sm font-bold leading-snug text-plum">
                        {name}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-rose-gold">
                        {count > 0 ? (
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-plum">
                            {count}
                          </span>
                        ) : null}
                        <span className="opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
