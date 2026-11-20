"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import {
  CopyButton,
  ErrorState,
  PaymentBadge,
  Spinner,
  StatusBadge,
  buttonStyles,
} from "@/components/ui";
import { ApiError, paymentsApi } from "@/lib/api";
import { API_ERROR_CODES, ROUTES } from "@/lib/constants";
import { formatCurrency, formatDate, shortenSessionId } from "@/lib/utils";
import type { PaymentSessionResponse } from "@/types";
import { PaymentPageFrame } from "./PaymentPageFrame";

/**
 * PAYMENT SUCCESS PAGE
 * --------------------
 * Stripe sends the browser back with `?session_id=cs_test_...`. That identifier
 * is proof of nothing by itself: the transaction and appointment are created by
 * the server's verified webhook. This page therefore ONLY READS status from
 * GET /api/payments/session/:sessionId; it never patches anything client-side.
 *
 * Webhook delivery can lag behind the redirect, so a 404 with code
 * PAYMENT_NOT_CONFIRMED is retried every 2.5 seconds up to ten times (~25s).
 * Every response is tied to the request key that started the poll, preventing
 * an older retry from overwriting a newer one after the user clicks Check again.
 */
const SESSION_ID_PATTERN = /^cs_(test|live)_[A-Za-z0-9_]+$/;
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 2500;

type PaymentStatus = "loading" | "waiting" | "confirmed" | "error" | "exhausted";

interface PaymentState {
  key: string;
  status: PaymentStatus;
  data: PaymentSessionResponse | null;
  error: string | null;
  attempt: number;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    // setTimeout is safe here: it is not part of the Code Mode tool runtime.
    // The cleanup flag in the effect prevents state writes after unmount.
    globalThis.setTimeout(resolve, milliseconds);
  });
}

