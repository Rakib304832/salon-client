import type { Metadata } from "next";
import { AdminTransactions } from "@/components/admin";

export const metadata: Metadata = {
  title: "Transactions | SalonBook admin",
  description: "Read-only Stripe payment records created by verified webhooks.",
};

/** The transaction component never mutates payment or appointment records. */
export default function AdminTransactionsPage() {
  return <AdminTransactions />;
}
