"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarX2,
  CreditCard,
  Eye,
  RotateCw,
  XCircle,
} from "lucide-react";
import { AppointmentSummaryCard } from "@/components/customer/AppointmentSummaryCard";
import { Button, ConfirmDialog, EmptyState, ErrorState, Modal, Skeleton, buttonStyles } from "@/components/ui";
import { useCustomerAppointments } from "@/hooks/useCustomerAppointments";
import {
  appointmentService,
  appointmentServiceName,
  canCustomerCancel,
  canCustomerPay,
} from "@/lib/appointments";
import { appointmentsApi } from "@/lib/api";
import { startCheckout } from "@/lib/checkout";
import { APPOINTMENT_STATUS_LABELS, ROUTES } from "@/lib/constants";
import { toastApiError, toastInfo, toastSuccess } from "@/lib/toast";
import { formatCurrency, formatDate, formatDuration } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/types";

/**
 * CUSTOMER APPOINTMENTS
 * ---------------------
 * The customer's full booking history. Two rules from the Express API shape
 * every action on this screen:
 *
 * 1. A customer may cancel only a Pending, unpaid appointment.
 * 2. A customer may pay only a Confirmed, unpaid appointment.
 *
 * Buttons are hidden unless those predicates are true, but that is only good
 * UX — the API repeats both checks against the database. Payment amounts are
 * never edited here; clicking Pay asks the server to create a Stripe session
 * and then leaves this site.
 *
 * Filtering is client-side because GET /api/appointments/mine already returns
 * the customer's complete history. Keeping filter state in memory (rather than
 * the URL) is intentional: these tabs are a view preference, not shareable
 * search state like the public /services filters.
 */
type StatusFilter = "all" | AppointmentStatus;

interface BusyAction {
  id: string;
  kind: "cancel" | "pay";
}

