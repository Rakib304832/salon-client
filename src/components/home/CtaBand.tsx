import Link from "next/link";
import { buttonStyles } from "@/components/ui";
import { ROUTES } from "@/lib/constants";

/**
 * Dedicated final CTA band from the Figma home screen.
 */
export function CtaBand() {
  return (
    <section className="bg-ivory py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-card bg-plum-dark px-6 py-12 text-center text-white sm:px-10">
          <h2 className="text-2xl text-white sm:text-4xl">
            Book your glow-up today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-blush">
            Create a free account and reserve your favourite service in
            minutes.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.signUp}
              className={buttonStyles({ variant: "accent", size: "lg" })}
            >
              Create Account
            </Link>
            <Link
              href={ROUTES.services}
              className={buttonStyles({
                variant: "outline",
                size: "lg",
                className: "border-white bg-transparent text-white hover:bg-white/10",
              })}
            >
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
