import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ROUTES, SALON_CONTACT } from "@/lib/constants";
import { Logo } from "./Logo";

/**
 * PUBLIC FOOTER
 * -------------
 * Server Component with the contact details, opening hours and social links
 * from the Figma design. Values live in SALON_CONTACT so links stay in sync.
 */
export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-plum bg-plum-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-12 sm:px-6 lg:px-8">
        <div className="lg:col-span-5">
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-blush">
            A calm, modern salon where every appointment feels like a little
            retreat. Book your next glow-up in minutes.
          </p>
          <ul className="mt-6 flex items-center gap-3">
            {SALON_CONTACT.socialLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label === "X" ? "X" : undefined}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-sm font-bold text-white transition-colors hover:border-rose-gold hover:text-rose-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
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
                Browse Services
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

        <div className="lg:col-span-5">
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
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-blush sm:px-6 lg:px-8">
          <p>© {year} SalonBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
