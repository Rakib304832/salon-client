"use client";

import { paymentsApi } from "./api";

/**
 * START CHECKOUT
 * --------------
 * Both the appointment list and the payment-cancel page need the exact same
 * behaviour: ask the Express server for a Stripe Checkout URL, then leave this
 * site. Keeping that in one helper avoids two subtly different implementations.
 *
 * Security note: the amount is never sent from the browser. The server reads
 * the appointment from the session and builds the Stripe line item itself.
 */
export async function startCheckout(appointmentId: string): Promise<void> {
  const result = await paymentsApi.createCheckout(appointmentId);

  if (!result?.url) {
    // Defensive guard: the API contract promises a URL, but a broken deployment
    // should produce a readable error instead of a silent no-op.
    throw new Error("The payment provider did not return a checkout URL.");
  }

  if (typeof window === "undefined") {
    throw new Error("Checkout can only start in the browser.");
  }

  // A full-document navigation is required: Stripe Checkout is hosted outside
  // this Next.js app, so router.push() would try to treat its URL as a route.
  window.location.assign(result.url);
}
