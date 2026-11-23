"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useAuth } from "@/components/providers";
import { Button, Input, PasswordRules } from "@/components/ui";
import { dashboardForRole, signUpWithEmail } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { toastApiError, toastError, toastInfo, toastSuccess } from "@/lib/toast";
import { safeRedirectPath } from "@/lib/utils";
import { signUpSchema, type SignUpInput } from "@/lib/validators";
import { GoogleButton } from "./GoogleButton";
import { ImageUploadField } from "./ImageUploadField";

/**
 * SIGN-UP FORM
 * ------------
 * Registration sends the chosen profile-image URL with the request. The file
 * picker is a convenience for signed-in users; guests can paste a URL and add
 * a photo later. Layout and password checklist follow the Figma design.
 */
export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const rawReturnTo = searchParams.get("returnTo");
  const returnTo = safeRedirectPath(rawReturnTo, ROUTES.home);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      image: "",
    },
  });

  const password = useWatch({ control: form.control, name: "password" });
  const imageUrl = useWatch({ control: form.control, name: "image" });

  async function onSubmit(values: SignUpInput) {
    try {
      const result = await signUpWithEmail(values);

      if (result?.error) {
        toastError(
          "Could not create your account",
          result.error.message ?? "Please check the details and try again.",
        );
        return;
      }

      const user = await refresh();
      if (!user) {
        toastInfo(
          "Account created",
          "Please sign in with your new credentials.",
        );
        router.replace(ROUTES.signIn);
        return;
      }

      toastSuccess("Your account is ready", `Welcome, ${user.name}!`);

      if (user.isBlocked) {
        router.replace(ROUTES.accountBlocked);
        return;
      }

      router.replace(rawReturnTo ? returnTo : dashboardForRole(user.role));
    } catch (error) {
      toastApiError(error, "Could not create your account. Please try again.");
    }
  }

  const signInHref = rawReturnTo
    ? `${ROUTES.signIn}?returnTo=${encodeURIComponent(rawReturnTo)}`
    : ROUTES.signIn;

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Join SalonBook and book your next appointment in minutes.
        </p>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          type="text"
          label="Full Name"
          placeholder="Maya Rahman"
          autoComplete="name"
          leadingIcon={<UserRound aria-hidden="true" className="h-4 w-4" />}
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />

        <Input
          type="email"
          label="Email"
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
            placeholder="At least 6 characters"
            autoComplete="new-password"
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

        <PasswordRules password={password ?? ""} />

        <ImageUploadField
          value={imageUrl ?? ""}
          onChange={(value) =>
            form.setValue("image", value, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          error={form.formState.errors.image?.message}
        />

        <Button
          type="submit"
          fullWidth
          loading={form.formState.isSubmitting}
        >
          Create account
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        <span>or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <GoogleButton returnTo={rawReturnTo} label="Sign up with Google" />

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={signInHref}
          className="font-bold text-plum underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
