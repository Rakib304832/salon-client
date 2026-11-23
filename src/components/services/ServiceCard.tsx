import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { Service } from "@/types";
import { canRenderWithNextImage } from "./service-image";

/**
 * Reusable service card shared by Home and Browse Services. The body order
 * follows the Figma card: category, title, description, price/duration meta,
 * then the View Details action.
 */
export interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const detailHref = `/services/${service._id}`;
  const imageIsSafe = canRenderWithNextImage(service.image);

  return (
    <article className="group m-card flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-sm">
      <Link
        href={detailHref}
        tabIndex={-1}
        aria-hidden="true"
        className="m-zoom relative block h-52 overflow-hidden bg-blush-light"
      >
        {imageIsSafe ? (
          <Image
            src={service.image}
            alt={service.serviceName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            // These cards are above the fold on Browse Services; eager loading
            // avoids Next.js treating the first image as a late-discovered LCP.
            loading="eager"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blush-light via-blush to-blush-light">
            <Sparkles aria-hidden="true" className="h-12 w-12 text-plum/40" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-gold">
          {service.category}
        </p>

        <h3 className="mt-2 text-lg leading-snug">
          <Link
            href={detailHref}
            className="transition-colors hover:text-rose-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
          >
            {service.serviceName}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
          {service.description}
        </p>

        <div className="mt-auto flex items-center gap-4 border-t border-line pt-4">
          <span className="font-display text-lg font-semibold text-rose-gold">
            {formatCurrency(service.price)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
            <Clock aria-hidden="true" className="h-3.5 w-3.5" />
            {formatDuration(service.duration)}
          </span>
        </div>

        <Link
          href={detailHref}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-plum px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-plum-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2"
        >
          View Details
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
