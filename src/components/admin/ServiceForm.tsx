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
 * Images follow the server's two supported paths:
 * 1. paste an HTTPS URL (useful when reusing an existing ImgBB link)
 * 2. choose a JPEG/PNG/WebP file, upload it to /api/uploads, then submit the
 *    returned URL with the service payload
 *
 * The private ImgBB key stays on Express. This browser only ever sees the
 * public URL returned by the authenticated upload endpoint.
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
    },
  });

  const imageValue = useWatch({ control: form.control, name: "image" });
  const imageIsSafe = canRenderWithNextImage(imageValue);

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

  async function onSubmit(values: ServiceFormInput) {
    setUploadError(null);

    // Start with the pasted URL. A selected file uploads first and wins, so the
    // admin never has to copy the returned ImgBB URL back into the form.
    let imageUrl = values.image.trim();

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

    // Status is intentionally excluded: create defaults to active on the server
    // and status changes go through servicesApi.setStatus from the list screen.
    const payload = {
      serviceName: values.serviceName.trim(),
      category: values.category,
      description: values.description.trim(),
      price: values.price,
      duration: values.duration,
      image: imageUrl,
    };

    try {
      const saved = service
        ? await servicesApi.update(service._id, payload)
        : await servicesApi.create(payload);

      toastSuccess(
        service ? "Service updated" : "Service created",
        service ? "The catalogue now shows your changes." : "Your new service is live.",
      );
      onSuccess(saved);
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
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
            hint="JPEG, PNG or WebP up to 5 MB. Uploaded through the authenticated API."
            error={uploadError ?? undefined}
          />
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <UploadCloud aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-rose-gold" />
            Uploading happens when you save. You can also paste a URL instead.
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

        <Input
          label="Image URL"
          required
          placeholder="https://i.ibb.co/..." 
          error={form.formState.errors.image?.message}
          {...form.register("image")}
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
