import type { ReactNode } from "react";
import { CustomerGuard } from "@/components/auth";
import { DashboardShell } from "@/components/dashboard";

/**
 * CUSTOMER DASHBOARD LAYOUT
 * -------------------------
 * A route-group-free nested layout: every URL under /dashboard/customer shares
 * the same guard and chrome without repeating them in each page file.
 *
 * The guard is a Client Component but this layout stays a Server Component.
 * Next.js sends the guarded children as an inert tree until the guard has
 * confirmed the session, so protected data components are not rendered for a
 * signed-out visitor. The Express API still verifies every request it makes.
 */
export default function CustomerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CustomerGuard>
      <DashboardShell area="customer">{children}</DashboardShell>
    </CustomerGuard>
  );
}
