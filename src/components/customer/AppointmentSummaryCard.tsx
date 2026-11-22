import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  CalendarDays,
  Clock,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import {
  PaymentBadge,
  StatusBadge,
  buttonStyles,
} from "@/components/ui";
import {
  appointmentService,
  appointmentServiceId,
  appointmentServiceName,
} from "@/lib/appointments";
import { canRenderWithNextImage } from "@/components/services/service-image";
import { ROUTES } from "@/lib/constants";
import { formatCurrency, formatDate, formatDuration } from "@/lib/utils";
import type { Appointment } from "@/types";

/**
 * REUSABLE APPOINTMENT SUMMARY
 * ----------------------------
 * Used by the customer dashboard preview and by the full appointments page.
 * Keeping the "what does one appointment look like?" decision in one component
 * prevents the overview from showing different badges or prices than the list.
 *
 * It is a Server Component by default (no hooks), but it accepts action buttons
 * created by Client Components through `actions`. That is safe: children and
 * React nodes are the normal way server and client trees compose.
 */
export interface AppointmentSummaryCardProps {
  appointment: Appointment;
  actions?: ReactNode;
  /** Hides the salon note and duration in the compact dashboard preview. */
  compact?: boolean;
}

export function AppointmentSummaryCard({
  appointment,
  actions,
  compact = false,
}: AppointmentSummaryCardProps) {
  const service = appointmentService(appointment);
  const serviceId = appointmentServiceId(appointment);
  const serviceImage = service?.image;
  const imageIsSafe = canRenderWithNextImage(serviceImage);

  return (
    <article className="rounded-card border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-blush-light">
            {imageIsSafe && serviceImage ? (
              <Image
                src={serviceImage}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <Sparkles
                aria-hidden="true"
                className="absolute inset-0 m-auto h-6 w-6 text-plum/40"
              />
            )}
          </div>

          <div className="min-w-0">
            <Link
              href={`${ROUTES.services}/${serviceId}`}
              className="text-lg font-bold text-plum underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
            >
              {appointmentServiceName(appointment)}
            </Link>
            <p className="mt-1 text-xs text-muted">
              Requested {formatDate(appointment.createdAt)}
            </p>
            <p className="mt-1 text-xs font-bold text-rose-gold">
              {service?.category ?? "Salon service"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={appointment.status} />
          <PaymentBadge status={appointment.paymentStatus} />
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-xl bg-ivory px-3 py-2.5">
          <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-rose-gold" />
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Date
            </dt>
            <dd className="text-sm font-bold text-plum">
              {formatDate(appointment.appointmentDate)}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-ivory px-3 py-2.5">
          <Clock aria-hidden="true" className="h-4 w-4 shrink-0 text-rose-gold" />
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Time
            </dt>
            <dd className="text-sm font-bold text-plum">{appointment.timeSlot}</dd>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-ivory px-3 py-2.5">
          <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0 text-rose-gold" />
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Price
            </dt>
            <dd className="text-sm font-bold text-plum">
              {formatCurrency(appointment.servicePrice)}
              {service && !compact ? (
                <span className="ml-1 font-normal text-muted">
                  · {formatDuration(service.duration)}
                </span>
              ) : null}
            </dd>
          </div>
        </div>
      </dl>

      {!compact && appointment.message ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-blush-light/50 px-3 py-2.5">
          <MessageSquareText
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-plum"
          />
          <p className="text-xs leading-5 text-muted">{appointment.message}</p>
        </div>
      ) : null}

      {actions ? (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          {actions}
        </div>
      ) : (
        <Link
          href={`${ROUTES.customerAppointments}`}
          className={buttonStyles({ variant: "ghost", size: "sm", className: "mt-3 -ml-2" })}
        >
          View details
        </Link>
      )}
    </article>
  );
}
