import type { Metadata } from "next";
import { CustomerAppointments } from "@/components/customer";

export const metadata: Metadata = {
  title: "My appointments",
  description: "Review, cancel and pay for your SalonBook appointments.",
};

/** URL-to-screen mapping only; data and guards live in shared components. */
export default function CustomerAppointmentsPage() {
  return <CustomerAppointments />;
}
