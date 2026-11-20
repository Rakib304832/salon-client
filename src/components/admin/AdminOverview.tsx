"use client";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Scissors,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button, ErrorState, PaymentBadge, Skeleton, StatusBadge, buttonStyles } from "@/components/ui";
import { useAdminStats } from "@/hooks/useAdminStats";
import { appointmentServiceName } from "@/lib/appointments";
import { ROUTES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Appointment } from "@/types";

/**
 * ADMIN DASHBOARD OVERVIEW
 * ------------------------
 * A single GET /api/admin/stats request feeds this page. The server calculates
 * every count from MongoDB and every payment value from webhook-created
 * transactions, so this component never recomputes business numbers from a
 * partial list. That distinction matters once lists become paginated.
 *
 * The page is organised around the administrator's likely questions:
 * 1. How large is the salon's account/service catalogue?
 * 2. How many requests are waiting or confirmed?
 * 3. How much revenue has Stripe actually confirmed?
 * 4. Which services and newest requests need attention?
 */
interface StatCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: typeof Users;
}

function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-plum">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush-light text-plum">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">{hint}</p>
    </div>
  );
}

export function AdminOverview() {
  const { stats, error, loading, reload } = useAdminStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-72" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-36 w-full rounded-card" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-80 w-full rounded-card" />
          <Skeleton className="h-80 w-full rounded-card" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <ErrorState
        title="Could not load admin statistics"
        message={error ?? "The dashboard response was empty."}
        onRetry={reload}
      />
    );
  }

  const { counts, revenue, popularServices, recentAppointments } = stats;

  // Stripe reports "usd" in this project. If another currency is ever returned,
  // the per-currency breakdown below still exposes it accurately.
  const primaryCurrency = revenue.byCurrency[0]?.currency?.toUpperCase() ?? "USD";

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-rose-gold">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            Salon operations
          </p>
          <h1 className="mt-2 text-3xl">Admin overview</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Live counts from the database and confirmed revenue from verified
            Stripe webhooks. Refresh whenever you need a current snapshot.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reload}>
          Refresh stats
        </Button>
      </section>

      <section aria-label="Salon statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Customers"
          value={counts.customers}
          hint={`${counts.users} total accounts, including admins`}
          icon={Users}
        />
        <StatCard
          label="Active services"
          value={counts.activeServices}
          hint={`${counts.services} services in the catalogue`}
          icon={Scissors}
        />
        <StatCard
          label="Pending requests"
          value={counts.pendingAppointments}
          hint={`${counts.confirmedAppointments} confirmed appointments`}
          icon={Clock3}
        />
        <StatCard
          label="Paid appointments"
          value={counts.paidAppointments}
          hint={`${counts.paidTransactions} paid Stripe transactions`}
          icon={CheckCircle2}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-line bg-gradient-to-br from-plum to-plum-dark p-6 text-white sm:col-span-2">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blush">
            <TrendingUp aria-hidden="true" className="h-4 w-4" />
            Confirmed revenue
          </p>
          <p className="mt-3 font-display text-4xl font-semibold text-white">
            {formatCurrency(revenue.total / 100, primaryCurrency)}
          </p>
          <p className="mt-2 max-w-lg text-xs leading-5 text-blush">
            Calculated only from paid transactions created by the verified
            Stripe webhook. Pending Checkout sessions are never counted.
          </p>
          {revenue.byCurrency.length > 1 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {revenue.byCurrency.map((entry) => (
                <span
                  key={entry.currency}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white"
                >
                  {entry.currency.toUpperCase()}: {formatCurrency(entry.amount / 100, entry.currency.toUpperCase())}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-card border border-line bg-white p-6 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <CreditCard aria-hidden="true" className="h-4 w-4 text-rose-gold" />
            Payment health
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted">Paid transactions</span>
              <span className="font-bold text-plum">{counts.paidTransactions}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Failed transactions</span>
              <span className="font-bold text-plum">{counts.failedTransactions}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-line pt-3">
              <span className="text-muted">Cancelled requests</span>
              <span className="font-bold text-plum">{counts.cancelledAppointments}</span>
            </div>
          </div>
          <Link
            href={ROUTES.adminServices}
            className={buttonStyles({ variant: "outline", size: "sm", className: "mt-5" })}
          >
            Manage services
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-card border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl">Newest appointments</h2>
              <p className="mt-1 text-sm text-muted">
                The five most recent requests across all customers.
              </p>
            </div>
            <CalendarDays aria-hidden="true" className="h-5 w-5 text-rose-gold" />
          </div>

          {recentAppointments.length === 0 ? (
            <p className="mt-8 rounded-card border border-dashed border-line bg-ivory p-6 text-center text-sm text-muted">
              No appointments have been requested yet.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {recentAppointments.map((appointment) => (
                <RecentAppointmentRow key={appointment._id} appointment={appointment} />
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-card border border-line bg-white p-6 shadow-sm">
          <h2 className="text-xl">Most booked services</h2>
          <p className="mt-1 text-sm text-muted">
            Non-cancelled appointments, highest first.
          </p>

          {popularServices.length === 0 ? (
            <p className="mt-8 rounded-card border border-dashed border-line bg-ivory p-6 text-center text-sm text-muted">
              Booking popularity appears after the first request.
            </p>
          ) : (
            <ul className="mt-5 space-y-4">
              {popularServices.map((service) => {
                const max = popularServices[0]?.bookings || 1;
                const percentage = Math.round((service.bookings / max) * 100);

                return (
                  <li key={service.serviceId}>
                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                      <span className="font-bold text-plum">{service.serviceName}</span>
                      <span className="text-muted">{service.bookings} bookings</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-blush-light">
                      <div
                        className="h-full rounded-full bg-rose-gold"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function RecentAppointmentRow({ appointment }: { appointment: Appointment }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-plum">
          {appointmentServiceName(appointment)}
        </p>
        <p className="mt-1 text-xs text-muted">
          {formatDate(appointment.appointmentDate)} · {appointment.timeSlot}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={appointment.status} />
        <PaymentBadge status={appointment.paymentStatus} />
      </div>
    </li>
  );
}
