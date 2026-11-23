"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
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
import { BookingCard } from "./BookingCard";
import { IncludedList } from "./IncludedList";
import { canRenderWithNextImage } from "./service-image";

/**
 * SERVICE DETAIL
 * --------------
 * Fetches one active-or-archived service by id and presents the Figma
 * hierarchy: breadcrumb, image plus What's included on the left, service
 * overview and booking card on the right.
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
        <Skeleton className="h-4 w-64" />
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
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted">
            <li>
              <Link href={ROUTES.home} className="hover:text-plum">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link href={ROUTES.services} className="hover:text-plum">
                Browse Services
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="font-bold text-plum">
              {service.serviceName}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="overflow-hidden rounded-card border border-line bg-white shadow-sm">
              <div className="relative h-72 bg-blush-light sm:h-[420px]">
                {imageIsSafe ? (
                  <Image
                    src={service.image}
                    alt={service.serviceName}
                    fill
                    sizes="(max-width: 1024px) 100vw, 52vw"
                    // The hero image is the page's main visual and can be LCP.
                    loading="eager"
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

            <IncludedList service={service} />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="rose">{service.category}</Badge>
                <ServiceStatusBadge status={service.status} />
              </div>

              <h1 className="mt-4 text-3xl leading-tight sm:text-4xl">
                {service.serviceName}
              </h1>

              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-muted">
                {service.description}
              </p>
            </div>

            {service.status === "active" ? (
              <BookingCard service={service} />
            ) : (
              <div className="rounded-card border border-dashed border-line bg-white p-6">
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
