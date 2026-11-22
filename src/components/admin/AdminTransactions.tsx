"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import {
  CreditCard,
  ReceiptText,
  RotateCw,
  TrendingUp,
} from "lucide-react";
import {
  Badge,
  Button,
  CopyButton,
  EmptyState,
  ErrorState,
  Select,
  Skeleton,
} from "@/components/ui";
import { useAdminResource } from "@/hooks/useAdminResource";
import { transactionsApi } from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  shortenSessionId,
} from "@/lib/utils";
import type { Transaction, TransactionStatus } from "@/types";

/**
 * ADMIN TRANSACTION HISTORY
 * -------------------------
 * Transactions are written only by the verified Stripe webhook on Express. This
 * page is deliberately read-only: there is no create, edit, refund or delete
 * control anywhere in the client.
 *
 * The most important display rule is that `amount` arrives in the smallest
 * currency unit (cents for USD). Every visible value divides by 100. The summary
 * card only totals PAID records so failed checkout attempts cannot inflate
 * revenue.
 */
interface TransactionFilters {
  status?: TransactionStatus;
  // Allows the object to be passed straight to transactionsApi.adminList.
  [key: string]: string | number | boolean | null | undefined;
}

const EMPTY_FILTERS: TransactionFilters = {
  status: undefined,
};

