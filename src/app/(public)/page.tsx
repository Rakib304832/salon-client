import type { Metadata } from "next";
import {
  CategoryTiles,
  CtaBand,
  FeaturedServices,
  HeroBanner,
  WhyChooseUs,
} from "@/components/home";
import { HomeMotion } from "@/components/motion";

/**
 * HOME PAGE
 * ---------
 * Thin Server Component composition. Section order follows the Figma design:
 * hero, categories, featured services, why choose us, then the final CTA band.
 * The public layout supplies the navbar and footer.
 *
 * HomeMotion owns the <main> element and the page's two scripted motions: the
 * hero entrance and the statement moment. Every section inside it is still a
 * Server Component, so no section markup is shipped as client JavaScript.
 */
export const metadata: Metadata = {
  description:
    "Explore salon services, request an appointment, and manage your bookings with SalonBook.",
};

export default function HomePage() {
  return (
    <HomeMotion>
      <HeroBanner />
      <CategoryTiles />
      <FeaturedServices />
      <WhyChooseUs />
      <CtaBand />
    </HomeMotion>
  );
}
