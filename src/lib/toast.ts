"use client";

import { toast } from "sonner";
import { ApiError } from "./api/client";
import { API_ERROR_CODES } from "./constants";
import type { ApiErrorDetail } from "@/types";

/**
 * TOAST HELPERS
 * -------------
 * Sonner's <Toaster /> is mounted once in the root layout, so any client
 * component can call these helpers without extra setup.
 *
 * Why wrap sonner instead of calling toast.* everywhere?
 * - One consistent message style across auth, booking and admin actions.
 * - ApiError codes are translated into human, salon-friendly language.
 * - No component has to remember how to unwrap server validation errors.
 * - Replacing the toast library later means editing one file.
 *
 * These helpers never replace inline form errors or inline ErrorState. Toasts
 * are for action feedback; persistent page problems still need visible UI.
 */

const CODE_DESCRIPTIONS: Record<string, string> = {
  [API_ERROR_CODES.ACCOUNT_BLOCKED]:
    "This account has been blocked. Please contact the salon.",
  [API_ERROR_CODES.SLOT_ALREADY_BOOKED]:
    "That time was just taken. Choose another slot.",
  [API_ERROR_CODES.APPOINTMENT_NOT_CANCELLABLE]:
    "Only pending appointments can be cancelled.",
  [API_ERROR_CODES.APPOINTMENT_ALREADY_PAID]:
    "This appointment has already been paid for.",
  [API_ERROR_CODES.APPOINTMENT_NOT_PAYABLE]:
    "Only confirmed, unpaid appointments can be paid.",
  [API_ERROR_CODES.PAYMENT_NOT_CONFIRMED]:
    "Payment is still being confirmed. We will keep checking.",
  [API_ERROR_CODES.UPLOAD_RATE_LIMITED]:
    "Too many uploads in a short time. Please wait and try again.",
  [API_ERROR_CODES.LAST_ADMIN_PROTECTED]:
    "The last admin account cannot be blocked.",
  [API_ERROR_CODES.STRIPE_CHECKOUT_FAILED]:
    "Checkout could not be started. Please try again.",
};

export function toastSuccess(message: string, description?: string) {
  return toast.success(message, { description });
}

export function toastError(message: string, description?: string) {
  return toast.error(message, { description });
}

export function toastInfo(message: string, description?: string) {
  return toast.info(message, { description });
}

/**
 * Converts any thrown value into one consistent error toast.
 *
 * `fallback` is used for unexpected errors so we never show "undefined" or a
 * raw stack trace to the user. Known ApiError codes get an extra explanation
 * below the server's own message.
 */
export function toastApiError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (!(error instanceof ApiError)) {
    toastError(
      fallback,
      error instanceof Error ? error.message : undefined,
    );
    return;
  }

  const codeDescription = CODE_DESCRIPTIONS[error.code ?? ""];
  const fieldDescription = error.errors?.[0]?.message;
  const permissionDescription =
    error.status === 403
      ? "You do not have permission to do that."
      : error.status === 401
        ? "Your session may have expired. Please sign in again."
        : undefined;

  toastError(
    error.message || fallback,
    codeDescription ?? fieldDescription ?? permissionDescription,
  );
}

/**
 * React Hook Form and Zod both produce field error arrays. This helper turns
 * them into one short toast while the form still shows inline field messages.
 */
export function toastValidationErrors(
  errors: ApiErrorDetail[] | undefined,
  fallback = "Please check the highlighted fields.",
) {
  if (!errors?.length) {
    toastError(fallback);
    return;
  }

  const first = errors[0];
  const detail =
    errors.length > 1
      ? `${errors.length} fields need attention.`
      : first.field
        ? `Check ${first.field}.`
        : undefined;

  toastError(first.message || fallback, detail);
}
