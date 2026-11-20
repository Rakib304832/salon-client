import Link from "next/link";
import { Scissors } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * SalonBook wordmark.
 *
 * This is intentionally a Server Component: it has no hooks or handlers.
 * Both the public header (client) and the auth layout (server) can render it.
 *
 * `tone="light"` is used on dark plum surfaces such as the footer and the auth
 * brand panel, so the text never disappears into the background.
 */
export interface LogoProps {
  className?: string;
  tone?: "plum" | "light";
}

export function Logo({ className, tone = "plum" }: LogoProps) {
  const isLight = tone === "light";

  return (
    <Link
      href={ROUTES.home}
      aria-label="SalonBook home"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:rotate-6",
          isLight ? "bg-white text-plum" : "bg-plum text-white",
        )}
      >
        <Scissors aria-hidden="true" className="h-5 w-5" />
      </span>

      <span
        className={cn(
          "font-display text-xl font-semibold tracking-tight",
          isLight ? "text-white" : "text-plum",
        )}
      >
        Salon
        <span className={isLight ? "text-blush" : "text-rose-gold"}>Book</span>
      </span>
    </Link>
  );
}
