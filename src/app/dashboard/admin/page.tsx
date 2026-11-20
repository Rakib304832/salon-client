import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "SalonBook statistics, recent appointments and booking trends.",
};

/** URL-to-screen mapping; data fetching and guard logic live in shared files. */
export default function AdminDashboardPage() {
  return <AdminOverview />;
}
