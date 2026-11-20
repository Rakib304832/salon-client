import type { Metadata } from "next";
import { CustomerOverview } from "@/components/customer";

export const metadata: Metadata = {
  title: "Customer dashboard",
  description: "Review your SalonBook appointments, payments and next steps.",
};

/**
 * CUSTOMER OVERVIEW ROUTE
 * -----------------------
 * Deliberately thin. Authentication, chrome and data fetching live in the
 * layout, hook and component files so this file only maps a URL to a screen.
 */
export default function CustomerDashboardPage() {
  return <CustomerOverview />;
}
