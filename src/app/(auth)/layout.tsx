import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/layout";
import { ThemeToggle } from "@/components/theme";

/**
 * AUTH ROUTE GROUP LAYOUT
 * -----------------------
 * `(auth)` is a route group, so these folders do not add a URL segment:
 * `(auth)/sign-in/page.tsx` still resolves to `/sign-in`.
 *
 * Sign-in and sign-up deliberately do NOT use the public navbar/footer. A
 * focused two-column shell keeps attention on the form and avoids the user
 * navigating away mid-authentication. On small screens the decorative brand
 * panel is hidden so the form gets the full viewport.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-plum-dark p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo tone="light" />

        <div className="relative z-10 max-w-md">
          <Sparkles aria-hidden="true" className="h-9 w-9 text-rose-gold" />
          <h1 className="mt-6 text-4xl leading-tight">
            “A beautiful appointment begins with a beautifully simple booking.”
          </h1>
          <p className="mt-4 text-base leading-7 text-blush">
            — The SalonBook promise
          </p>
        </div>

        <p className="relative z-10 text-sm text-blush">
          Book trusted salon services in a few calm steps.
        </p>

        {/* Decorative blurred shapes; aria-hidden keeps them out of screen readers. */}
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-rose-gold/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blush/10 blur-3xl"
        />
      </section>

      <section className="relative flex items-center justify-center bg-ivory px-4 py-12 sm:px-8">
        <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
          <ThemeToggle local />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