export function CustomerAppointments() {
  const {
    appointments,
    error,
    loading,
    reload,
    replaceAppointment,
  } = useCustomerAppointments();

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Appointment | null>(null);
  const [busy, setBusy] = useState<BusyAction | null>(null);

  const counts = useMemo(() => {
    const list = appointments ?? [];
    return {
      all: list.length,
      pending: list.filter((item) => item.status === "pending").length,
      confirmed: list.filter((item) => item.status === "confirmed").length,
      cancelled: list.filter((item) => item.status === "cancelled").length,
    } satisfies Record<StatusFilter, number>;
  }, [appointments]);

  const visible = useMemo(() => {
    if (!appointments) return [];
    if (filter === "all") return appointments;
    return appointments.filter((item) => item.status === filter);
  }, [appointments, filter]);

  // Computed once so the details dialog never needs a non-null assertion.
  const detailService = detailsTarget ? appointmentService(detailsTarget) : null;

  const tabs: Array<{ value: StatusFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "pending", label: APPOINTMENT_STATUS_LABELS.pending },
    { value: "confirmed", label: APPOINTMENT_STATUS_LABELS.confirmed },
    { value: "cancelled", label: APPOINTMENT_STATUS_LABELS.cancelled },
  ];

  async function confirmCancel() {
    if (!cancelTarget) return;

    const target = cancelTarget;
    setBusy({ id: target._id, kind: "cancel" });

    try {
      const updated = await appointmentsApi.cancel(target._id);
      replaceAppointment(updated);
      setCancelTarget(null);
      setDetailsTarget(null);
      toastSuccess("Appointment cancelled", "The time slot is available again.");
    } catch (caught) {
      toastApiError(caught, "Could not cancel this appointment.");
    } finally {
      setBusy(null);
    }
  }

  async function handlePay(appointment: Appointment) {
    setBusy({ id: appointment._id, kind: "pay" });
    toastInfo("Opening secure checkout", "You will return here after payment.");

    try {
      // startCheckout performs a full-page redirect; no code after this resolves
      // will normally run because the browser navigates to Stripe.
      await startCheckout(appointment._id);
    } catch (caught) {
      toastApiError(caught, "Could not start payment. Please try again.");
      setBusy(null);
    }
  }

  function isBusy(appointment: Appointment, kind: BusyAction["kind"]): boolean {
    return busy?.id === appointment._id && busy.kind === kind;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full rounded-card" />
        <div className="space-y-4">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-56 w-full rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load your appointments"
        message={error}
        onRetry={reload}
      />
    );
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">My appointments</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Every request is listed here. Pending requests can be cancelled;
            confirmed requests can be paid securely through Stripe.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reload}>
          <RotateCw aria-hidden="true" className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </section>

      <section
        aria-label="Filter appointments by status"
        className="flex flex-wrap gap-2 rounded-card border border-line bg-white p-2"
      >
        {tabs.map((tab) => {
          const active = filter === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              aria-pressed={active}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold ${
                active
                  ? "bg-plum text-white"
                  : "bg-blush-light text-plum hover:bg-blush"
              }`}
            >
              {tab.label}
              <span className={active ? "ml-2 text-blush" : "ml-2 text-muted"}>
                {counts[tab.value]}
              </span>
            </button>
          );
        })}
      </section>

      {visible.length === 0 ? (
        <EmptyState
          title={
            filter === "all"
              ? "No appointments yet"
              : `No ${APPOINTMENT_STATUS_LABELS[filter].toLowerCase()} appointments`
          }
          description={
            filter === "all"
              ? "Browse the salon menu and request your first visit."
              : "Try another status tab to see the rest of your history."
          }
          action={
            filter === "all" ? (
              <Link
                href={ROUTES.services}
                className={buttonStyles({ variant: "primary" })}
              >
                Browse services
              </Link>
            ) : (
              <Button variant="outline" onClick={() => setFilter("all")}>
                Show all requests
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map((appointment) => {
            const cancellable = canCustomerCancel(appointment);
            const payable = canCustomerPay(appointment);

            return (
              <AppointmentSummaryCard
                key={appointment._id}
                appointment={appointment}
                actions={
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailsTarget(appointment)}
                    >
                      <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                      Details
                    </Button>

                    {payable ? (
                      <Button
                        type="button"
                        variant="accent"
                        size="sm"
                        loading={isBusy(appointment, "pay")}
                        onClick={() => void handlePay(appointment)}
                      >
                        <CreditCard aria-hidden="true" className="h-3.5 w-3.5" />
                        Pay now
                      </Button>
                    ) : null}

                    {cancellable ? (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        loading={isBusy(appointment, "cancel")}
                        onClick={() => setCancelTarget(appointment)}
                      >
                        <CalendarX2 aria-hidden="true" className="h-3.5 w-3.5" />
                        Cancel request
                      </Button>
                    ) : null}

                    {!payable && !cancellable ? (
                      <span className="self-center text-xs text-muted">
                        {appointment.status === "cancelled"
                          ? "This request is closed."
                          : appointment.paymentStatus === "paid"
                            ? "This appointment is paid."
                            : "Waiting for salon confirmation."}
                      </span>
                    ) : null}
                  </>
                }
              />
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => void confirmCancel()}
        title="Cancel this appointment request?"
        description={
          cancelTarget
            ? `${appointmentServiceName(cancelTarget)} on ${formatDate(cancelTarget.appointmentDate)} at ${cancelTarget.timeSlot}. The salon will not be notified separately, and the slot becomes available again immediately.`
            : ""
        }
        confirmLabel="Yes, cancel it"
        cancelLabel="Keep request"
        variant="danger"
        loading={Boolean(cancelTarget && isBusy(cancelTarget, "cancel"))}
      />

      <Modal
        open={Boolean(detailsTarget)}
        onClose={() => setDetailsTarget(null)}
        title="Appointment details"
        description="A read-only summary of what was requested."
        size="sm"
        footer={
          <Button variant="outline" size="sm" onClick={() => setDetailsTarget(null)}>
            Close
          </Button>
        }
      >
        {detailsTarget ? (
          <dl className="space-y-3 text-sm">
            <DetailRow label="Service" value={appointmentServiceName(detailsTarget)} />
            <DetailRow label="Date" value={formatDate(detailsTarget.appointmentDate)} />
            <DetailRow label="Time" value={detailsTarget.timeSlot} />
            <DetailRow
              label="Duration"
              value={detailService ? formatDuration(detailService.duration) : "—"}
            />
            <DetailRow label="Price" value={formatCurrency(detailsTarget.servicePrice)} />
            <DetailRow
              label="Requested"
              value={formatDate(detailsTarget.createdAt)}
            />
            <DetailRow
              label="Salon note"
              value={detailsTarget.message || "No note was added."}
            />
          </dl>
        ) : null}
      </Modal>

      <p className="flex items-center gap-2 text-xs text-muted">
        <XCircle aria-hidden="true" className="h-3.5 w-3.5" />
        Need to change a confirmed appointment? Contact the salon directly.
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-2 last:border-0 last:pb-0">
      <dt className="font-bold text-muted">{label}</dt>
      <dd className="max-w-[65%] text-right text-plum">{value}</dd>
    </div>
  );
}
