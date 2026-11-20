import type { Metadata } from "next";
import { AdminAppointments } from "@/components/admin";

export const metadata: Metadata = {
  title: "Appointments | SalonBook admin",
  description: "Review, confirm and cancel salon appointments across all customers.",
};

/** Guard and shell are inherited from the admin dashboard layout. */
export default function AdminAppointmentsPage() {
  return <AdminAppointments />;
}
