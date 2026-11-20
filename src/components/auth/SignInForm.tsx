"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/providers";
import { Button, Input } from "@/components/ui";
import { dashboardForRole, signInWithEmail } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { toastApiError, toastError, toastSuccess } from "@/lib/toast";
import { safeRedirectPath } from "@/lib/utils";
import { signInSchema, type SignInInput } from "@/lib/validators";
import { GoogleButton } from "./GoogleButton";

/**
 * SIGN-IN FORM
 * ------------
 * The form validates locally with Zod, but Better Auth on the Express server is
 * the real authority. It returns a cookie, so there is no token to store in
 * localStorage (which would be vulnerable to XSS).
 *
 * Flow:
 * 1. submit credentials to Express via the Better Auth client
 * 2. call AuthProvider.refresh() so the whole app sees the new session
 * 3. redirect to a role dashboard or the guarded page the user originally tried
 * 4. send blocked accounts to the Account Blocked explanation instead
 *
 * useSearchParams requires a Suspense boundary; the sign-in page provides one.
 */
export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const rawReturnTo = searchParams.get("returnTo");
  const returnTo = safeRedirectPath(rawReturnTo, ROUTES.home);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpHref = rawReturnTo
    ? `${ROUTES.signUp}?returnTo=${encodeURIComponent(rawReturnTo)}`
    : ROUTES.signUp;

  async function onSubmit(values: SignInInput) {
    try {
      const result = await signInWithEmail(values);

      // Better Auth reports credential errors in `error` instead of throwing.
      if (result?.error) {
        toastError(
          "Sign in failed",
          result.error.message ?? "Check your email and password.",
        );
        return;
      }

      const user = await refresh();
      if (!user) {
        toastError("Sign in failed", "We could not load your session.");
        return;
      }

      toastSuccess("Welcome back", `Signed in as ${user.name}`);

      if (user.isBlocked) {
        router.replace(ROUTES.accountBlocked);
        return;
      }

      // A guard created returnTo; without one, the role dashboard is friendlier
      // than dropping the user on the public home page.
      router.replace(
        rawReturnTo ? returnTo : dashboardForRole(user.role),
      );
    } catch (error) {
      toastApiError(error, "Could not sign in. Please try again.");
    }
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-gold">
          Welcome back
        </p>
        <h1 className="mt-2 text-3xl">Sign in to SalonBook</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Manage your bookings, pay for confirmed visits, and keep your profile
          up to date.
        </p>
      </header>

      <GoogleButton returnTo={rawReturnTo} />

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        <span>or continue with email</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* noValidate lets Zod own the error messages instead of native bubbles. */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          leadingIcon={<Mail aria-hidden="true" className="h-4 w-4" />}
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            className="pr-12"
            leadingIcon={<LockKeyhole aria-hidden="true" className="h-4 w-4" />}
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-[38px] -translate-y-1/2 rounded-full p-1 text-muted hover:text-plum focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Eye aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={form.formState.isSubmitting}
        >
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        New to SalonBook?{" "}
        <Link
          href={signUpHref}
          className="font-bold text-plum underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
