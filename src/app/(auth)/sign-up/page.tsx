import type { Metadata } from "next";
import { Suspense } from "react";
import {
  AuthFormSkeleton,
  GuestOnly,
  SignUpForm,
} from "@/components/auth";

/**
 * Sign-up page.
 *
 * Same shell and Suspense rule as sign-in. The form accepts an image URL as the
 * primary path and attempts an authenticated file upload only as a convenience.
 */
export const metadata: Metadata = {
  title: "Create account",
  description: "Create a SalonBook account to request and manage appointments.",
};

export default function SignUpPage() {
  return (
    <GuestOnly>
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignUpForm />
      </Suspense>
    </GuestOnly>
  );
}
