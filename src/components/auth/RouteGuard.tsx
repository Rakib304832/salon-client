"use client";

import { useEffect, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button, ErrorState, Spinner } from "@/components/ui";
import { dashboardForRole } from "@/lib/auth";
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

/**
 * Non-blocking session warning for the guest-only auth pages.
 *
 * A failed session check must not hide the sign-in/sign-up form. If the API is
 * down or misconfigured the visitor can still try to sign in, and the normal
 * form error handling explains what happened. The warning simply makes the
 * underlying problem visible and offers a retry.
 */
function SessionWarning({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="status"
      className="mb-8 flex flex-col gap-3 rounded-card border border-line bg-blush-light px-4 py-3 text-plum sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2">
        <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="text-sm">
          <p className="font-bold">We could not check your session</p>
          <p className="text-muted">{message}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start sm:self-auto"
        onClick={onRetry}
      >
        Try again
      </Button>
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
    router.replace(dashboardForRole(user.role));
  }, [status, user, isBlocked, router]);

  if (status === "loading") return <GuardLoading />;

  if (isBlocked) return <AccountBlocked />;
  if (user) return <GuardLoading />; // redirect in progress

  // Unlike protected routes, an auth page stays usable when the session check
  // fails: showing the form is more helpful than a dead end with only a retry.
  return (
    <>
      {error ? (
        <SessionWarning message={error} onRetry={() => void refresh()} />
      ) : null}
      {children}
    </>
  );
}
