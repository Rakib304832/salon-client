import { api } from "./client";
import type { CheckoutResponse, PaymentSessionResponse } from "@/types";

/**
 * Payment endpoints.
 *
 * The client NEVER marks an appointment as paid. It only:
 * 1. asks the server to create a Stripe Checkout Session, then
 * 2. reads the confirmed result back from the server for the success page.
 */
export const paymentsApi = {
  createCheckout(appointmentId: string) {
    return api.post<CheckoutResponse>("/api/payments/create-checkout-session", {
      body: { appointmentId },
    });
  },

  /**
   * May throw ApiError(404, code PAYMENT_NOT_CONFIRMED) while the Stripe
   * webhook has not landed yet. The success page retries on that code.
   */
  getSession(sessionId: string) {
    return api.get<PaymentSessionResponse>(
      `/api/payments/session/${encodeURIComponent(sessionId)}`,
    );
  },
};
