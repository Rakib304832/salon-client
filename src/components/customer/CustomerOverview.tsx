"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/providers";
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  buttonStyles,
} from "@/components/ui";
import { AppointmentSummaryCard } from "@/components/customer/AppointmentSummaryCard";
import { useCustomerAppointments } from "@/hooks/useCustomerAppointments";
import { useCustomerStats } from "@/hooks/useCustomerStats";
import { ROUTES } from "@/lib/constants";

/**
 * CUSTOMER DASHBOARD OVERVIEW
 * ---------------------------
 * This page is a decision screen, not another booking form. It answers four
 * questions quickly: how many requests exist, how many are waiting, how many
 * are confirmed, and which payment state they are in.
 *
 * All numbers come from /api/appointments/stats and the preview comes from
 * /api/appointments/mine. Deriving them from a single list in the browser would
 * break the moment the server adds pagination, so the two requests stay
 * separate even though they are displayed together.
 */
interface StatCardProps {
  label: string;
  value: number;
  hint: string;
  icon: typeof CalendarDays;
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

export function CustomerOverview() {
  const { user } = useAuth();
  const {
    stats,
    error: statsError,
    loading: statsLoading,
    reload: reloadStats,
  } = useCustomerStats();
  const {
    appointments,
    error: appointmentsError,
    loading: appointmentsLoading,
    reload: reloadAppointments,
  } = useCustomerAppointments();

  function retry() {
    reloadStats();
    reloadAppointments();
  }

  if (statsLoading || appointmentsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-36 w-full rounded-card" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    );
  }

  const error = statsError ?? appointmentsError;
  if (error) {
    return (
      <ErrorState
        title="Could not load your dashboard"
        message={error}
        onRetry={retry}
      />
    );
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const recent = appointments?.slice(0, 3) ?? [];

  return (
    <div className="space-y-8">
      <section>
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-rose-gold">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
          Your salon at a glance
        </p>
        <h1 className="mt-2 text-3xl">Welcome back, {firstName}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Track every request from the first booking to payment. New requests
          stay Pending until a salon administrator confirms them.
        </p>
      </section>

      <section aria-label="Appointment summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total requests"
          value={stats?.total ?? 0}
          hint="Every appointment you have requested"
          icon={CalendarDays}
        />
        <StatCard
          label="Pending"
          value={stats?.pending ?? 0}
          hint="Waiting for salon confirmation"
          icon={Clock3}
        />
        <StatCard
          label="Confirmed"
          value={stats?.confirmed ?? 0}
          hint="Ready for your visit"
          icon={CheckCircle2}
        />
        <StatCard
          label="Paid"
          value={stats?.paid ?? 0}
          hint="Payments recorded by Stripe"
          icon={CreditCard}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href={ROUTES.services}
          className="group rounded-card border border-line bg-blush-light p-5 transition-colors hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
        >
          <p className="text-sm font-bold text-plum">Book another service</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Explore the full salon menu.
          </p>
          <ArrowRight
            aria-hidden="true"
            className="mt-3 h-4 w-4 text-rose-gold transition-transform group-hover:translate-x-1"
          />
        </Link>
        <Link
          href={ROUTES.customerAppointments}
          className="group rounded-card border border-line bg-blush-light p-5 transition-colors hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
        >
          <p className="text-sm font-bold text-plum">Manage appointments</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Cancel pending requests or pay after confirmation.
          </p>
          <ArrowRight
            aria-hidden="true"
            className="mt-3 h-4 w-4 text-rose-gold transition-transform group-hover:translate-x-1"
          />
        </Link>
        <Link
          href={ROUTES.customerProfile}
          className="group rounded-card border border-line bg-blush-light p-5 transition-colors hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
        >
          <p className="text-sm font-bold text-plum">Update your profile</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Keep your contact details and photo current.
          </p>
          <ArrowRight
            aria-hidden="true"
            className="mt-3 h-4 w-4 text-rose-gold transition-transform group-hover:translate-x-1"
          />
        </Link>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl">Recent appointments</h2>
            <p className="mt-1 text-sm text-muted">
              Your three newest requests, newest first.
            </p>
          </div>
          <Link
            href={ROUTES.customerAppointments}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            title="No appointments yet"
            description="Choose a service and request your first salon visit."
            action={
              <Link
                href={ROUTES.services}
                className={buttonStyles({ variant: "primary" })}
              >
                Browse services
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {recent.map((appointment) => (
              <AppointmentSummaryCard
                key={appointment._id}
                appointment={appointment}
                compact
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-card border border-line bg-white p-5">
        <h2 className="text-lg">Need a quicker refresh?</h2>
        <p className="mt-1 text-sm text-muted">
          Re-read your counts and recent requests from the API.
        </p>
        <Button variant="ghost" size="sm" className="mt-3 -ml-2" onClick={retry}>
          Refresh dashboard
        </Button>
      </section>
    </div>
  );
}
