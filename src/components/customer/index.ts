/**
 * Customer dashboard UI barrel.
 *
 * Pages import from this stable entry point so the overview, appointments list
 * and profile form cannot accidentally use different shells or cards.
 */
export { AppointmentSummaryCard } from "./AppointmentSummaryCard";
export type { AppointmentSummaryCardProps } from "./AppointmentSummaryCard";
export { CustomerAppointments } from "./CustomerAppointments";
export { CustomerOverview } from "./CustomerOverview";
export { CustomerProfileForm } from "./CustomerProfileForm";
export type { CustomerProfileFormProps } from "./CustomerProfileForm";
