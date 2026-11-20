import type { ReactNode } from "react";
import { Logo } from "@/components/layout";
import { Skeleton, Spinner } from "@/components/ui";

/**
 * SHARED RETURN-PAGE FRAME
 * ------------------------
 * Stripe redirects the browser back to this application after checkout. Those
 * pages are standalone: they do not include the public header/footer or the
 * dashboard sidebar, which keeps the payment result focused and avoids nested
 * navigation during a critical moment.
 *
 * The frame is server-safe. Both the success and cancel components can render
 * it even though they are Client Components themselves.
 */
export interface PaymentPageFrameProps {
  children: ReactNode;
}

export function PaymentPageFrame({ children }: PaymentPageFrameProps) {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-line bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <Logo />
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        {children}
      </main>
    </div>
  );
}

/** Suspense fallback used by every payment route that reads search params. */
export function PaymentPageSkeleton() {
  return (
    <PaymentPageFrame>
      <div className="flex flex-col items-center rounded-card border border-line bg-white px-6 py-14 text-center">
        <Spinner size="lg" label="Loading payment status" />
        <p className="mt-5 text-sm text-muted">Checking your payment status…</p>
        <div className="mt-8 w-full max-w-sm space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </PaymentPageFrame>
  );
}
