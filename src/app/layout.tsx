import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers";
import { ThemeToggle } from "@/components/theme";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";
import "./globals.css";
import "./theme.css";
// Loaded once at the root so every ThreeUI component shares the same canonical
// class rules. The exact vendored bundle stylesheet is kept alongside it for
// the registered sources; both are global, so a single import here is enough.
import "@designcodeio/threeui/style.css";
import "../shaders/threeui.css";

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
      data-theme="light"
      // The pre-paint script may change the attribute, so React must not warn
      // about the difference between this server value and the hydrated DOM.
      suppressHydrationWarning
      // Both font variables are attached to <html> so every descendant can
      // inherit them through the Tailwind tokens defined in globals.css.
      className={`${dmSans.variable} ${playfairDisplay.variable}`}
    >
      <head>
        {/*
          Theme must be resolved before the browser paints. A Client Component
          effect would run too late and briefly show the wrong palette.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body
        className="min-h-screen bg-ivory text-text antialiased"
        // Browser extensions (e.g. Grammarly) inject attributes such as
        // cz-shortcut-listen onto <body> before React hydrates. Tell React to
        // keep the DOM's attributes so these third-party mutations don't
        // surface as a hydration mismatch.
        suppressHydrationWarning
      >
        {/*
          Keyboard users can jump straight past repeated navigation. The link is
          visually hidden until focused, and every page shell exposes the matching
          #main-content target added in Part 14.
        */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-plum focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>

        {/*
          Fallback control for standalone pages that do not render a navbar.
          CSS hides it whenever a shell provides its own local switch.
        */}
        <ThemeToggle className="theme-toggle-global" />

        {/*
          AuthProvider wraps the whole route tree so the navbar, page guards,
          dashboards and forms all share one session state. It is a Client
          Component, but Server Components can still be passed as children.

          The global Toaster stays OUTSIDE the provider: toast feedback should
          still work even while the provider is showing its own loading state.
        */}
        <AuthProvider>{children}</AuthProvider>

        {/*
          Sonner's Toaster is mounted once, globally. Components use the small
          helpers in lib/toast.ts (toastSuccess, toastApiError, ...) instead of
          calling sonner directly, which keeps messages consistent. This
          replaces browser alert() for all user feedback.
        */}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
