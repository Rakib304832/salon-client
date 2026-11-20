import type { Metadata } from "next";
import { AdminUsers } from "@/components/admin";

export const metadata: Metadata = {
  title: "Users | SalonBook admin",
  description: "Review registered accounts and block or unblock customers.",
};

/** Role changes are intentionally unavailable in this screen. */
export default function AdminUsersPage() {
  return <AdminUsers />;
}
