import type { Appointment, Service, User } from "@/types";

/**
 * APPOINTMENT PRESENTATION HELPERS
 * --------------------------------
 * The API sometimes returns `serviceId` as a plain string and sometimes as a
 * populated Service document. Customer, admin and payment pages all need the
 * same answer to "what is the service called?", so the check lives here rather
 * than being repeated with unsafe casts in every component.
 *
 * These helpers are pure functions with no "use client" directive: Server and
 * Client Components can both import them.
 */

/** Narrow a possible populated service without trusting arbitrary API data. */
function isPopulatedService(value: unknown): value is Service {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    "serviceName" in value &&
    typeof (value as { serviceName?: unknown }).serviceName === "string"
  );
}

/** Return the populated service when the endpoint supplied one. */
export function appointmentService(appointment: Appointment): Service | null {
  return isPopulatedService(appointment.serviceId) ? appointment.serviceId : null;
}

/** Return a stable service id for links and keys in either response shape. */
export function appointmentServiceId(appointment: Appointment): string {
  if (isPopulatedService(appointment.serviceId)) return appointment.serviceId._id;
  return appointment.serviceId;
}

/** Human-readable service name with a safe fallback for deleted services. */
export function appointmentServiceName(appointment: Appointment): string {
  return appointmentService(appointment)?.serviceName ?? "Salon service";
}

/**
 * Narrow a possible populated customer without trusting arbitrary API data.
 * Admin endpoints populate customerId; customer endpoints leave it a string.
 */
function isPopulatedUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value &&
    typeof (value as { email?: unknown }).email === "string"
  );
}

/** Return the safe customer document when the endpoint supplied one. */
export function appointmentCustomer(appointment: Appointment): User | null {
  if (isPopulatedUser(appointment.customerId)) return appointment.customerId;
  return appointment.customerInfo ?? null;
}

/** Human-readable customer name with a safe fallback for removed accounts. */
export function appointmentCustomerName(appointment: Appointment): string {
  const customer = appointmentCustomer(appointment);
  return customer?.name?.trim() || customer?.email || "Unknown customer";
}

/** Only a pending, unpaid request can be cancelled by the customer. */
export function canCustomerCancel(appointment: Appointment): boolean {
  return appointment.status === "pending" && appointment.paymentStatus === "unpaid";
}

/** Only a confirmed, unpaid appointment can open a Stripe checkout session. */
export function canCustomerPay(appointment: Appointment): boolean {
  return appointment.status === "confirmed" && appointment.paymentStatus === "unpaid";
}
