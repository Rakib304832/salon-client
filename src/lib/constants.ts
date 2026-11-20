/**
 * Shared constants for the SalonBook client.
 *
 * Brief vs server note:
 * - The brief lists seven salon categories for the Home category tiles.
 * - The server's fixed constants include two more (Waxing and Bridal).
 * - We show the seven brief categories on Home, but expose all nine as a
 *   fallback for filters so no seeded service becomes unreachable.
 * - In Browse Services the final filter options come from the API response,
 *   with this list used only while loading or if the request fails.
 */

export const HOME_CATEGORIES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
] as const;

export const API_CATEGORIES = [
  ...HOME_CATEGORIES,
  "Waxing",
  "Bridal",
] as const;

export type HomeCategory = (typeof HOME_CATEGORIES)[number];
export type Category = (typeof API_CATEGORIES)[number];

/**
 * Fixed hourly slots required by the brief. The Figma design shows 90-minute
 * intervals, but the assignment brief wins, so we use 09:00 AM–06:00 PM hourly.
 */
export const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

/** Sort values must match the server contract exactly. */
export const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

export type ServiceSort = "" | "price_asc" | "price_desc";

/**
 * Central route map. Using these instead of raw strings prevents typos in
 * redirects, guards, and return URLs.
 */
export const ROUTES = {
  home: "/",
  services: "/services",
  signIn: "/sign-in",
  signUp: "/sign-up",
  customerDashboard: "/dashboard/customer",
  customerAppointments: "/dashboard/customer/appointments",
  customerProfile: "/dashboard/customer/profile",
  adminDashboard: "/dashboard/admin",
  adminServices: "/dashboard/admin/services",
  adminAppointments: "/dashboard/admin/appointments",
  adminUsers: "/dashboard/admin/users",
  adminTransactions: "/dashboard/admin/transactions",
  adminProfile: "/dashboard/admin/profile",
  paymentSuccess: "/payment/success",
  paymentCancel: "/payment/cancel",
  accessDenied: "/access-denied",
  accountBlocked: "/account-blocked",
} as const;

export const APPOINTMENT_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
} as const;

export const PAYMENT_STATUS_LABELS = {
  unpaid: "Unpaid",
  paid: "Paid",
} as const;

/** Error codes the client must branch on, copied from the server contract. */
export const API_ERROR_CODES = {
  ACCOUNT_BLOCKED: "ACCOUNT_BLOCKED",
  SLOT_ALREADY_BOOKED: "SLOT_ALREADY_BOOKED",
  APPOINTMENT_NOT_CANCELLABLE: "APPOINTMENT_NOT_CANCELLABLE",
  APPOINTMENT_ALREADY_PAID: "APPOINTMENT_ALREADY_PAID",
  APPOINTMENT_NOT_PAYABLE: "APPOINTMENT_NOT_PAYABLE",
  PAYMENT_NOT_CONFIRMED: "PAYMENT_NOT_CONFIRMED",
  UPLOAD_RATE_LIMITED: "UPLOAD_RATE_LIMITED",
  LAST_ADMIN_PROTECTED: "LAST_ADMIN_PROTECTED",
  STRIPE_CHECKOUT_FAILED: "STRIPE_CHECKOUT_FAILED",
} as const;
