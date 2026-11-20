"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * Inline error state for failed API requests.
 *
 * The brief requires an inline error WITH a retry button. Toast feedback alone
 * is not enough because the user needs a visible way to recover on that page.
 */
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-line bg-white px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-status-blocked-bg text-status-blocked-text">
        <AlertCircle aria-hidden="true" className="h-6 w-6" />
      </div>
      <h3 className="text-xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted">{message}</p>
      {onRetry ? (
        <Button className="mt-6" variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
