import { CalendarDays } from "lucide-react";
import { BookingForm } from "@/components/booking";
import type { Service } from "@/types";

/**
 * Booking card from the Figma service-detail screen. It owns the layout and
 * review note; BookingForm keeps the validation and API contract unchanged.
 */
export interface BookingCardProps {
  service: Service;
}

export function BookingCard({ service }: BookingCardProps) {
  return (
    <section className="rounded-card border border-line bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarDays aria-hidden="true" className="h-5 w-5 text-rose-gold" />
        <h2 className="text-xl">Booking Card</h2>
      </div>
      <p className="mt-2 text-sm text-muted">
        Choose a date and slot. The salon confirms every request before payment
        opens.
      </p>

      <div className="mt-6">
        <BookingForm service={service} />
      </div>
    </section>
  );
}
