/**
 * Barrel export for the API layer.
 *
 * Pages should import endpoint modules from here:
 *   import { servicesApi, appointmentsApi } from "@/lib/api";
 *
 * The shared fetch wrapper stays in ./client and is not re-exported as a
 * convenience action; keeping it internal makes it harder to bypass the
 * credential/error rules it enforces.
 */
export { ApiError, API_BASE_URL, apiUrl } from "./client";
export type { ApiRequestOptions, QueryParams, QueryValue } from "./client";
export { appointmentsApi } from "./appointments";
export type { AdminAppointmentQuery } from "./appointments";
export { paymentsApi } from "./payments";
export { servicesApi } from "./services";
export type { ServiceQuery } from "./services";
export { statsApi } from "./stats";
export { transactionsApi } from "./transactions";
export type { TransactionQuery } from "./transactions";
export { uploadsApi } from "./uploads";
export { usersApi } from "./users";
export type { AdminUserQuery } from "./users";
