"use client";

import { useState, type ChangeEvent, type CSSProperties } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useAuth } from "@/components/providers";
import { Button, Input } from "@/components/ui";
import { ApiError, uploadsApi, usersApi } from "@/lib/api";
import { API_ERROR_CODES } from "@/lib/constants";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { getInitials } from "@/lib/utils";
import { profileSchema, type ProfileInput } from "@/lib/validators";

/**
 * CUSTOMER PROFILE FORM
 * ---------------------
 * Only name, phone and image are editable. Email, role and blocked state are
 * server-owned and are shown as read-only information, never submitted. Even if
 * a crafted request included them, the Express update route strips those keys
 * with Zod before writing to Better Auth's user collection.
 *
 * Two image paths are supported:
 * - paste a URL, which is validated locally and sent with the PATCH request
 * - choose a JPEG, PNG or WebP file, which is uploaded first through the
 *   authenticated /api/uploads endpoint and replaced by the returned URL
 *
 * The upload limit and MIME list mirror the server middleware so obvious
 * mistakes fail instantly in the browser instead of consuming an API round trip.
 */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/**
 * Build a safe CSS background from a user-supplied image URL.
 *
 * next/image would reject arbitrary profile hosts because next.config.ts only
 * allows ImgBB. A CSS background avoids that restriction while still blocking
 * javascript: and data: URLs. Quotes and backslashes are escaped so the value
 * cannot break out of the CSS url() string.
 */
function imagePreviewStyle(value: string | undefined): CSSProperties | undefined {
  if (!value?.trim()) return undefined;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;

    const escaped = url.href.replace(/["\\]/g, "\\$&");
    return { backgroundImage: `url("${escaped}")` };
  } catch {
    return undefined;
  }
}

/**
 * Presentation props let the admin area reuse exactly the same save/upload
 * logic. They are optional so the existing customer page keeps its original
 * copy without needing to pass anything.
 */
export interface CustomerProfileFormProps {
  title?: string;
  description?: string;
  roleLabel?: string;
}

export function CustomerProfileForm({
  title = "My profile",
  description = "Keep your contact details current so the salon can reach you about a confirmed appointment.",
  roleLabel = "Customer account",
}: CustomerProfileFormProps) {
  const { user, setUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      image: user?.image ?? "",
    },
  });

  // useWatch is the React-Compiler-safe way to observe a field. Calling
  // form.watch() during render makes React skip memoising this component.
  const imageValue = useWatch({ control: form.control, name: "image" });
  const previewStyle = imagePreviewStyle(imageValue);
  const displayName = user?.name?.trim() || "SalonBook user";

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setUploadError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setSelectedFile(null);
      setUploadError("Choose a JPEG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setSelectedFile(null);
      setUploadError("Choose an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  async function onSubmit(values: ProfileInput) {
    setUploadError(null);

    // Start from the URL in the form. A chosen file uploads first and wins so
    // the user never has to paste the returned ImgBB URL manually.
    let imageUrl = values.image?.trim() || "";

    if (selectedFile) {
      try {
        const uploaded = await uploadsApi.uploadImage(selectedFile);
        imageUrl = uploaded.url;
        form.setValue("image", imageUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } catch (caught) {
        if (
          caught instanceof ApiError &&
          caught.code === API_ERROR_CODES.UPLOAD_RATE_LIMITED
        ) {
          setUploadError(
            "Too many uploads right now. Try again later or paste an image URL.",
          );
        } else {
          setUploadError("The image could not be uploaded. Please try again.");
        }

        toastApiError(caught, "Could not upload this image.");
        return;
      }
    }

    try {
      const updated = await usersApi.updateMe({
        name: values.name.trim(),
        phone: values.phone?.trim() ?? "",
        // An empty string is the documented way to clear an optional image.
        image: imageUrl,
      });

      // Updating the shared auth context avoids a full reload and keeps the
      // dashboard greeting and sidebar avatar in sync immediately.
      setUser(updated);
      form.reset({
        name: updated.name,
        phone: updated.phone ?? "",
        image: updated.image ?? "",
      });
      setSelectedFile(null);
      toastSuccess("Profile updated", "Your details have been saved.");
    } catch (caught) {
      toastApiError(caught, "Could not save your profile.");
    }
  }

  return (
    <div className="space-y-7">
      <section>
        <h1 className="text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {description}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="rounded-card border border-line bg-white p-6 text-center shadow-sm">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-blush-light bg-blush-light bg-cover bg-center text-2xl font-bold text-plum"
            style={previewStyle}
            role="img"
            aria-label={`${displayName}'s profile image`}
          >
            {!previewStyle ? getInitials(displayName) : null}
          </div>
          <h2 className="mt-4 text-lg">{displayName}</h2>
          <p className="mt-1 text-sm text-muted">{user?.email}</p>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blush-light px-3 py-1 text-xs font-bold text-plum">
            <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
            {roleLabel}
          </p>

          <div className="mt-5 space-y-2 border-t border-line pt-5 text-left text-xs">
            <p className="flex items-center gap-2 text-muted">
              <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              Email is managed by Better Auth.
            </p>
            <p className="flex items-center gap-2 text-muted">
              <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              Roles and blocked state are set by the salon.
            </p>
          </div>
        </aside>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="space-y-5 rounded-card border border-line bg-white p-6 shadow-sm"
        >
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
            type="tel"
            label="Phone number (optional)"
            placeholder="e.g. +1 555 0100"
            autoComplete="tel"
            maxLength={20}
            error={form.formState.errors.phone?.message}
            {...form.register("phone")}
          />

          <div className="space-y-2 rounded-input border border-dashed border-line bg-ivory p-4">
            <label
              htmlFor="profile-image-file"
              className="flex cursor-pointer items-center gap-2 text-sm font-bold text-plum"
            >
              <ImagePlus aria-hidden="true" className="h-4 w-4" />
              Upload a new photo (optional)
            </label>
            <input
              id="profile-image-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-plum file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-plum-dark"
            />
            <p className="text-xs leading-5 text-muted">
              JPEG, PNG or WebP up to 5 MB. Uploaded files are stored by the
              Express server, not by this browser.
            </p>
            {selectedFile ? (
              <p role="status" className="text-xs font-bold text-plum">
                Selected: {selectedFile.name}
              </p>
            ) : null}
            {uploadError ? (
              <p role="alert" className="text-xs font-bold text-[#B24A4A]">
                {uploadError}
              </p>
            ) : null}
          </div>

          <Input
            type="url"
            label="Profile image URL"
            placeholder="https://…"
            hint="Leave empty to remove your current photo. A selected file takes priority."
            error={form.formState.errors.image?.message}
            {...form.register("image")}
          />

          <div className="border-t border-line pt-5">
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
              className="min-w-44"
            >
              Save changes
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
