/**
 * Payment return-page barrel.
 *
 * Both /booking/* and /payment/* routes render the same components, so there
 * is one polling implementation and one cancel explanation for both aliases.
 */
export { PaymentCancel } from "./PaymentCancel";
export { PaymentPageFrame, PaymentPageSkeleton } from "./PaymentPageFrame";
export { PaymentSuccess } from "./PaymentSuccess";
