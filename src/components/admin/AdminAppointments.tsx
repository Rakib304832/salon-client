"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  Eye,
  RotateCw,
  XCircle,
} from "lucide-react";
import { appointmentCustomer, appointmentCustomerName, appointmentService, appointmentServiceName } from "@/lib/appointments";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  PaymentBadge,
  Select,
  StatusBadge,
  Skeleton,
} from "@/components/ui";
import { useAdminResource } from "@/hooks/useAdminResource";
import { appointmentsApi } from "@/lib/api";
import {
  APPOINTMENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { formatCurrency, formatDate, formatDuration } from "@/lib/utils";
import type {
  Appointment,
  AppointmentStatus,
  PaymentStatus,
} from "@/types";

/**
 * ADMIN APPOINTMENT MANAGEMENT
 * ----------------------------
 * Admins see every customer's requests and may:
 * - confirm a PENDING request
 * - cancel a PENDING or CONFIRMED request
 *
 * They cannot set an appointment back to pending, and a cancelled request is
 * final. Those rules are enforced again by PATCH /api/admin/appointments/:id/status.
 * Payment state is never edited here: `paid` can only be created by the verified
 * Stripe webhook. Cancelling a paid appointment leaves its transaction record
 * intact because refunds are handled outside this API.
 *
 * Status, payment state and date filters are sent to Express. The endpoint
 * validates them, so the UI only offers values the server accepts.
 */
interface AppointmentFilters {
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  appointmentDate?: string;
  // Allows the object to be passed straight to appointmentsApi.adminList.
  [key: string]: string | number | boolean | null | undefined;
}

interface BusyAction {
  id: string;
  kind: "confirm" | "cancel";
}

const EMPTY_FILTERS: AppointmentFilters = {
  status: undefined,
  paymentStatus: undefined,
  appointmentDate: undefined,
};

export function AdminAppointments() {
  const [draft, setDraft] = useState<AppointmentFilters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<AppointmentFilters>(EMPTY_FILTERS);
  const [detailsTarget, setDetailsTarget] = useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [busy, setBusy] = useState<BusyAction | null>(null);

  const load = useCallback(
    () => appointmentsApi.adminList(filters),
    [filters],
  );
  const filterKey = JSON.stringify(filters);

  const {
    items,
    error,
    loading,
    reload,
    replaceItem,
  } = useAdminResource<Appointment>(load, filterKey, "We could not load appointments.");

  const counts = useMemo(() => {
    const list = items ?? [];
    return {
      all: list.length,
      pending: list.filter((item) => item.status === "pending").length,
      confirmed: list.filter((item) => item.status === "confirmed").length,
      cancelled: list.filter((item) => item.status === "cancelled").length,
    };
  }, [items]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({
      status: draft.status,
      paymentStatus: draft.paymentStatus,
      appointmentDate: draft.appointmentDate,
    });
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  }

  async function handleConfirm(appointment: Appointment) {
    setBusy({ id: appointment._id, kind: "confirm" });

    try {
      const updated = await appointmentsApi.adminSetStatus(
        appointment._id,
        "confirmed",
      );
      replaceItem(updated);
      setDetailsTarget((current) =>
        current?._id === updated._id ? updated : current,
      );
      toastSuccess("Appointment confirmed", "The customer can now complete payment.");
    } catch (caught) {
      toastApiError(caught, "Could not confirm this appointment.");
    } finally {
      setBusy(null);
    }
  }

  async function confirmCancel() {
    if (!cancelTarget) return;

    const target = cancelTarget;
    setBusy({ id: target._id, kind: "cancel" });

    try {
      const updated = await appointmentsApi.adminSetStatus(
        target._id,
        "cancelled",
      );
      replaceItem(updated);
      setDetailsTarget((current) =>
        current?._id === updated._id ? updated : current,
      );
      setCancelTarget(null);
      toastSuccess("Appointment cancelled", "The booking is now closed.");
    } catch (caught) {
      toastApiError(caught, "Could not cancel this appointment.");
    } finally {
      setBusy(null);
    }
  }

  function isBusy(id: string, kind: BusyAction["kind"]): boolean {
    return busy?.id === id && busy.kind === kind;
  }

  const detailsService = detailsTarget ? appointmentService(detailsTarget) : null;
  const detailsCustomer = detailsTarget ? appointmentCustomer(detailsTarget) : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-24 w-full rounded-card" />
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-16 w-full rounded-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load appointments"
        message={error}
        onRetry={reload}
      />
    );
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Appointments</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Review requests from every customer, confirm bookings, and close
            appointments that can no longer go ahead.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RotateCw aria-hidden="true" className="h-3.5 w-3.5" />}
          onClick={reload}
        >
          Refresh
        </Button>
      </section>

      <section className="grid gap-3 sm:grid-cols-4">
        <CountCard label="Showing" value={counts.all} />
        <CountCard label="Pending" value={counts.pending} />
        <CountCard label="Confirmed" value={counts.confirmed} />
        <CountCard label="Cancelled" value={counts.cancelled} />
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-sm">
        <form onSubmit={applyFilters} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <Select
            label="Status"
            value={draft.status ?? ""}
            onChange={(event) =>
              setDraft({
                ...draft,
                status: event.target.value
                  ? (event.target.value as AppointmentStatus)
                  : undefined,
              })
            }
            options={Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            placeholder="All statuses"
          />

          <Select
            label="Payment"
            value={draft.paymentStatus ?? ""}
            onChange={(event) =>
              setDraft({
                ...draft,
                paymentStatus: event.target.value
                  ? (event.target.value as PaymentStatus)
                  : undefined,
              })
            }
            options={Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            placeholder="All payments"
          />

          <Input
            label="Appointment date"
            type="date"
            value={draft.appointmentDate ?? ""}
            onChange={(event) =>
              setDraft({ ...draft, appointmentDate: event.target.value })
            }
          />

          <div className="flex gap-2">
            <Button type="submit" variant="primary">Apply</Button>
            <Button type="button" variant="ghost" onClick={resetFilters}>Clear</Button>
          </div>
        </form>
      </section>

      {!items || items.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description="No bookings match these filters yet. Clear them to see the full history."
          action={
            <Button variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
          }
          icon={<CalendarDays aria-hidden="true" className="h-6 w-6" />}
        />
      ) : (
        <div className="overflow-hidden rounded-card border border-line bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <caption className="sr-only">
                All salon appointments with customer, schedule, status, payment and actions.
              </caption>
              <thead className="bg-blush-light text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-bold">Customer</th>
                  <th scope="col" className="px-5 py-3 font-bold">Service</th>
                  <th scope="col" className="px-5 py-3 font-bold">Schedule</th>
                  <th scope="col" className="px-5 py-3 font-bold">Price</th>
                  <th scope="col" className="px-5 py-3 font-bold">Status</th>
                  <th scope="col" className="px-5 py-3 font-bold">Payment</th>
                  <th scope="col" className="px-5 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="px-5 py-4">
                      <p className="font-bold text-plum">
                        {appointmentCustomerName(appointment)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        Requested {formatDate(appointment.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {appointmentServiceName(appointment)}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-plum">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {appointment.timeSlot}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-bold text-plum">
                      {formatCurrency(appointment.servicePrice)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="px-5 py-4">
                      <PaymentBadge status={appointment.paymentStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailsTarget(appointment)}
                        >
                          <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                          Details
                        </Button>

                        {appointment.status === "pending" ? (
                          <Button
                            variant="accent"
                            size="sm"
                            loading={isBusy(appointment._id, "confirm")}
                            disabled={busy !== null}
                            onClick={() => void handleConfirm(appointment)}
                          >
                            <Check aria-hidden="true" className="h-3.5 w-3.5" />
                            Confirm
                          </Button>
                        ) : null}

                        {appointment.status !== "cancelled" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#B24A4A] hover:bg-[#FCEDED]"
                            disabled={busy !== null}
                            onClick={() => setCancelTarget(appointment)}
                          >
                            <XCircle aria-hidden="true" className="h-3.5 w-3.5" />
                            Cancel
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={detailsTarget !== null}
        onClose={() => setDetailsTarget(null)}
        title="Appointment details"
        description="Customer and booking information from the server."
        size="md"
      >
        {detailsTarget ? (
          <div className="space-y-5 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Customer" value={appointmentCustomerName(detailsTarget)} />
              <DetailItem label="Email" value={detailsCustomer?.email ?? "Not available"} />
              <DetailItem label="Service" value={appointmentServiceName(detailsTarget)} />
              <DetailItem
                label="Duration"
                value={detailsService ? formatDuration(detailsService.duration) : "—"}
              />
              <DetailItem label="Date" value={formatDate(detailsTarget.appointmentDate)} />
              <DetailItem label="Time" value={detailsTarget.timeSlot} />
              <DetailItem
                label="Saved price"
                value={formatCurrency(detailsTarget.servicePrice)}
              />
              <DetailItem label="Requested" value={formatDate(detailsTarget.createdAt)} />
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status={detailsTarget.status} />
              <PaymentBadge status={detailsTarget.paymentStatus} />
            </div>

            {detailsTarget.message ? (
              <div className="rounded-xl border border-line bg-blush-light/50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Customer note
                </p>
                <p className="mt-2 leading-6 text-text">{detailsTarget.message}</p>
              </div>
            ) : null}

            {detailsTarget.status === "pending" ? (
              <div className="flex justify-end border-t border-line pt-4">
                <Button
                  variant="accent"
                  loading={isBusy(detailsTarget._id, "confirm")}
                  disabled={busy !== null}
                  onClick={() => void handleConfirm(detailsTarget)}
                >
                  Confirm appointment
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => void confirmCancel()}
        title="Cancel this appointment?"
        description={
          cancelTarget
            ? `${appointmentCustomerName(cancelTarget)}'s ${appointmentServiceName(cancelTarget)} booking on ${formatDate(cancelTarget.appointmentDate)} will be closed. Payment records remain unchanged.`
            : ""
        }
        confirmLabel="Cancel appointment"
        loading={busy?.kind === "cancel"}
      />
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-line bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-plum">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ivory px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 font-bold text-plum">{value}</p>
    </div>
  );
}
