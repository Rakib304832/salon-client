import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentCancel, PaymentPageSkeleton } from "@/components/payment";

export const metadata: Metadata = {
  title: "Payment cancelled",
  description: "Review your appointment after leaving Stripe Checkout.",
};

/**
 * BRIEF-FRIENDLY ALIAS
 * --------------------
 * Kept alongside /booking/cancel for the same reason as the success alias: the
 * route name in the brief and the URL hard-coded by the server must both work.
 */
export default function PaymentCancelAliasPage() {
  return (
    <Suspense fallback={<PaymentPageSkeleton />}>
      <PaymentCancel />
    </Suspense>
  );
}
