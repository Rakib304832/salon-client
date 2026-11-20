import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { buttonStyles } from "@/components/ui";
import { ROUTES } from "@/lib/constants";

/**
 * EXTRA HOME SECTION — "WHY SALONBOOK"
 * -------------------------------------
 * The brief asks for one extra content section below categories. This explains
 * the three-step customer journey in plain language and gives the header's
 * "Why SalonBook" anchor a real target via id="why-us".
 *
 * It also ends with a final call-to-action band, so a visitor who scrolls to
 * the bottom always has an obvious next step.
 */
interface Reason {
  icon: LucideIcon;
  step: string;
  title: string;
  description: string;
}

const REASONS: Reason[] = [
  {
    icon: CalendarCheck,
    step: "01",
    title: "Pick a service and time",
    description:
      "Browse the menu, read the details, then choose an available hourly slot that works for you.",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "Salon confirms your request",
    description:
      "Your appointment starts as Pending. The salon confirms it, or offers another time if needed.",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Pay after confirmation",
    description:
      "Only confirmed appointments can be paid. Payment status is updated by the server, never by the browser.",
  },
];

export function WhySalonBook() {
  return (
    <section
      id="why-us"
      aria-labelledby="why-salonbook-heading"
      className="scroll-mt-20 bg-blush-light/60 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-gold">
            A smoother salon visit
          </p>
          <h2 id="why-salonbook-heading" className="mt-3 text-3xl sm:text-4xl">
            Good looks, minus the hassle
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            SalonBook keeps the whole journey in one place, from the first idea
            to the final payment.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {REASONS.map(({ icon: Icon, step, title, description }) => (
            <article
              key={step}
              className="rounded-card border border-line bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-light text-plum">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <span className="font-display text-2xl font-semibold text-blush">
                  {step}
                </span>
              </div>
              <h3 className="mt-5 text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-card bg-plum-dark px-6 py-10 text-center text-white sm:px-10">
          <h2 className="text-2xl text-white sm:text-3xl">
            Ready for your next great look?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-blush">
            Take a moment to explore the services and choose a time that fits
            your day.
          </p>
          <Link
            href={ROUTES.services}
            className={buttonStyles({ variant: "accent", size: "lg", className: "mt-7" })}
          >
            Browse services
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
