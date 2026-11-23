"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { id, label, hint, error, className, required, rows = 4, ...props },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={textareaId} className="block text-sm font-bold text-plum">
            {label}
            {required ? <span className="ml-0.5 text-status-blocked-text">*</span> : null}
          </label>
        ) : null}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full resize-y rounded-input border border-line bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-muted focus:border-rose-gold focus:outline-none focus:ring-2 focus:ring-blush disabled:cursor-not-allowed disabled:bg-blush-light",
            error && "border-status-blocked-text focus:border-status-blocked-text focus:ring-status-blocked-bg",
            className,
          )}
          {...props}
        />

        {hint && !error ? (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-status-blocked-text">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
