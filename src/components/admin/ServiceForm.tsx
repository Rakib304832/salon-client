"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, UploadCloud } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { servicesApi, uploadsApi } from "@/lib/api";
import { API_CATEGORIES } from "@/lib/constants";
import {
  firstFieldError,
  serviceFormSchema,
  type ServiceFormInput,
  type ServiceFormValues,
} from "@/lib/validators";
import { canRenderWithNextImage } from "@/components/services/service-image";
import { ApiError } from "@/lib/api/client";
import { toastApiError, toastSuccess } from "@/lib/toast";
import type { Service } from "@/types";

/**
 * ADMIN SERVICE FORM
 * ------------------
 * Used by one modal for both "Create service" and "Edit service". The parent
 * supplies an existing service for edits and a `key` for new forms, so this
 * component never has to reset stale state when the dialog reopens.
 *
 * Images are upload-based: choosing a JPEG/PNG/WebP file uploads it to the
 * authenticated /api/uploads endpoint when the form is saved, and the returned
 * ImgBB URL becomes the service image. Edit mode may keep the existing image if
 * no new file is selected. The private ImgBB key stays on Express.
 *
 * Status is editable here for admin convenience, but it is applied through
 * PATCH /:id/status because the create/update content schema ignores it.
 */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export interface ServiceFormProps {
  /** Omit for create mode; provide the existing record for edit mode. */
  service?: Service | null;
  onSuccess: (service: Service) => void;
  onCancel: () => void;
}

export function ServiceForm({
  service,
  onSuccess,
  onCancel,
}: ServiceFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<ServiceFormValues, unknown, ServiceFormInput>({
    resolver: zodResolver(serviceFormSchema),
    mode: "onBlur",
    defaultValues: {
      serviceName: service?.serviceName ?? "",
      category: service?.category as ServiceFormInput["category"] | undefined,
      description: service?.description ?? "",
      price: service?.price ?? 0,
      duration: service?.duration ?? 0,
      image: service?.image ?? "",
      status: service?.status ?? "active",
    },
  });

  const imageValue = useWatch({ control: form.control, name: "image" });
  const imageIsSafe = canRenderWithNextImage(imageValue);
  const imageError = uploadError ?? form.formState.errors.image?.message;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setUploadError(null);
    form.clearErrors("image");

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

  async function onSubmit(values: ServiceFormInput) {
    setUploadError(null);

    // The hidden image field holds either the existing URL (edit mode) or the
    // URL returned by /api/uploads. Create mode has no fallback URL.
    let imageUrl = values.image.trim();

    if (!imageUrl && !selectedFile) {
      form.setError("image", { message: "Upload a service image." });
      return;
    }

    if (selectedFile) {
      try {
        const uploaded = await uploadsApi.uploadImage(selectedFile);
        imageUrl = uploaded.url;
        form.setValue("image", imageUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } catch (caught) {
        setUploadError("The image could not be uploaded. Please try again.");
        toastApiError(caught, "Could not upload this image.");
        return;
      }
    }

    // Status is form-only state: the content endpoint ignores it. It is applied
    // separately after the content save so create/update payloads stay strict.
    const { status, ...content } = values;
    const payload = {
      serviceName: content.serviceName.trim(),
      category: content.category,
      description: content.description.trim(),
      price: content.price,
      duration: content.duration,
      image: imageUrl,
    };

    let saved: Service;

    try {
      saved = service
        ? await servicesApi.update(service._id, payload)
        : await servicesApi.create(payload);
    } catch (caught) {
      const apiError = caught instanceof ApiError ? caught : null;

      // The API returns validation details keyed by field name. Show them inline
      // as well as in the toast so the admin knows exactly which box to fix.
      (["serviceName", "category", "description", "price", "duration", "image"] as const)
        .forEach((field) => {
          const message = firstFieldError(apiError?.errors, field);
          if (message) form.setError(field, { message });
        });

      toastApiError(caught, "Could not save this service.");
      return;
    }

    const statusChanged = status !== (service?.status ?? "active");
    if (statusChanged) {
      try {
        saved = await servicesApi.setStatus(saved._id, status);
      } catch (caught) {
        // The content save already succeeded. Close with that object so the list
        // does not go stale, and tell the admin exactly what still needs a retry.
        toastApiError(caught, "Service saved, but its status could not be updated.");
        onSuccess(saved);
        return;
      }
    }

    toastSuccess(
      service ? "Service updated" : "Service created",
      statusChanged
        ? `The catalogue now shows this service as ${status}.`
        : service
          ? "The catalogue now shows your changes."
          : "Your new service is live.",
    );
    onSuccess(saved);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="hidden" {...form.register("image")} />

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-card border border-line bg-blush-light">
          {imageIsSafe ? (
            <Image
              src={imageValue}
              alt="Service preview"
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus aria-hidden="true" className="h-8 w-8 text-plum/40" />
          )}
        </div>

        <div className="min-w-[220px] flex-1 space-y-3">
          <Input
            type="file"
            label="Service image file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            hint={
              service
                ? "JPEG, PNG or WebP up to 5 MB. Leave empty to keep the current image."
                : "JPEG, PNG or WebP up to 5 MB. An image is required."
            }
            error={imageError ?? undefined}
          />
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <UploadCloud aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-rose-gold" />
            Uploading happens when you save. The ImgBB key stays on the server.
          </p>
        </div>
      </div>

      <Input
        label="Service name"
        required
        placeholder="e.g. Classic Facial"
        error={form.formState.errors.serviceName?.message}
        {...form.register("serviceName")}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Category"
          required
          options={API_CATEGORIES.map((category) => ({
            value: category,
            label: category,
          }))}
          placeholder="Choose a category"
          error={form.formState.errors.category?.message}
          {...form.register("category")}
        />

        <Select
          label="Status"
          required
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          placeholder="Choose a status"
          error={form.formState.errors.status?.message}
          {...form.register("status")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Price (USD)"
          type="number"
          min="0.01"
          max="100000"
          step="0.01"
          required
          placeholder="45"
          error={form.formState.errors.price?.message}
          {...form.register("price")}
        />

        <Input
          label="Duration (minutes)"
          type="number"
          min="1"
          max="600"
          step="1"
          required
          placeholder="60"
          error={form.formState.errors.duration?.message}
          {...form.register("duration")}
        />
      </div>

      <Textarea
        label="Description"
        required
        rows={4}
        placeholder="Tell customers what this service includes..."
        error={form.formState.errors.description?.message}
        {...form.register("description")}
      />

      <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="accent"
          loading={form.formState.isSubmitting}
        >
          {service ? "Save changes" : "Create service"}
        </Button>
      </div>
    </form>
  );
}
