import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export interface CategoryCardProps {
  number: number;
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Numbered category tile from the Figma home screen. The whole card is a link;
 * the visible "Explore" affordance is decorative because a nested link would be
 * invalid HTML and confusing for keyboard users.
 */
export function CategoryCard({
  number,
  label,
  href,
  icon: Icon,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group m-card flex min-h-40 flex-col justify-between rounded-card border border-line bg-ivory p-5 hover:bg-blush-light focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2"
    >
      <span className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-plum shadow-sm transition-colors group-hover:bg-plum group-hover:text-white">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-semibold text-blush transition-colors group-hover:text-rose-gold">
          {String(number).padStart(2, "0")}
        </span>
      </span>

      <span className="mt-6 block">
        <span className="block text-base font-bold leading-snug text-plum">
          {label}
        </span>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-gold">
          Explore
          <ArrowRight
            aria-hidden="true"
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
          />
        </span>
      </span>
    </Link>
  );
}
