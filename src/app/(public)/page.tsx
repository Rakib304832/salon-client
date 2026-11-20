import type { Metadata } from "next";
import {
  CategoryTiles,
  FeaturedServices,
  HeroBanner,
  WhySalonBook,
} from "@/components/home";

/**
 * HOME PAGE
 * ---------
 * This is intentionally a thin Server Component composition. The public route
 * group layout supplies the navbar and footer; this file only chooses section
 * order. Each section owns its own comments and data requirements:
 *
 * 1. HeroBanner        — static banner and primary calls to action
 * 2. FeaturedServices  — live preview from GET /api/services
 * 3. CategoryTiles     — the seven brief categories
 * 4. WhySalonBook      — extra explainer + final call to action (`#why-us`)
 *
 * Keeping the page this small makes later design tweaks a one-line reorder
 * instead of a large edit.
 */
export const metadata: Metadata = {
  description:
    "Explore salon services, request an appointment, and manage your bookings with SalonBook.",
};

export default function HomePage() {
  return (
    <main>
      <HeroBanner />
      <FeaturedServices />
      <CategoryTiles />
      <WhySalonBook />
    </main>
  );
}
