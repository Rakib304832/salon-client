import { cn } from "@/lib/utils";

export interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Visible to screen readers only; keeps loading states accessible. */
  label?: string;
}

const sizeStyles: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
};

/**
 * Spinner is used INSIDE buttons and page states for in-progress actions.
 *
 * It is intentionally not marked "use client" because it has no state or
 * handlers. When imported by a Client Component it is bundled as client code
 * automatically; when imported by a Server Component it renders on the server.
 */
export function Spinner({
  className,
  size = "md",
  label = "Loading",
}: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center">
      <span
        aria-hidden="true"
        className={cn(
          "animate-spin rounded-full border-current border-t-transparent",
          sizeStyles[size],
          className,
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
