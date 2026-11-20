"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { signInWithGoogle } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { toastApiError, toastError, toastInfo } from "@/lib/toast";
import { safeRedirectPath } from "@/lib/utils";

/**
 * Google OAuth button shared by sign-in and sign-up.
 *
 * Better Auth's social provider can handle both flows: if the Google account is
 * new, the Express server provisions a customer; if it exists, it signs in.
 * That is why there is no separate "Sign up with Google" implementation.
 *
 * callbackURL is built from window.location.origin so the server receives an
 * absolute URL it can validate against its configured Better Auth trusted
 * origins. safeRedirectPath() prevents a crafted returnTo from sending the
 * browser to another domain after the Google redirect.
 */
export interface GoogleButtonProps {
  returnTo?: string | null;
  label?: string;
}

export function GoogleButton({
  returnTo,
  label = "Continue with Google",
}: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const internalPath = safeRedirectPath(returnTo, ROUTES.home);
      const callbackURL =
        typeof window === "undefined"
          ? internalPath
          : `${window.location.origin}${internalPath}`;

      toastInfo("Redirecting to Google…");
      const result = await signInWithGoogle(callbackURL);

      if (result?.error) {
        toastError(
          "Google sign-in could not start",
          result.error.message ?? "Please try again.",
        );
      }
    } catch (error) {
      toastApiError(error, "Could not start Google sign-in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      fullWidth
      loading={loading}
      onClick={() => void handleClick()}
    >
      {/* A text label avoids maintaining a branded Google SVG in this repo. */}
      <span aria-hidden="true" className="text-base font-bold text-rose-gold">
        G
      </span>
      {label}
    </Button>
  );
}
