import type { ReactNode } from "react";
import { AdminGuard } from "@/components/auth";
import { DashboardShell } from "@/components/dashboard";

/**
 * ADMIN DASHBOARD LAYOUT
 * ----------------------
 * AdminGuard checks the role from the live Express session. That is only a UI
 * gate: every admin API route independently verifies the cookie and role, so a
 * direct fetch cannot bypass server security by visiting a client URL.
 *
 * The navigation inside DashboardShell is intentionally limited to screens that
 * exist in this part of the build. Additional management pages will be wired
 * into the same shell as they land.
 */
export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminGuard>
      <DashboardShell area="admin">{children}</DashboardShell>
    </AdminGuard>
  );
}
