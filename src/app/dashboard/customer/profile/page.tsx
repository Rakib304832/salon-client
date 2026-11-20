import type { Metadata } from "next";
import { CustomerProfileForm } from "@/components/customer";

export const metadata: Metadata = {
  title: "My profile",
  description: "Update your SalonBook contact details and profile photo.",
};

/** URL-to-screen mapping only; the form owns validation and API calls. */
export default function CustomerProfilePage() {
  return <CustomerProfileForm />;
}
