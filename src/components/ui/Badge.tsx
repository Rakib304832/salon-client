import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "plum"
  | "rose"
  | "pending"
  | "confirmed"
  | "blocked"
  | "paid"
  | "unpaid";

/**
 * All badge colours live here so the same status always looks identical in
 * customer tables, admin tables, transactions, and details dialogs.
 *
 * The names map directly to the design tokens in globals.css:
 * - pending  -> Pending
 * - confirmed-> Confirmed / Active
 * - blocked  -> Cancelled / Failed / Blocked
 * - paid     -> Paid
 * - unpaid   -> Unpaid / Inactive
 */
const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-blush-light text-plum",
  plum: "bg-plum text-white",
  rose: "bg-blush text-plum-dark",
  pending: "bg-status-pending-bg text-status-pending-text",
  confirmed: "bg-status-confirmed-bg text-status-confirmed-text",
  blocked: "bg-status-blocked-bg text-status-blocked-text",
  paid: "bg-status-paid-bg text-status-paid-text",
  unpaid: "bg-status-unpaid-bg text-status-unpaid-text",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold leading-none",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Appointment status badge: pending | confirmed | cancelled. */
export function StatusBadge({ status }: { status: string }) {
  const tone: BadgeTone =
    status === "pending"
      ? "pending"
      : status === "confirmed"
        ? "confirmed"
        : "blocked";

  return <Badge tone={tone}>{capitalise(status)}</Badge>;
}

/** Payment status badge: unpaid | paid. */
export function PaymentBadge({ status }: { status: string }) {
  const tone: BadgeTone = status === "paid" ? "paid" : "unpaid";
  return <Badge tone={tone}>{capitalise(status)}</Badge>;
}

/** Service status badge: active | inactive. */
export function ServiceStatusBadge({ status }: { status: string }) {
  const tone: BadgeTone = status === "active" ? "confirmed" : "unpaid";
  return <Badge tone={tone}>{capitalise(status)}</Badge>;
}

/** User status badge used on the admin users table. */
export function BlockedBadge({ isBlocked }: { isBlocked: boolean }) {
  return (
    <Badge tone={isBlocked ? "blocked" : "confirmed"}>
      {isBlocked ? "Blocked" : "Active"}
    </Badge>
  );
}

function capitalise(value: string): string {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
