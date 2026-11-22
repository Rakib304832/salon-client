import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { ROUTES, SALON_CONTACT } from "@/lib/constants";
import { Logo } from "./Logo";

/**
 * PUBLIC FOOTER
 * -------------
 * A Server Component: it contains only static links and copy, so it adds zero
 * JavaScript to the browser bundle.
 *
 * The salon contact details live in SALON_CONTACT so the email/telephone links,
 * address and opening hours cannot drift apart. The sample values are safe to
 * ship with the client repository; replace them with the real salon details
 * before the production launch.
 */
export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-plum bg-plum-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-12 sm:px-6 lg:px-8">
        <div className="lg:col-span-4">
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-blush">
            A calm, simple way to discover salon services, request a time that
            suits you, and manage every visit in one place.
          </p>
        </div>

        <div className="lg:col-span-2">
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

        <div className="lg:col-span-2">
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

        <div className="lg:col-span-4">
          <h2 className="font-sans text-sm font-bold text-white">
            Visit &amp; contact
          </h2>
          <address className="mt-4 space-y-2 text-sm not-italic leading-6 text-blush">
            <div className="flex items-start gap-2">
              <MapPin aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-rose-gold" />
              <span>
                {SALON_CONTACT.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-rose-gold" />
              <a href={`mailto:${SALON_CONTACT.email}`} className="hover:text-white">
                {SALON_CONTACT.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-rose-gold" />
              <a href={`tel:${SALON_CONTACT.phoneHref}`} className="hover:text-white">
                {SALON_CONTACT.phoneDisplay}
              </a>
            </div>
          </address>

          <div className="mt-5 border-t border-white/10 pt-5">
            <h3 className="flex items-center gap-2 font-sans text-sm font-bold text-white">
              <Clock aria-hidden="true" className="h-4 w-4 text-rose-gold" />
              Opening hours
            </h3>
            <dl className="mt-2 space-y-1.5 text-sm text-blush">
              {SALON_CONTACT.hours.map((entry) => (
                <div key={entry.days} className="flex flex-wrap justify-between gap-x-4">
                  <dt>{entry.days}</dt>
                  <dd className="font-bold text-white">{entry.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-12">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-8">
            <h2 className="font-sans text-sm font-bold text-white">Follow us</h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-blush">
              {SALON_CONTACT.socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
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
