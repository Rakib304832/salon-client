"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, CreditCard, XCircle } from "lucide-react";
import {
  Button,
  ErrorState,
  PaymentBadge,
  Spinner,
  StatusBadge,
  buttonStyles,
} from "@/components/ui";
import { appointmentsApi } from "@/lib/api";
import { appointmentServiceName, canCustomerPay } from "@/lib/appointments";
import { startCheckout } from "@/lib/checkout";
import { ROUTES } from "@/lib/constants";
import { toastApiError, toastInfo } from "@/lib/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Appointment } from "@/types";
import { PaymentPageFrame } from "./PaymentPageFrame";

/**
 * PAYMENT CANCEL PAGE
 * -------------------
 * Stripe's cancel_url is built by the Express server with
 * `?appointment_id=<id>`. We use that identifier only to read the appointment
 * and show a friendly confirmation that no payment was recorded.
 *
 * Nothing is mutated here. Cancelling Stripe Checkout never cancels the salon
 * appointment itself, so a confirmed, unpaid appointment can be paid again with
 * the button on this page.
 */
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

interface CancelState {
  key: string;
  appointment: Appointment | null;
  error: string | null;
}

export function PaymentCancel() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment_id")?.trim() ?? "";
  const hasValidId = OBJECT_ID_PATTERN.test(appointmentId);

  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<CancelState | null>(null);
  const [paying, setPaying] = useState(false);

  const requestKey = `${appointmentId}\u0000${reloadCount}`;
  const current = state?.key === requestKey ? state : null;
  const loading = !current || (current.appointment === null && current.error === null);

  useEffect(() => {
    if (!hasValidId) return;

    let active = true;

    appointmentsApi
      .getById(appointmentId)
      .then((appointment) => {
        if (!active) return;
        setState({ key: requestKey, appointment, error: null });
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setState({
          key: requestKey,
          appointment: null,
          error:
            caught instanceof Error && caught.message
              ? caught.message
              : "We could not load this appointment.",
        });
      });

    return () => {
      active = false;
    };
  }, [appointmentId, hasValidId, requestKey]);

  function retry() {
    setReloadCount((count) => count + 1);
  }

  async function retryPayment() {
    if (!current?.appointment) return;

    setPaying(true);
    toastInfo("Opening secure checkout", "You will return here after payment.");

    try {
      await startCheckout(current.appointment._id);
    } catch (caught) {
      toastApiError(caught, "Could not start payment. Please try again.");
      setPaying(false);
    }
  }

  if (!hasValidId) {
    return (
      <PaymentPageFrame>
        <section className="rounded-card border border-line bg-white px-6 py-12 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-pending-bg text-status-pending-text">
            <XCircle aria-hidden="true" className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl">Payment cancelled</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            You left Stripe Checkout before completing payment. No charge was
            made by this app.
          </p>
          <Link
            href={ROUTES.customerAppointments}
            className={buttonStyles({ variant: "primary", className: "mt-7" })}
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to appointments
          </Link>
        </section>
      </PaymentPageFrame>
    );
  }

  if (loading) {
    return (
      <PaymentPageFrame>
        <div className="flex flex-col items-center rounded-card border border-line bg-white px-6 py-14 shadow-sm">
          <Spinner size="lg" label="Loading appointment" />
          <p className="mt-5 text-sm text-muted">Loading your appointment…</p>
        </div>
      </PaymentPageFrame>
    );
  }

  const errorMessage = current?.error ?? null;
  if (errorMessage || !current?.appointment) {
    return (
      <PaymentPageFrame>
        <ErrorState
          title="Could not load this appointment"
          message={errorMessage ?? "We could not find the linked appointment."}
          onRetry={retry}
        />
        <p className="mt-6 text-center text-sm text-muted">
          <Link
            href={ROUTES.customerAppointments}
            className="font-bold text-plum underline-offset-4 hover:underline"
          >
            Return to my appointments
          </Link>
        </p>
      </PaymentPageFrame>
    );
  }

  const appointment = current.appointment;
  const payable = canCustomerPay(appointment);

  return (
    <PaymentPageFrame>
      <section className="rounded-card border border-line bg-white p-6 shadow-sm sm:p-8">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-status-pending-bg text-status-pending-text">
          <XCircle aria-hidden="true" className="h-7 w-7" />
        </span>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-rose-gold">
          No payment taken
        </p>
        <h1 className="mt-2 text-3xl">Checkout was cancelled</h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
          Your appointment is still saved. Leaving Stripe Checkout does not
          cancel the appointment, and it does not record a payment.
        </p>

        <dl className="mt-7 space-y-3 rounded-card border border-line bg-ivory p-5 text-sm">
          <SummaryRow label="Service" value={appointmentServiceName(appointment)} />
          <SummaryRow label="Date" value={formatDate(appointment.appointmentDate)} />
          <SummaryRow label="Time" value={appointment.timeSlot} />
          <SummaryRow
            label="Price"
            value={formatCurrency(appointment.servicePrice)}
          />
          <SummaryRow
            label="Status"
            value={
              <span className="inline-flex flex-wrap gap-2">
                <StatusBadge status={appointment.status} />
                <PaymentBadge status={appointment.paymentStatus} />
              </span>
            }
          />
        </dl>

        <div className="mt-7 flex flex-wrap gap-3">
          {payable ? (
            <Button
              type="button"
              variant="accent"
              loading={paying}
              onClick={() => void retryPayment()}
            >
              <CreditCard aria-hidden="true" className="h-4 w-4" />
              Try payment again
            </Button>
          ) : null}

          <Link
            href={ROUTES.customerAppointments}
            className={buttonStyles({ variant: "outline" })}
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to appointments
          </Link>
        </div>

        {!payable ? (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-blush-light px-4 py-3 text-xs leading-5 text-plum">
            <CalendarDays aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {appointment.status === "confirmed"
              ? "This appointment is already paid."
              : "Payment opens after the salon confirms your request."}
          </p>
        ) : (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-blush-light px-4 py-3 text-xs leading-5 text-plum">
            <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            You can retry safely; a new checkout session will be created.
          </p>
        )}
      </section>
    </PaymentPageFrame>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-2 last:border-0 last:pb-0">
      <dt className="font-bold text-muted">{label}</dt>
      <dd className="text-right text-plum">{value}</dd>
    </div>
  );
}
