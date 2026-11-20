import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Usually a <Link> styled with buttonStyles, or a <Button>. */
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * Used for "no services found" and "no appointments yet".
 *
 * Every empty state must include a next action, exactly as the brief requires:
 * - Browse Services -> Clear Filters
 * - My Appointments -> Explore Services
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-white px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush-light text-plum">
        {icon ?? <Sparkles aria-hidden="true" className="h-6 w-6" />}
      </div>
      <h3 className="text-xl">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
