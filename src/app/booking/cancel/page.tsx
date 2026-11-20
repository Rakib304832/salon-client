import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentCancel, PaymentPageSkeleton } from "@/components/payment";

export const metadata: Metadata = {
  title: "Payment cancelled",
  description: "Review your appointment after leaving Stripe Checkout.",
};

/**
 * STRIPE CANCEL URL — SERVER-CONTRACT PATH
 * ----------------------------------------
 * Stripe returns here with `appointment_id`. The page explains that no payment
 * was taken and lets the customer retry checkout if the appointment is still
 * confirmed and unpaid.
 */
export default function BookingCancelPage() {
  return (
    <Suspense fallback={<PaymentPageSkeleton />}>
      <PaymentCancel />
    </Suspense>
  );
}
