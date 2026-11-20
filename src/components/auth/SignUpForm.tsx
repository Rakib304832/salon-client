"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/providers";
import { Button, Input } from "@/components/ui";
import { ApiError, uploadsApi } from "@/lib/api";
import { dashboardForRole, signUpWithEmail } from "@/lib/auth";
import { API_ERROR_CODES, ROUTES } from "@/lib/constants";
import { toastApiError, toastError, toastInfo, toastSuccess } from "@/lib/toast";
import { safeRedirectPath } from "@/lib/utils";
import { signUpSchema, type SignUpInput } from "@/lib/validators";
import { GoogleButton } from "./GoogleButton";

/**
 * SIGN-UP FORM
 * ------------
 * Image strategy follows the server contract:
 * - The URL field is the primary path. It works before sign-in and is always
 *   submitted with the registration request.
 * - A file picker attempts the authenticated /api/uploads endpoint as a
 *   convenience. If the server answers 401 (expected for a guest), we show an
 *   inline explanation and leave the URL field available instead of failing the
 *   whole registration.
 *
 * Password rules mirror the Zod schema: at least 6 characters with one upper
 * and one lowercase letter. The server validates again, as it must.
 */
export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

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

  async function handleImageFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toastError("Choose an image file", "PNG, JPG or WebP works best.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toastError("Image is too large", "Please choose a file under 5 MB.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      const uploaded = await uploadsApi.uploadImage(file);
      form.setValue("image", uploaded.url, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setUploadMessage("Image uploaded. You can still edit the URL below.");
      toastSuccess("Profile image uploaded");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUploadMessage(
          "Photo upload needs a signed-in session. Paste an image URL for now — you can upload a photo later from your profile.",
        );
      } else if (
        error instanceof ApiError &&
        error.code === API_ERROR_CODES.UPLOAD_RATE_LIMITED
      ) {
        setUploadMessage(
          "Too many uploads right now. Paste an image URL and try again later.",
        );
      } else {
        toastApiError(error, "Could not upload this image.");
      }
    } finally {
      setUploading(false);
      // Allows choosing the same file again after a failed attempt.
      event.target.value = "";
    }
  }

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

      router.replace(
        rawReturnTo ? returnTo : dashboardForRole(user.role),
      );
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
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-gold">
          Join SalonBook
        </p>
        <h1 className="mt-2 text-3xl">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Book trusted salon services and keep every appointment in one place.
        </p>
      </header>

      <GoogleButton returnTo={rawReturnTo} label="Sign up with Google" />

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        <span>or register with email</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          type="text"
          label="Full name"
          placeholder="Your name"
          autoComplete="name"
          leadingIcon={<UserRound aria-hidden="true" className="h-4 w-4" />}
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />

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
            placeholder="At least 6 characters"
            autoComplete="new-password"
            className="pr-12"
            hint="Use at least 6 characters with one uppercase and one lowercase letter."
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

        <div className="space-y-2 rounded-input border border-dashed border-line bg-blush-light/60 p-3">
          <label
            htmlFor="signup-image-file"
            className="flex cursor-pointer items-center gap-2 text-sm font-bold text-plum"
          >
            <ImagePlus aria-hidden="true" className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload a photo (optional)"}
          </label>
          <input
            id="signup-image-file"
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => void handleImageFile(event)}
            className="block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-plum file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-plum-dark disabled:opacity-60"
          />
          {uploadMessage ? (
            <p role="status" className="text-xs leading-5 text-muted">
              {uploadMessage}
            </p>
          ) : null}
        </div>

        <Input
          type="url"
          label="Profile image URL"
          placeholder="https://…"
          hint="Paste an image URL instead of uploading if you are not signed in yet."
          error={form.formState.errors.image?.message}
          {...form.register("image")}
        />

        <Button
          type="submit"
          fullWidth
          loading={form.formState.isSubmitting}
        >
          Create account
        </Button>
      </form>

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
