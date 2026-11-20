import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentPageSkeleton, PaymentSuccess } from "@/components/payment";

export const metadata: Metadata = {
  title: "Payment confirmed",
  description: "Verify your SalonBook payment after Stripe Checkout.",
};

/**
 * STRIPE SUCCESS URL — SERVER-CONTRACT PATH
 * ----------------------------------------
 * The Express checkout controller hardcodes `${CLIENT_URL}/booking/success`.
 * That path must exist or a paid customer lands on a 404.
 *
 * PaymentSuccess reads `session_id` with useSearchParams, so the Suspense
 * boundary is required by Next.js. It also gives the user an immediate loading
 * state instead of a blank screen while the browser hydrates.
 */
export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<PaymentPageSkeleton />}>
      <PaymentSuccess />
    </Suspense>
  );
}
