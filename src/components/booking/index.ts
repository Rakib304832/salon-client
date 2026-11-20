/**
 * Booking UI barrel.
 *
 * The service detail page imports the form from here. Keeping a single entry
 * point means a future booking widget or admin "book on behalf" screen can
 * reuse the same validation and submission rules.
 */
export { BookingForm } from "./BookingForm";
export type { BookingFormProps } from "./BookingForm";
