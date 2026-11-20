"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { ErrorState, Spinner } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import type { UserRole } from "@/types";
import { AccessDenied } from "./AccessDenied";
import { AccountBlocked } from "./AccountBlocked";

/**
 * ROUTE GUARDS
 * ------------
 * Guards wrap page content; they are not security by themselves. The Express
 * API is the real security boundary and verifies every request from its cookie.
 * These components only decide what the browser should render.
 *
 * Decision order is deliberate:
 * 1. loading       -> show a spinner, never flash protected content
 * 2. session error -> show inline error with Retry
 * 3. no user       -> redirect to sign-in with a return URL
 * 4. blocked       -> show AccountBlocked
 * 5. wrong role    -> show AccessDenied
 * 6. otherwise     -> render children
 */

function GuardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Spinner size="lg" label="Checking your session" />
    </div>
  );
}

export interface RouteGuardProps {
  children: ReactNode;
  /** Omit to allow any authenticated, non-blocked user. */
  allow?: UserRole | readonly UserRole[];
}

export function RouteGuard({ children, allow }: RouteGuardProps) {
  const { user, status, isBlocked, error, refresh } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "unauthenticated" || error) return;

    // Preserve the attempted URL so sign-in can return the user to where they
    // wanted to go. window is safe here because effects only run in browser.
    const query = typeof window === "undefined" ? "" : window.location.search;
    const returnTo = `${pathname}${query}`;
    router.replace(
      `${ROUTES.signIn}?returnTo=${encodeURIComponent(returnTo)}`,
    );
  }, [status, error, pathname, router]);

  if (status === "loading") return <GuardLoading />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorState
          title="We could not check your session"
          message={error}
          onRetry={() => void refresh()}
        />
      </div>
    );
  }

  // The redirect effect above is running; keep the page blank-ish meanwhile.
  if (!user) return <GuardLoading />;
  if (isBlocked) return <AccountBlocked />;

  const allowedRoles: readonly UserRole[] | null = allow
    ? typeof allow === "string"
      ? [allow]
      : allow
    : null;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

/** Customer-only convenience wrapper. Role comes from the server session. */
export function CustomerGuard({ children }: { children: ReactNode }) {
  return <RouteGuard allow="customer">{children}</RouteGuard>;
}

/** Admin-only convenience wrapper. Never derive admin from a URL segment. */
export function AdminGuard({ children }: { children: ReactNode }) {
  return <RouteGuard allow="admin">{children}</RouteGuard>;
}

/**
 * Guest-only guard for /sign-in and /sign-up.
 *
 * An already-signed-in user should not stare at a login form. They go straight
 * to their role dashboard. Blocked users are the exception: they see the
 * blocked explanation rather than being bounced between dashboards.
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, status, isBlocked, error, refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || !user || isBlocked) return;
    router.replace(
      user.role === "admin"
        ? ROUTES.adminDashboard
        : ROUTES.customerDashboard,
    );
  }, [status, user, isBlocked, router]);

  if (status === "loading") return <GuardLoading />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorState
          title="We could not check your session"
          message={error}
          onRetry={() => void refresh()}
        />
      </div>
    );
  }

  if (isBlocked) return <AccountBlocked />;
  if (user) return <GuardLoading />; // redirect in progress

  return <>{children}</>;
}
