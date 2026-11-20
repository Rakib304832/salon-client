"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { buttonStyles } from "@/components/ui";
import { ROUTES } from "@/lib/constants";

/**
 * ACCESS DENIED
 * -------------
 * Shown whenever a signed-in user tries to open a page for the other role, for
 * example a customer visiting /dashboard/admin.
 *
 * We do NOT redirect to /sign-in here. The user is signed in; the problem is
 * permission, so sending them to login would be confusing and could cause a
 * redirect loop. "Go to my dashboard" always points at a safe page for their
 * actual role.
 */
export function AccessDenied() {
  const { user } = useAuth();
  const dashboard =
    user?.role === "admin" ? ROUTES.adminDashboard : ROUTES.customerDashboard;

  return (
    <main id="main-content" className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-card border border-line bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-status-pending-bg text-status-pending-text">
          <ShieldAlert aria-hidden="true" className="h-8 w-8" />
        </div>

        <h1 className="text-3xl">Access denied</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          Your account does not have permission to view this page. If you think
          this is a mistake, please contact the salon instead of trying to sign
          in again.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={dashboard} className={buttonStyles()}>
            Go to my dashboard
          </Link>
          <Link href={ROUTES.home} className={buttonStyles({ variant: "outline" })}>
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
