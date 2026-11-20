"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import { BookingForm } from "@/components/booking";
import {
  Badge,
  EmptyState,
  ErrorState,
  ServiceStatusBadge,
  Skeleton,
  buttonStyles,
} from "@/components/ui";
import { ApiError, servicesApi } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { Service } from "@/types";
import { canRenderWithNextImage } from "./service-image";

/**
 * SERVICE DETAIL
 * --------------
 * The public detail page is reached from both the Home featured grid and the
 * /services results grid. It does two jobs:
 *
 * 1. Fetch one active-or-archived service by id and present its full details.
 * 2. Render the booking form only when the service is currently active.
 *
 * The detail request is client-side for the same reason the browse grid is: the
 * Express origin comes from NEXT_PUBLIC_API_URL, and this repo stays a pure
 * client with no server route of its own.
 *
 * A response is tagged with the request key that produced it. That prevents a
 * slow response for service A from overwriting service B after a fast client
 * navigation between two detail pages.
 */
interface DetailState {
  key: string;
  service: Service | null;
  error: string | null;
  notFound: boolean;
}

export interface ServiceDetailProps {
  serviceId: string;
}

export function ServiceDetail({ serviceId }: ServiceDetailProps) {
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<DetailState | null>(null);

  const requestKey = `${serviceId}\u0000${reloadCount}`;
  const loading = state?.key !== requestKey;
  const service = state?.key === requestKey ? state.service : null;
  const error = state?.key === requestKey ? state.error : null;
  const notFound = state?.key === requestKey && state.notFound;

  useEffect(() => {
    let active = true;

    servicesApi
      .getById(serviceId)
      .then((data) => {
        if (!active) return;
        setState({ key: requestKey, service: data, error: null, notFound: false });
      })
      .catch((caught: unknown) => {
        if (!active) return;

        if (caught instanceof ApiError && caught.status === 404) {
          setState({ key: requestKey, service: null, error: null, notFound: true });
          return;
        }

        setState({
          key: requestKey,
          service: null,
          notFound: false,
          error:
            caught instanceof Error && caught.message
              ? caught.message
              : "We could not load this service.",
        });
      });

    return () => {
      active = false;
    };
  }, [serviceId, requestKey]);

  function handleRetry() {
    setReloadCount((count) => count + 1);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-32" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <Skeleton className="h-[420px] w-full rounded-card" />
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-10 w-3/4" />
            <Skeleton className="mt-5 h-20 w-full" />
            <Skeleton className="mt-6 h-12 w-40" />
          </div>
        </div>
      </div>
    );
  }

  // Check the explicit error before the generic "no service" branch. A failed
  // request must show its retry message, not be disguised as a 404.
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState
          title="Could not load this service"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title={notFound ? "Service not found" : "Service unavailable"}
          description={
            notFound
              ? "This link may be out of date. Browse the full menu to find something similar."
              : "We could not open this service right now."
          }
          action={
            notFound ? (
              <Link
                href={ROUTES.services}
                className={buttonStyles({ variant: "primary" })}
              >
                Browse services
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleRetry}
                className={buttonStyles({ variant: "outline" })}
              >
                Try again
              </button>
            )
          }
        />
      </div>
    );
  }

  const imageIsSafe = canRenderWithNextImage(service.image);

  return (
    <main className="bg-ivory py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href={ROUTES.services}
          className="inline-flex items-center gap-2 text-sm font-bold text-plum transition-colors hover:text-rose-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to services
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="overflow-hidden rounded-card border border-line bg-white shadow-sm">
            <div className="relative h-72 bg-blush-light sm:h-[420px]">
              {imageIsSafe ? (
                <Image
                  src={service.image}
                  alt={service.serviceName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blush-light via-blush to-blush-light">
                  <Sparkles aria-hidden="true" className="h-20 w-20 text-plum/30" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 divide-x divide-line border-t border-line">
              <div className="px-4 py-5 text-center">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Price
                </span>
                <span className="mt-1 block font-display text-lg font-semibold text-rose-gold">
                  {formatCurrency(service.price)}
                </span>
              </div>
              <div className="px-4 py-5 text-center">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Duration
                </span>
                <span className="mt-1 block text-sm font-bold text-plum">
                  {formatDuration(service.duration)}
                </span>
              </div>
              <div className="px-4 py-5 text-center">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Category
                </span>
                <span className="mt-1 block text-xs font-bold text-plum">
                  {service.category}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="rose">
                <Tag aria-hidden="true" className="h-3 w-3" />
                {service.category}
              </Badge>
              <ServiceStatusBadge status={service.status} />
            </div>

            <h1 className="mt-4 text-3xl leading-tight sm:text-4xl">
              {service.serviceName}
            </h1>

            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-muted">
              {service.description}
            </p>

            <div className="mt-7 flex items-start gap-3 rounded-card border border-line bg-white p-4">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-plum"
              />
              <p className="text-xs leading-6 text-muted">
                Your request starts as <strong>Pending</strong>. The salon
                confirms it before payment becomes available. Time slots are
                salon-wide, so an already-booked slot will be rejected by the
                server.
              </p>
            </div>

            {service.status === "active" ? (
              <div className="mt-8 rounded-card border border-line bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock aria-hidden="true" className="h-5 w-5 text-rose-gold" />
                  <h2 className="text-xl">Request an appointment</h2>
                </div>
                <p className="mt-2 text-sm text-muted">
                  Choose a future date and one of the salon&apos;s fixed hourly
                  slots.
                </p>
                <div className="mt-6">
                  <BookingForm service={service} />
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-card border border-dashed border-line bg-white p-6">
                <h2 className="text-xl">Currently unavailable</h2>
                <p className="mt-2 text-sm text-muted">
                  This service is not open for new bookings. Browse the menu to
                  find an active alternative.
                </p>
                <Link
                  href={ROUTES.services}
                  className={buttonStyles({ variant: "outline", className: "mt-5" })}
                >
                  Browse services
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
