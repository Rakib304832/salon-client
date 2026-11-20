import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { Service } from "@/types";

/**
 * Reusable service card.
 *
 * Used by the Home featured grid and later by /services and admin previews.
 * Keeping all image/price/duration rules here means those pages cannot drift
 * apart visually.
 *
 * Image safety:
 * - next.config.ts only allows ImgBB hosts through the image optimiser.
 * - A service image can still be empty or point at an unexpected host if data
 *   is edited directly. canRenderWithNextImage() filters those cases and shows
 *   a branded fallback instead of letting next/image throw at runtime.
 */
export interface ServiceCardProps {
  service: Service;
}

function canRenderWithNextImage(src: string): boolean {
  if (!src) return false;

  try {
    const base = "https://salonbook.local";
    const url = new URL(src, base);

    // Local paths are served by Next.js itself.
    if (src.startsWith("/")) return url.protocol === "https:";

    // Remote images must match next.config.ts remotePatterns.
    return (
      url.protocol === "https:" &&
      (url.hostname === "i.ibb.co" || url.hostname === "ibb.co")
    );
  } catch {
    return false;
  }
}

export function ServiceCard({ service }: ServiceCardProps) {
  const detailHref = `/services/${service._id}`;
  const imageIsSafe = canRenderWithNextImage(service.image);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={detailHref}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block h-52 overflow-hidden bg-blush-light"
      >
        {imageIsSafe ? (
          <Image
            src={service.image}
            alt={service.serviceName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blush-light via-blush to-blush-light">
            <Sparkles aria-hidden="true" className="h-12 w-12 text-plum/40" />
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-plum shadow-sm">
          {service.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg leading-snug">
            <Link
              href={detailHref}
              className="transition-colors hover:text-rose-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
            >
              {service.serviceName}
            </Link>
          </h3>
          <span className="shrink-0 font-display text-lg font-semibold text-rose-gold">
            {formatCurrency(service.price)}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
          {service.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
            <Clock aria-hidden="true" className="h-3.5 w-3.5" />
            {formatDuration(service.duration)}
          </span>

          <Link
            href={detailHref}
            className="inline-flex items-center gap-1 text-xs font-bold text-plum transition-colors group-hover:text-rose-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
          >
            View details
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
