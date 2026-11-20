import type { Metadata } from "next";
import { CustomerProfileForm } from "@/components/customer";

export const metadata: Metadata = {
  title: "Admin profile | SalonBook",
  description: "Update the signed-in administrator's name, phone and photo.",
};

/**
 * ADMIN PROFILE
 * -------------
 * The editable fields and validation are identical for customers and admins, so
 * this page reuses the tested CustomerProfileForm with admin-specific copy. Only
 * name, phone and image are submitted; email, role and blocked state stay
 * server-owned even for an administrator.
 */
export default function AdminProfilePage() {
  return (
    <CustomerProfileForm
      title="Admin profile"
      description="Keep your contact details current so the salon can reach you about operations and appointments."
      roleLabel="Administrator account"
    />
  );
}