export function AdminTransactions() {
  const [draft, setDraft] = useState<TransactionFilters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS);

  const load = useCallback(
    () => transactionsApi.adminList(filters),
    [filters],
  );
  const filterKey = JSON.stringify(filters);

  const {
    items,
    error,
    loading,
    reload,
  } = useAdminResource<Transaction>(load, filterKey, "We could not load transactions.");

  const summary = useMemo(() => {
    const list = items ?? [];
    const paid = list.filter((item) => item.status === "paid");

    // Stripe amounts are integers in cents. Sum first, then divide once to avoid
    // floating-point drift from dividing every individual row.
    const totalCents = paid.reduce((sum, item) => sum + item.amount, 0);

    return {
      total: totalCents / 100,
      currency: paid[0]?.currency?.toUpperCase() || "USD",
      paid: paid.length,
      failed: list.filter((item) => item.status === "failed").length,
    };
  }, [items]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters(draft);
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-20 w-full rounded-card" />
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-14 w-full rounded-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load transactions"
        message={error}
        onRetry={reload}
      />
    );
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Transactions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Payment records created by Stripe webhooks. Amounts are shown in
            major currency units and cannot be edited from this client.
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

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-line bg-gradient-to-br from-plum to-plum-dark p-5 text-white shadow-sm">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blush">
            <TrendingUp aria-hidden="true" className="h-4 w-4" />
            Paid in this list
          </p>
          <p className="mt-3 font-display text-3xl font-semibold">
            {formatCurrency(summary.total, summary.currency)}
          </p>
        </div>
        <div className="rounded-card border border-line bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            Paid records
          </p>
          <p className="mt-3 text-3xl font-bold text-plum">{summary.paid}</p>
        </div>
        <div className="rounded-card border border-line bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            Failed records
          </p>
          <p className="mt-3 text-3xl font-bold text-plum">{summary.failed}</p>
        </div>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-sm">
        <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-64">
            <Select
              label="Payment status"
              value={draft.status ?? ""}
              onChange={(event) =>
                setDraft({
                  status: event.target.value
                    ? (event.target.value as TransactionStatus)
                    : undefined,
                })
              }
              options={[
                { value: "paid", label: "Paid" },
                { value: "failed", label: "Failed" },
              ]}
              placeholder="All statuses"
            />
          </div>
          <Button type="submit" variant="primary">Apply</Button>
          <Button type="button" variant="ghost" onClick={resetFilters}>Clear</Button>
        </form>
      </section>

      {!items || items.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="Paid and failed Stripe sessions will appear here after checkout activity."
          action={
            <Button variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
          }
          icon={<ReceiptText aria-hidden="true" className="h-6 w-6" />}
        />
      ) : (
        <>
          {/* Desktop keeps the dense seven-column table. Mobile cards expose the
              same read-only payment facts without requiring horizontal scroll. */}
          <div className="hidden overflow-hidden rounded-card border border-line bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <caption className="sr-only">
                  Stripe transactions with customer, service, amount and confirmation status.
                </caption>
                <thead className="bg-blush-light text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-bold">Date</th>
                    <th scope="col" className="px-5 py-3 font-bold">Customer</th>
                    <th scope="col" className="px-5 py-3 font-bold">Service</th>
                    <th scope="col" className="px-5 py-3 font-bold">Appointment</th>
                    <th scope="col" className="px-5 py-3 font-bold">Session</th>
                    <th scope="col" className="px-5 py-3 font-bold">Amount</th>
                    <th scope="col" className="px-5 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-5 py-4 text-muted">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-plum">
                          {transaction.customerInfo?.name || "Unknown customer"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {transaction.customerInfo?.email || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {transaction.serviceInfo?.serviceName || "Service unavailable"}
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {transaction.appointmentDate
                          ? formatDate(transaction.appointmentDate)
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <code className="rounded bg-ivory px-2 py-1 text-xs text-plum">
                            {shortenSessionId(transaction.stripeSessionId)}
                          </code>
                          <CopyButton value={transaction.stripeSessionId} />
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-plum">
                        <span className="inline-flex flex-wrap items-center gap-2">
                          {formatCurrency(
                            transaction.amount / 100,
                            transaction.currency.toUpperCase(),
                          )}
                          <span className="rounded-full bg-blush-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-plum">
                            {transaction.currency.toUpperCase()}
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          tone={
                            transaction.status === "paid" ? "paid" : "blocked"
                          }
                        >
                          <CreditCard aria-hidden="true" className="h-3 w-3" />
                          {transaction.status === "paid" ? "Paid" : "Failed"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {items.map((transaction) => (
              <TransactionMobileCard
                key={transaction._id}
                transaction={transaction}
              />
            ))}
          </div>
        </>
      )}

      {/* Keeping this note visible prevents an admin from assuming a missing
          refund control is a bug. Refunds are intentionally out of scope. */}
      <p className="text-xs leading-5 text-muted">
        Refunds are processed outside SalonBook. Cancelling an appointment does
        not modify its recorded Stripe transaction.
      </p>
    </div>
  );
}

/**
 * Mobile transaction card. This screen is read-only, so the card contains no
 * action buttons: only the copied session identifier is available through the
 * same CopyButton used by the desktop table.
 */
function TransactionMobileCard({
  transaction,
}: {
  transaction: Transaction;
}) {
  const currency = transaction.currency.toUpperCase();

  return (
    <article className="rounded-card border border-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-plum">
            {transaction.customerInfo?.name || "Unknown customer"}
          </p>
          <p className="mt-0.5 break-all text-xs text-muted">
            {transaction.customerInfo?.email || "—"}
          </p>
        </div>
        <Badge tone={transaction.status === "paid" ? "paid" : "blocked"}>
          <CreditCard aria-hidden="true" className="h-3 w-3" />
          {transaction.status === "paid" ? "Paid" : "Failed"}
        </Badge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-ivory p-3 text-xs">
        <div>
          <dt className="text-muted">Date</dt>
          <dd className="mt-0.5 font-bold text-plum">
            {formatDate(transaction.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Appointment</dt>
          <dd className="mt-0.5 font-bold text-plum">
            {transaction.appointmentDate
              ? formatDate(transaction.appointmentDate)
              : "—"}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted">Service</dt>
          <dd className="mt-0.5 font-bold text-plum">
            {transaction.serviceInfo?.serviceName || "Service unavailable"}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted">Amount</dt>
          <dd className="mt-0.5 font-display text-lg font-semibold text-plum">
            <span className="inline-flex flex-wrap items-center gap-2">
              {formatCurrency(transaction.amount / 100, currency)}
              <span className="rounded-full bg-blush-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-plum">
                {currency}
              </span>
            </span>
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded bg-ivory px-2 py-1 text-xs text-plum">
          {shortenSessionId(transaction.stripeSessionId)}
        </code>
        <CopyButton value={transaction.stripeSessionId} />
      </div>
    </article>
  );
}
