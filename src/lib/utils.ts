import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn — the single class-name helper for the whole client.
 *
 * Why both libraries?
 * - clsx lets us pass conditional classes cleanly: cn("base", isError && "text-red").
 * - tailwind-merge removes conflicting utilities, e.g. "px-2 px-4" becomes
 *   "px-4" so a caller's override reliably wins.
 *
 * Every component in components/ui uses this helper. That keeps customisation
 * predictable without fighting Tailwind's class order.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats money for display.
 *
 * IMPORTANT: callers must pass the major-unit amount.
 * - Service prices and appointment.servicePrice are already dollars.
 * - Transaction.amount from the server is in cents, so the transactions page
 *   must call formatCurrency(transaction.amount / 100, transaction.currency).
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/**
 * Safely turns an API date string into a Date.
 *
 * Appointment dates arrive as `YYYY-MM-DD`. JavaScript parses that form as UTC
 * midnight, which can render as the previous day in negative time zones. We
 * append a local time component for date-only strings so the calendar day stays
 * correct for the user.
 */
function toDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const localDate = new Date(`${trimmed}T00:00:00`);
    return Number.isNaN(localDate.getTime()) ? null : localDate;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** `Nov 20, 2026` — used for appointment dates and request/transaction dates. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = toDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/** `Nov 20, 2026 · 09:00 AM` — used in details dialogs and admin tables. */
export function formatDateTime(
  value: string | Date | null | undefined,
): string {
  if (!value) return "—";
  const date = toDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Converts service.duration (minutes) into a friendly label.
 * `45 -> "45 min"`, `90 -> "1h 30m"`.
 */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

/**
 * Stripe session IDs are long. The transactions page shows only the first
 * eight characters and uses CopyButton to copy the full value.
 */
export function shortenSessionId(sessionId: string, length = 8): string {
  if (!sessionId) return "—";
  return sessionId.length <= length
    ? sessionId
    : `${sessionId.slice(0, length)}…`;
}

/** `Salon Admin -> SA` — used by avatar fallbacks. */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
