import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Star } from "lucide-react";
import { buttonStyles } from "@/components/ui";
import { ROUTES } from "@/lib/constants";

/**
 * HOME HERO BANNER
 * ----------------
 * A Server Component: everything here is static, so it ships no JavaScript.
 * The illustration is a local SVG in /public, which means the banner renders
 * even when the Express API is offline or ImgBB is not configured yet.
 *
 * Next.js 16 note: `priority` is deprecated for next/image. We use the clearer
 * `loading="eager"` plus `fetchPriority="high"` for the single LCP image.
 */
export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-ivory">
      {/* Decorative background wash; aria-hidden keeps it out of assistive tech. */}
      <div
        aria-hidden="true"
        className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blush/50 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-gold">
            Salon appointments, simplified
          </p>

          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Look your best,{" "}
            <span className="text-rose-gold">without the back-and-forth.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-muted">
            Discover trusted salon services, request a time that suits you, and
            keep every appointment in one calm, easy place. No phone tag, no
            double bookings, no guesswork.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={ROUTES.services} className={buttonStyles({ size: "lg" })}>
              Explore services
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href={`${ROUTES.home}#why-us`}
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              How it works
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Star aria-hidden="true" className="h-4 w-4 fill-rose-gold text-rose-gold" />
              Carefully chosen services
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck aria-hidden="true" className="h-4 w-4 text-plum" />
              Simple time-slot booking
            </span>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-rose-gold/25 blur-2xl"
          />

          <div className="relative overflow-hidden rounded-[32px] border border-line bg-blush-light shadow-xl">
            <Image
              src="/hero-salon.svg"
              alt="Illustration of a calm salon interior with a mirror, styling chair and plants"
              width={800}
              height={900}
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Floating reassurance card; pointer-events-none so it never blocks the image. */}
          <div className="pointer-events-none absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-lg sm:left-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush-light text-plum">
              <CalendarCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-plum">
                Book in minutes
              </span>
              <span className="block text-xs text-muted">
                Confirmation from the salon
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
