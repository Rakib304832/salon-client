"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { buttonStyles } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import { toastError } from "@/lib/toast";

/**
 * ACCOUNT BLOCKED
 * ----------------
 * The server can block a customer while their Better Auth cookie is still
 * valid. Every protected API call then returns 403, so the client must show a
 * clear explanation instead of an endless loading spinner or a login loop.
 *
 * Public browsing remains available, which is why "Browse services" is the
 * primary link. Sign out is still possible so the user can switch accounts.
 */
export function AccountBlocked() {
  const { signOutUser } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOutUser();
      router.replace(ROUTES.signIn);
    } catch {
      toastError("Could not sign out", "Please try again in a moment.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-card border border-line bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-status-blocked-bg text-status-blocked-text">
          <LockKeyhole aria-hidden="true" className="h-8 w-8" />
        </div>

        <h1 className="text-3xl">Account blocked</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          An administrator has blocked this account. You can still browse our
          services, but you cannot request appointments, make payments, or
          manage a dashboard until the block is removed.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={ROUTES.services} className={buttonStyles()}>
            Browse services
          </Link>
          <Link href={ROUTES.home} className={buttonStyles({ variant: "outline" })}>
            Back to home
          </Link>
        </div>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          className="mx-auto mt-6 block text-sm font-bold text-plum underline-offset-4 hover:underline disabled:opacity-60"
        >
          {signingOut ? "Signing out…" : "Sign out and use another account"}
        </button>
      </div>
    </main>
  );
}
