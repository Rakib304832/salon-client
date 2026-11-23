"use client";

import { useEffect, useMemo, useState } from "react";
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
import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { servicesApi } from "@/lib/api";
import {
  HOME_CATEGORIES,
  HOME_CATEGORY_GROUPS,
  ROUTES,
  type HomeCategory,
} from "@/lib/constants";
import type { Service } from "@/types";
import { CategoryCard } from "./CategoryCard";

/**
 * HOME CATEGORY TILES
 * -------------------
 * The Figma design shows seven numbered tiles. Live services are grouped into
 * those design categories using API category plus service-name keywords; the
 * link still queries the real short category value accepted by the server.
 */
const CATEGORY_ICONS: Record<HomeCategory, LucideIcon> = {
  "Haircut & Styling": Scissors,
  "Hair Coloring": Palette,
  "Hair Treatment": Droplet,
  "Facial & Skincare": Sparkles,
  Makeup: Crown,
  "Manicure & Pedicure": Hand,
  "Spa & Massage": Flower2,
};

interface CategoryTile {
  label: HomeCategory;
  href: string;
}

function buildCategoryTiles(): CategoryTile[] {
  return HOME_CATEGORY_GROUPS.map((group) => ({
    label: group.label,
    href: `${ROUTES.services}?category=${encodeURIComponent(group.label)}`,
  }));
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

  const tiles = useMemo(() => buildCategoryTiles(), []);

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
            Categories
          </p>
          <h2 id="home-categories-heading" className="mt-3 text-3xl sm:text-4xl">
            Explore by Category
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Find the treatment you need and jump straight to it.
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
                  className="min-h-40 w-full rounded-card"
                />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Categories are unavailable"
              message={error}
              onRetry={handleRetry}
            />
          ) : services.length === 0 ? (
            <EmptyState
              title="No categories yet"
              description="Categories appear here once active services are added."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {tiles.map(({ label, href }, index) => (
                <CategoryCard
                  key={label}
                  number={index + 1}
                  label={label}
                  href={href}
                  icon={CATEGORY_ICONS[label]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
