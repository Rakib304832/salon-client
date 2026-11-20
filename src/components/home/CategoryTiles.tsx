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
import { HOME_CATEGORIES, ROUTES, type HomeCategory } from "@/lib/constants";

/**
 * HOME CATEGORY TILES
 * -------------------
 * The brief asks for exactly seven salon categories on the home page. The API
 * also supports Waxing and Bridal, but those are kept for the /services filter
 * (API_CATEGORIES) so this section matches the design.
 *
 * Every tile links to /services?category=... . That route is built in Part 7;
 * encoding the value now means clicking a tile already carries the right intent.
 *
 * This is a Server Component — only static links and icons, so no client JS.
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

export function CategoryTiles() {
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

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {HOME_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            const href = `${ROUTES.services}?category=${encodeURIComponent(category)}`;

            return (
              <Link
                key={category}
                href={href}
                className="group flex min-h-36 flex-col justify-between rounded-card border border-line bg-ivory p-5 transition duration-200 hover:-translate-y-1 hover:border-rose-gold hover:bg-blush-light focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-plum shadow-sm transition-colors group-hover:bg-plum group-hover:text-white">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>

                <span className="mt-4 flex items-end justify-between gap-2">
                  <span className="text-sm font-bold leading-snug text-plum">
                    {category}
                  </span>
                  <span className="text-xs text-rose-gold opacity-0 transition-opacity group-hover:opacity-100">
                    →
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
