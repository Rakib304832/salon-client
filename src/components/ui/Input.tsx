"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, leadingIcon, className, required, ...props },
  ref,
) {
  // useId keeps label/input/error links correct even when several inputs of
  // the same type appear on one page and no explicit id was provided.
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-bold text-plum">
          {label}
          {required ? <span className="ml-0.5 text-status-blocked-text">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        {leadingIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          >
            {leadingIcon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full rounded-input border border-line bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-muted focus:border-rose-gold focus:outline-none focus:ring-2 focus:ring-blush disabled:cursor-not-allowed disabled:bg-blush-light",
            leadingIcon && "pl-10",
            error && "border-status-blocked-text focus:border-status-blocked-text focus:ring-status-blocked-bg",
            className,
          )}
          {...props}
        />
      </div>

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
});
