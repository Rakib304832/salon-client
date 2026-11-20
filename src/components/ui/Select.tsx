"use client";

import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      id,
      label,
      hint,
      error,
      options,
      placeholder,
      className,
      required,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const hintId = hint ? `${selectId}-hint` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={selectId} className="block text-sm font-bold text-plum">
            {label}
            {required ? <span className="ml-0.5 text-[#B24A4A]">*</span> : null}
          </label>
        ) : null}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "w-full appearance-none rounded-input border border-line bg-white px-3.5 py-2.5 pr-10 text-sm text-text focus:border-rose-gold focus:outline-none focus:ring-2 focus:ring-blush disabled:cursor-not-allowed disabled:bg-blush-light",
              error && "border-[#B24A4A] focus:border-[#B24A4A] focus:ring-[#F6DCDC]",
              className,
            )}
            {...props}
          >
            {placeholder ? <option value="">{placeholder}</option> : null}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />
        </div>

        {hint && !error ? (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-[#B24A4A]">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
