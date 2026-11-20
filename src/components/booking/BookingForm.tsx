"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, LockKeyhole, MessageSquareText } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useAuth } from "@/components/providers";
import { Button, Input, Select, Spinner, Textarea } from "@/components/ui";
import { ApiError, appointmentsApi } from "@/lib/api";
import { ROUTES, TIME_SLOTS } from "@/lib/constants";
import { toastApiError, toastSuccess } from "@/lib/toast";
import {
  bookingSchema,
  earliestBookingDate,
  type BookingInput,
} from "@/lib/validators";
import type { Service } from "@/types";

/**
 * BOOKING FORM
 * ------------
 * Creates a Pending appointment for the signed-in customer.
 *
 * Security / contract notes:
 * - The service id comes from the fetched service, not from a hidden editable
 *   field, so a user cannot silently swap it for another price.
 * - customerId, status and paymentStatus are NEVER sent. The Express route
 *   derives the customer from the session and owns those fields.
 * - Client validation mirrors the server: real future UTC date plus one of the
 *   ten advertised hourly slots. The server validates again as the boundary.
 *
 * Auth is handled as a rendering state rather than a hard redirect: a guest
 * browsing a service sees a clear "sign in to book" card with a return URL,
 * while a blocked or admin account sees an explanation instead of a form they
 * cannot legally submit.
 */
export interface BookingFormProps {
  service: Service;
}

type BookableField = "serviceId" | "appointmentDate" | "timeSlot" | "message";
const BOOKABLE_FIELDS = new Set<string>([
  "serviceId",
  "appointmentDate",
  "timeSlot",
  "message",
]);

export function BookingForm({ service }: BookingFormProps) {
  const router = useRouter();
  const { user, status, isBlocked } = useAuth();

  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: service._id,
      appointmentDate: "",
      timeSlot: TIME_SLOTS[0],
      message: "",
    },
  });

  // useWatch is the compiler-safe subscription API. Calling form.watch() during
  // render makes React Compiler skip memoisation and can produce stale UI.
  const message = useWatch({ control: form.control, name: "message" });
  const messageLength = message?.length ?? 0;
  const { errors, isSubmitting } = form.formState;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner label="Checking your session" />
      </div>
    );
  }

  const returnTo = encodeURIComponent(`/services/${service._id}`);

  if (!user) {
    return (
      <div className="rounded-card border border-dashed border-line bg-ivory p-5">
        <div className="flex items-start gap-3">
          <LockKeyhole aria-hidden="true" className="mt-0.5 h-5 w-5 text-plum" />
          <div>
            <h3 className="text-base">Sign in to request this appointment</h3>
            <p className="mt-1 text-sm text-muted">
              Your booking will be saved against your SalonBook account.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`${ROUTES.signIn}?returnTo=${returnTo}`}
                className="inline-flex h-10 items-center justify-center rounded-full bg-plum px-5 text-sm font-bold text-white transition-colors hover:bg-plum-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
              >
                Sign in
              </Link>
              <Link
                href={`${ROUTES.signUp}?returnTo=${returnTo}`}
                className="inline-flex h-10 items-center justify-center rounded-full border border-plum px-5 text-sm font-bold text-plum transition-colors hover:bg-blush-light focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="rounded-card border border-status-blocked-bg bg-status-blocked-bg/40 p-5 text-sm leading-6 text-status-blocked-text">
        Your account is blocked, so new appointments cannot be requested. Please
        contact the salon for help.
      </div>
    );
  }

  if (user.role !== "customer") {
    return (
      <div className="rounded-card border border-line bg-ivory p-5 text-sm leading-6 text-muted">
        Admin accounts are used to manage the salon. Please sign in with a
        customer account to book an appointment.
      </div>
    );
  }

  async function onSubmit(values: BookingInput) {
    try {
      // serviceId is overwritten with the fetched service id even if a crafted
      // submission tried to change it through the form payload.
      await appointmentsApi.create({ ...values, serviceId: service._id });

      toastSuccess(
        "Appointment requested",
        "The salon will confirm it shortly. You can track it in My Appointments.",
      );
      router.push(ROUTES.customerAppointments);
    } catch (caught) {
      // Validation errors are placed beside the matching control as well as in
      // a toast, so the user can see exactly what to change.
      if (caught instanceof ApiError && caught.errors?.length) {
        caught.errors.forEach((detail) => {
          const field = detail.field;
          if (field && BOOKABLE_FIELDS.has(field)) {
            form.setError(field as BookableField, { message: detail.message });
          }
        });
      }

      toastApiError(caught, "Could not request this appointment.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
      <input type="hidden" {...form.register("serviceId")} />

      <Input
        type="date"
        label="Appointment date"
        placeholder="YYYY-MM-DD"
        min={earliestBookingDate()}
        leadingIcon={<CalendarDays aria-hidden="true" className="h-4 w-4" />}
        error={errors.appointmentDate?.message}
        {...form.register("appointmentDate")}
      />

      <Select
        label="Time slot"
        error={errors.timeSlot?.message}
        options={TIME_SLOTS.map((slot) => ({ value: slot, label: slot }))}
        {...form.register("timeSlot")}
      />

      <Textarea
        label="Note for the salon (optional)"
        placeholder="Tell us anything the stylist should know…"
        maxLength={500}
        rows={4}
        hint={`${messageLength}/500 characters`}
        error={errors.message?.message}
        {...form.register("message")}
      />

      <div className="flex items-center gap-2 rounded-xl bg-blush-light px-4 py-3 text-xs leading-5 text-plum">
        <MessageSquareText aria-hidden="true" className="h-4 w-4 shrink-0" />
        You will not be charged yet. Payment opens only after the salon confirms
        your request.
      </div>

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? "Sending request…" : "Request appointment"}
      </Button>
    </form>
  );
}
