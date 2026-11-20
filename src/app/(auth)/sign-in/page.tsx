import type { Metadata } from "next";
import { Suspense } from "react";
import {
  AuthFormSkeleton,
  GuestOnly,
  SignInForm,
} from "@/components/auth";

/**
 * Sign-in page.
 *
 * GuestOnly redirects already-authenticated users to their role dashboard.
 * The Suspense boundary is required because SignInForm reads useSearchParams()
 * for the `returnTo` value created by route guards.
 */
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your SalonBook appointments and profile.",
};

export default function SignInPage() {
  return (
    <GuestOnly>
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignInForm />
      </Suspense>
    </GuestOnly>
  );
}
