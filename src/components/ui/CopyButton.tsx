"use client";

import { Copy } from "lucide-react";
import { Button } from "./Button";
import { toastError, toastSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";

export interface CopyButtonProps {
  /** The full value to copy — never the shortened display string. */
  value: string;
  label?: string;
  className?: string;
}

/**
 * Used next to shortened Stripe session IDs on the transactions page.
 *
 * The button copies the FULL session ID while the table shows only the first
 * eight characters via shortenSessionId(). Feedback goes through lib/toast,
 * never browser alert().
 */
export function CopyButton({
  value,
  label = "Copy session ID",
  className,
}: CopyButtonProps) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      toastSuccess("Session ID copied");
    } catch {
      toastError("Could not copy. Please try again.");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      title={label}
      onClick={() => void handleCopy()}
      className={cn("h-8 w-8 px-0", className)}
    >
      <Copy aria-hidden="true" className="h-4 w-4" />
    </Button>
  );
}
