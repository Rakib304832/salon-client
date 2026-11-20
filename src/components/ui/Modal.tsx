"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

/**
 * Accessible-ish modal shell used by details dialogs and ConfirmDialog.
 *
 * What it handles:
 * - Escape closes the dialog.
 * - Clicking the overlay closes the dialog.
 * - Body scroll is locked while open.
 * - role="dialog", aria-modal and aria-labelledby are wired correctly.
 * - Focus moves to the close button when the dialog opens.
 *
 * We deliberately avoid animation libraries; the brief asks for no unnecessary
 * animation.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-plum-dark/60"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-card bg-white shadow-xl",
          sizeStyles[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line bg-blush-light px-6 py-4">
          <div>
            <h2 id={titleId} className="text-xl">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1.5 text-plum hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">{children}</div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-white px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