export function PaymentSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id")?.trim() ?? "";
  const hasValidSessionId = SESSION_ID_PATTERN.test(sessionId);

  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<PaymentState | null>(null);

  const requestKey = `${sessionId}\u0000${reloadCount}`;
  const current = state?.key === requestKey ? state : null;
  const status: PaymentStatus = current?.status ?? "loading";
  const data = current?.data ?? null;
  const attempt = current?.attempt ?? 0;

  useEffect(() => {
    if (!hasValidSessionId) return;

    let active = true;

    async function poll() {
      for (let index = 1; index <= MAX_POLL_ATTEMPTS; index += 1) {
        try {
          const result = await paymentsApi.getSession(sessionId);
          if (!active) return;

          if (!result.confirmed) {
            setState({
              key: requestKey,
              status: "error",
              data: result,
              error:
                "Stripe has not confirmed this payment yet. Please check again shortly.",
              attempt: index,
            });
            return;
          }

          setState({
            key: requestKey,
            status: "confirmed",
            data: result,
            error: null,
            attempt: index,
          });
          return;
        } catch (caught) {
          if (!active) return;

          const isWebhookStillPending =
            caught instanceof ApiError &&
            caught.code === API_ERROR_CODES.PAYMENT_NOT_CONFIRMED;

          if (isWebhookStillPending && index < MAX_POLL_ATTEMPTS) {
            setState({
              key: requestKey,
              status: "waiting",
              data: null,
              error: null,
              attempt: index,
            });

            await wait(POLL_INTERVAL_MS);
            if (!active) return;
            continue;
          }

          setState({
            key: requestKey,
            status: isWebhookStillPending ? "exhausted" : "error",
            data: null,
            error:
              caught instanceof Error && caught.message
                ? caught.message
                : "We could not verify this payment.",
            attempt: index,
          });
          return;
        }
      }
    }

    void poll();

    return () => {
      active = false;
    };
  }, [hasValidSessionId, requestKey, sessionId]);

  function retry() {
    setReloadCount((count) => count + 1);
  }

  if (!hasValidSessionId) {
    return (
      <PaymentPageFrame>
        <ErrorState
          title="Missing payment reference"
          message="This page needs a valid Stripe session identifier. Open it from the Pay now button in your appointments."
        />
        <div className="mt-6 text-center">
          <Link
            href={ROUTES.customerAppointments}
            className={buttonStyles({ variant: "outline" })}
          >
            Back to appointments
          </Link>
        </div>
      </PaymentPageFrame>
    );
  }

  if (status === "error" || status === "exhausted") {
    return (
      <PaymentPageFrame>
        <ErrorState
          title={
            status === "exhausted"
              ? "Payment is still being confirmed"
              : "We could not confirm this payment"
          }
          message={
            status === "exhausted"
              ? `Stripe has not sent the final confirmation after ${MAX_POLL_ATTEMPTS} checks. Your bank may still show a pending charge. Check again in a moment.`
              : current?.error ?? "Please check your appointments for the latest status."
          }
          onRetry={retry}
          retryLabel="Check again"
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

  if (status === "confirmed" && data) {
    const transaction = data.transaction;
    const appointment = data.appointment;

    return (
      <PaymentPageFrame>
        <section className="rounded-card border border-line bg-white p-6 text-center shadow-sm sm:p-9">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-confirmed-bg text-status-confirmed-text">
            <CheckCircle2 aria-hidden="true" className="h-9 w-9" />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-rose-gold">
            Payment confirmed
          </p>
          <h1 className="mt-2 text-3xl">You&apos;re all set</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            The salon has received your payment. Your appointment details are
            below and are also available in your dashboard.
          </p>

          <dl className="mt-7 space-y-3 border-t border-line pt-6 text-left text-sm">
            <SummaryRow label="Service" value={appointment?.serviceName ?? "Salon appointment"} />
            <SummaryRow
              label="Date"
              value={
                appointment ? formatDate(appointment.appointmentDate) : "—"
              }
            />
            <SummaryRow label="Time" value={appointment?.timeSlot ?? "—"} />
            <SummaryRow
              label="Amount paid"
              value={
                transaction
                  ? formatCurrency(
                      transaction.amount / 100,
                      transaction.currency.toUpperCase(),
                    )
                  : "—"
              }
            />
            <SummaryRow
              label="Session"
              value={
                <span className="inline-flex items-center gap-1">
                  {shortenSessionId(data.sessionId)}
                  <CopyButton value={data.sessionId} />
                </span>
              }
            />
            <SummaryRow
              label="Status"
              value={
                <span className="inline-flex flex-wrap gap-2">
                  {appointment ? <StatusBadge status={appointment.status} /> : null}
                  {appointment ? (
                    <PaymentBadge status={appointment.paymentStatus} />
                  ) : null}
                </span>
              }
            />
          </dl>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={ROUTES.customerAppointments}
              className={buttonStyles({ variant: "primary" })}
            >
              View my appointments
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.services}
              className={buttonStyles({ variant: "outline" })}
            >
              Browse services
            </Link>
          </div>
        </section>
      </PaymentPageFrame>
    );
  }

  return (
    <PaymentPageFrame>
      <section className="rounded-card border border-line bg-white px-6 py-14 text-center shadow-sm">
        {status === "loading" ? (
          <Spinner size="lg" label="Verifying payment" />
        ) : (
          <RefreshCw aria-hidden="true" className="mx-auto h-9 w-9 animate-pulse text-rose-gold" />
        )}

        <h1 className="mt-6 text-2xl">
          {status === "loading" ? "Verifying your payment" : "Waiting for confirmation"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          Stripe is sending the final confirmation to the salon. This page
          checks the server automatically — please keep it open for a moment.
        </p>

        <div className="mx-auto mt-6 flex max-w-sm flex-wrap justify-center gap-2 text-xs font-bold text-plum">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blush-light px-3 py-1.5">
            <CreditCard aria-hidden="true" className="h-3.5 w-3.5" />
            Check {Math.max(attempt, 1)} of {MAX_POLL_ATTEMPTS}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blush-light px-3 py-1.5">
            <Clock aria-hidden="true" className="h-3.5 w-3.5" />
            Every {POLL_INTERVAL_MS / 1000}s
          </span>
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted">
          <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
          No action is needed from you right now.
        </p>
      </section>
    </PaymentPageFrame>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 last:border-0 last:pb-0">
      <dt className="font-bold text-muted">{label}</dt>
      <dd className="text-right text-plum">{value}</dd>
    </div>
  );
}
