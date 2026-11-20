import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

/**
 * ROOT LAYOUT
 * -----------
 * In the App Router, the root layout is the outermost component in the tree.
 * It must define <html> and <body>. Every route — public pages, auth pages,
 * dashboard pages, and not-found pages — is rendered inside this component.
 *
 * We intentionally keep this layout small. Route-group layouts added later
 * will provide the site navbar/footer, the split-screen auth shell, and the
 * dashboard sidebar. Global concerns that truly apply everywhere live here:
 * fonts, metadata, global CSS, and the toast host.
 */

/**
 * next/font downloads and self-hosts Google fonts at build time.
 *
 * `variable` does not apply the font directly. It creates a CSS custom
 * property (for example --font-dm-sans) on the rendered element. globals.css
 * maps that variable into Tailwind's font tokens, so components can simply use
 * `font-sans` for body text and `font-display` for headings.
 *
 * DM Sans = body/UI text (Regular, Medium, Bold weights from the variable font).
 * Playfair Display = headings, using the SemiBold look required by the design.
 */
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

/**
 * The Metadata API replaces manual <title> and <meta> tags in the layout.
 * Next.js deduplicates and streams these correctly.
 *
 * `template` gives child pages a consistent suffix, e.g.
 * "Browse Services | SalonBook", while the home page uses the default title.
 */
export const metadata: Metadata = {
  applicationName: "SalonBook",
  title: {
    default: "SalonBook | Salon appointments made simple",
    template: "%s | SalonBook",
  },
  description:
    "Explore salon services, request appointments, manage bookings, and pay for confirmed visits with SalonBook.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      // Both font variables are attached to <html> so every descendant can
      // inherit them through the Tailwind tokens defined in globals.css.
      className={`${dmSans.variable} ${playfairDisplay.variable}`}
    >
      <body className="min-h-screen bg-ivory text-text antialiased">
        {/* The active route tree is injected here by Next.js. */}
        {children}

        {/*
          Sonner's Toaster must be mounted once, globally. Any component can
          call toast.success(...) / toast.error(...) later without importing a
          provider. This replaces browser alert() for all user feedback.
        */}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
