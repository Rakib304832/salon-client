import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { Logo } from "./Logo";

/**
 * PUBLIC FOOTER
 * -------------
 * A Server Component: it contains only static links and copy, so it adds zero
 * JavaScript to the browser bundle.
 *
 * We deliberately avoid inventing addresses, phone numbers or social profiles.
 * The assignment brief does not provide real ones, and fake contact details look
 * unprofessional in a submission. Internal navigation and booking guidance are
 * enough for this shell.
 */
export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-plum bg-plum-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
        <div className="lg:col-span-2">
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-blush">
            A calm, simple way to discover salon services, request a time that
            suits you, and manage every visit in one place.
          </p>
        </div>

        <div>
          <h2 className="font-sans text-sm font-bold text-white">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-blush">
            <li>
              <Link href={ROUTES.home} className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link href={ROUTES.services} className="hover:text-white">
                Browse services
              </Link>
            </li>
            <li>
              <Link
                href={`${ROUTES.home}#why-us`}
                className="hover:text-white"
              >
                Why SalonBook
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-sm font-bold text-white">Account</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-blush">
            <li>
              <Link href={ROUTES.signIn} className="hover:text-white">
                Sign in
              </Link>
            </li>
            <li>
              <Link href={ROUTES.signUp} className="hover:text-white">
                Create account
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES.customerAppointments}
                className="hover:text-white"
              >
                My appointments
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-blush sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {year} SalonBook. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden="true" className="h-3.5 w-3.5" />
              Booking available online
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              Made for modern salons
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
