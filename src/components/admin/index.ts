/**
 * Admin dashboard UI barrel.
 *
 * All admin screens import through this path so they share the same guard,
 * shell and status badge conventions as the rest of the application.
 */
export { AdminAppointments } from "./AdminAppointments";
export { AdminOverview } from "./AdminOverview";
export { AdminUsers } from "./AdminUsers";
export { ServiceForm } from "./ServiceForm";
export type { ServiceFormProps } from "./ServiceForm";
export { ServiceManager } from "./ServiceManager";
