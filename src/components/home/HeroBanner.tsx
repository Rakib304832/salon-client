import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonStyles } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import { RatingCard } from "./RatingCard";
import { StatsRow } from "./StatsRow";
import styles from "./HeroBanner.module.css";

/**
 * HOME HERO BANNER
 * ----------------
 * Server Component: all content is static, so it ships no JavaScript. The
 * `data-enter-*` attributes are plain markers read by <HomeMotion/>:
 *
 * - heading  rises line by line out of line masks (SplitText measures them)
 * - eyebrow  arrives with the first line
 * - lead, actions, facts and rating card fade up after the headline settles
 *
 * The salon photograph is a decorative full-bleed layer rather than an
 * <Image>: it carries no information of its own and must cover the entire
 * section, so `background-size: cover` is the simplest correct tool. A separate
 * gradient layer keeps the original copy readable without editing the copy.
 *
 * The illustration card was removed intentionally. The 4.9 badge remains and
 * is positioned over the photograph so the social proof is still present.
 */
export function HeroBanner() {
  return (
    <section
      data-enter
      aria-labelledby="hero-heading"
      className={`${styles.hero} relative isolate flex min-h-[calc(100svh-72px)] items-center overflow-hidden bg-plum-dark py-12 lg:py-14`}
    >
      {/*
        Photo and gradient are siblings, not children of the copy. That keeps
        the background purely decorative and lets the original content layer
        sit above it without any wrapper changing its semantics.
      */}
      <div aria-hidden="true" className={styles.photo} />

      {/* Soft warm light, kept still: the hero's only movement is its entrance. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-blush/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-rose-gold/10 blur-3xl"
      />

      <div className="pointer-events-none relative z-10 mx-auto grid w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-auto max-w-3xl">
          <p
            data-enter-eyebrow
            className="text-xs font-bold uppercase tracking-[0.24em] text-rose-gold"
          >
            ✦ Luxury Salon &amp; Spa
          </p>

          <h1
            id="hero-heading"
            data-enter-heading
            className={`${styles.heading} mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl`}
          >
            Where Beauty Meets{" "}
            <span className="text-rose-gold">Calm</span>
          </h1>

          <p
            data-enter-lead
            className={`${styles.lead} mt-6 max-w-xl text-base leading-7`}
          >
            Discover signature hair, skin and spa services, then reserve your
            perfect time in just a few taps. No calls, no waiting.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.services}
              data-enter-action
              className={buttonStyles({ size: "lg", className: "m-btn" })}
            >
              Explore Salon Services
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href={`${ROUTES.home}#why-us`}
              data-enter-action
              className={buttonStyles({
                variant: "outline",
                size: "lg",
                className: "m-btn",
              })}
            >
              How it works
            </Link>
          </div>

          {/* Scoped so the stats inherit the hero's on-photo contrast. */}
          <div className={styles.stats}>
            <StatsRow />
          </div>
        </div>

        {/*
          One badge instance, placed in normal flow on small screens and pinned
          to the open right side of the photograph from the sm breakpoint up.
          The inner relative box is only a positioning anchor for RatingCard.
        */}
        <div
          className={`${styles.ratingSlot} pointer-events-none relative z-20 mb-6 mt-12 w-full sm:absolute sm:bottom-8 sm:right-8 sm:mb-0 sm:mt-0 sm:w-64`}
        >
          <div className="relative h-20">
            <RatingCard />
          </div>
        </div>
      </div>
    </section>
  );
}
