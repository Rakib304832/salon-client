/**
 * Shared client-side types.
 *
 * These mirror the four server collections exactly. The contract is intentionally
 * strict: User uses `id` (Better Auth), while Service, Appointment and
 * Transaction use `_id` (MongoDB documents). Do not "normalise" these names in
 * the API layer — field names must match the server response exactly.
 */

export type UserRole = "admin" | "customer";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";
export type ServiceStatus = "active" | "inactive";
export type TransactionStatus = "paid" | "failed";

/** users (Better Auth manages this collection) */
export interface User {
  id: string;
  name: string;
  email: string; // read-only in profile pages
  image?: string;
  role: UserRole; // set by the server only
  isBlocked: boolean; // set by the server only
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** services */
export interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number; // positive, major currency units (USD)
  duration: number; // minutes, positive
  image: string; // ImgBB URL from the server
  status: ServiceStatus;
  createdAt: string;
}

/** appointments */
export interface Appointment {
  _id: string;
  serviceId: string | Service;
  customerId: string | User;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string;
  message?: string;
  servicePrice: number; // saved at booking time — use this, not current service.price
  paymentStatus: PaymentStatus; // changed by the verified webhook only
  status: AppointmentStatus;
  createdAt: string; // shown as the request date

  // Populated by admin endpoints. Optional because customer endpoints may not
  // include them.
  customerInfo?: User;
  serviceInfo?: Service;
}

/** transactions (read-only in the client) */
export interface Transaction {
  _id: string;
  appointmentId: string | Appointment;
  customerId: string | User;
  amount: number; // IMPORTANT: cents; divide by 100 before display
  currency: string; // "usd" from Stripe
  stripeSessionId: string;
  status: TransactionStatus;
  createdAt: string;

  customerInfo?: User;
  serviceInfo?: Service;
  appointmentInfo?: Appointment;
  /** Copied from the related booking by the admin transaction serializer. */
  appointmentDate?: string;
}

/* -------------------------------------------------------------------------- */
/* API envelope                                                               */
/* -------------------------------------------------------------------------- */

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: ApiErrorDetail[];
  code?: string;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

/** Better Auth's session response. We only describe the fields we consume. */
export interface ClientSession {
  session: {
    id: string;
    userId: string;
    expiresAt: string | Date;
    [key: string]: unknown;
  };
  user: User;
}

/* -------------------------------------------------------------------------- */
/* Stats                                                                      */
/* -------------------------------------------------------------------------- */

export interface CustomerStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  paid: number;
  unpaid: number;
}

/**
 * Exact shape of GET /api/admin/stats.
 *
 * These keys mirror server/src/types/models.ts. Keeping them strict means a
 * contract change becomes a TypeScript error instead of silently rendering
 * "undefined" on the dashboard.
 */
export interface AdminCounts {
  users: number;
  customers: number;
  services: number;
  activeServices: number;
  appointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  paidAppointments: number;
  paidTransactions: number;
  failedTransactions: number;
}

export interface AdminRevenueBreakdown {
  /** Lower-case currency code reported by Stripe, e.g. "usd". */
  currency: string;
  /** Smallest currency unit; divide by 100 before display. */
  amount: number;
}

export interface AdminRevenue {
  /** Combined amount in the smallest currency unit. */
  total: number;
  byCurrency: AdminRevenueBreakdown[];
}

export interface PopularServiceStat {
  serviceId: string;
  serviceName: string;
  /** Non-cancelled appointments, not the client-side `count` guess. */
  bookings: number;
}

export interface AdminStats {
  counts: AdminCounts;
  revenue: AdminRevenue;
  recentAppointments: Appointment[];
  popularServices: PopularServiceStat[];
}

/* -------------------------------------------------------------------------- */
/* Request/response payloads                                                  */
/* -------------------------------------------------------------------------- */

export interface ServiceInput {
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  status: ServiceStatus;
}

export interface AppointmentInput {
  serviceId: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
}

export interface ProfileInput {
  name?: string;
  phone?: string;
  image?: string;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

/**
 * GET /api/payments/session/:sessionId returns deliberately small summaries,
 * not full Transaction/Appointment documents. Modelling them as the complete
 * types would hide the fact that fields such as customerId are absent on the
 * success page.
 */
export interface PaymentTransactionSummary {
  _id: string;
  status: TransactionStatus;
  /** Stripe smallest currency unit; divide by 100 before display. */
  amount: number;
  currency: string;
  createdAt: string;
}

export interface PaymentAppointmentSummary {
  _id: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  appointmentDate: string;
  timeSlot: string;
  servicePrice: number;
  serviceName: string;
}

export interface PaymentSessionResponse {
  sessionId: string;
  transaction?: PaymentTransactionSummary | null;
  appointment?: PaymentAppointmentSummary | null;
  confirmed: boolean;
}

export interface UploadResponse {
  url: string;
}
