"use client";

import { useState, type ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";
import { Input } from "@/components/ui";
import { ApiError, uploadsApi } from "@/lib/api";
import { API_ERROR_CODES } from "@/lib/constants";
import { toastApiError, toastError, toastSuccess } from "@/lib/toast";

export interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/**
 * Figma-style profile image control: a file picker plus a URL field in one
 * labelled group. Guests cannot call the authenticated upload endpoint, so the
 * URL field stays available and the inline message explains why.
 */
export function ImageUploadField({
  value,
  onChange,
  error,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
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
      onChange(uploaded.url);
      setUploadMessage("Image uploaded. You can still edit the URL below.");
      toastSuccess("Profile image uploaded");
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        setUploadMessage(
          "Photo upload needs a signed-in session. Paste an image URL for now — you can upload a photo later from your profile.",
        );
      } else if (
        caught instanceof ApiError &&
        caught.code === API_ERROR_CODES.UPLOAD_RATE_LIMITED
      ) {
        setUploadMessage(
          "Too many uploads right now. Paste an image URL and try again later.",
        );
      } else {
        toastApiError(caught, "Could not upload this image.");
      }
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3 rounded-input border border-dashed border-line bg-blush-light/60 p-4">
      <div>
        <label
          htmlFor="signup-image-file"
          className="flex cursor-pointer items-center gap-2 text-sm font-bold text-plum"
        >
          <ImagePlus aria-hidden="true" className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload profile image or paste a URL"}
        </label>
        <input
          id="signup-image-file"
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(event) => void handleFile(event)}
          className="mt-2 block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-plum file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-plum-dark disabled:opacity-60"
        />
      </div>

      {uploadMessage ? (
        <p role="status" className="text-xs leading-5 text-muted">
          {uploadMessage}
        </p>
      ) : null}

      <Input
        type="url"
        label="Profile image URL"
        placeholder="https://…"
        value={value}
        error={error}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
