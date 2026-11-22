"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/layout";
import { Button, buttonStyles } from "@/components/ui";
import { ROUTES } from "@/lib/constants";

/**
 * ROOT ERROR BOUNDARY
 * -------------------
 * Next.js 16 requires `error.tsx` to be a Client Component. It catches uncaught
 * render errors below the root layout and offers a retry plus safe escape
 * links. Production error messages are deliberately generic to avoid leaking
 * server details, so only the optional digest is shown.
 */
interface ErrorProps {
  error: unknown;
  retry: () => void;
}

function errorDigest(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return null;
  }
  const value = (error as { digest?: unknown }).digest;
  return typeof value === "string" ? value : null;
}

export default function Error({ error, retry }: ErrorProps) {
  const digest = errorDigest(error);

  return (
    <main id="main-content" className="flex min-h-screen flex-col bg-ivory">
      <div className="border-b border-line bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Logo />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-blocked-bg text-status-blocked-text">
            <AlertTriangle aria-hidden="true" className="h-7 w-7" />
          </span>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-rose-gold">
            Unexpected error
          </p>
          <h1 className="mt-3 text-4xl">Something went wrong</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted">
            This page could not finish loading. Try again, or return to a known
            page while we sort it out.
          </p>
          {digest ? (
            <p className="mt-3 text-xs text-muted">Reference: {digest}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button type="button" variant="primary" onClick={retry}>
              Try again
            </Button>
            <Link
              href={ROUTES.home}
              className={buttonStyles({ variant: "outline" })}
            >
              Back to home
            </Link>
            <Link
              href={ROUTES.services}
              className={buttonStyles({ variant: "ghost" })}
            >
              Browse services
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
