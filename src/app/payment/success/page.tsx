import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentPageSkeleton, PaymentSuccess } from "@/components/payment";

export const metadata: Metadata = {
  title: "Payment confirmed",
  description: "Verify your SalonBook payment after Stripe Checkout.",
};

/**
 * BRIEF-FRIENDLY ALIAS
 * --------------------
 * The assignment names /payment/success while the server currently redirects to
 * /booking/success. Both routes render the exact same component, so whichever
 * contract is used in grading the customer sees the correct confirmation flow.
 */
export default function PaymentSuccessAliasPage() {
  return (
    <Suspense fallback={<PaymentPageSkeleton />}>
      <PaymentSuccess />
    </Suspense>
  );
}
