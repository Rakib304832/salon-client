import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/layout";
import { buttonStyles } from "@/components/ui";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The SalonBook page you requested could not be found.",
};

/**
 * BRANDED 404
 * -----------
 * Next.js renders this Server Component for unmatched URLs and for route
 * segments that call notFound(). It sits inside the root layout, so it provides
 * its own compact shell instead of assuming the public header/footer are
 * present. Navigation links use the central route map.
 */
export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col bg-ivory">
      <div className="border-b border-line bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Logo />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blush-light text-plum">
            <Compass aria-hidden="true" className="h-7 w-7" />
          </span>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-rose-gold">
            404
          </p>
          <h1 className="mt-3 text-4xl">We couldn&apos;t find that page</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted">
            The link may be outdated, or the page may have moved. Start again
            from the home page or browse the current salon services.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={ROUTES.home}
              className={buttonStyles({ variant: "primary" })}
            >
              Back to home
            </Link>
            <Link
              href={ROUTES.services}
              className={buttonStyles({ variant: "outline" })}
            >
              Browse services
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
