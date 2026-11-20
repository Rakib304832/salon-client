"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  // Plum is the primary brand colour and is used for main form actions.
  primary: "bg-plum text-white hover:bg-plum-dark",
  // Rose gold is the main call-to-action colour from the design tokens.
  accent: "bg-rose-gold text-white hover:brightness-95",
  outline: "border border-plum bg-white text-plum hover:bg-blush-light",
  ghost: "bg-transparent text-plum hover:bg-blush-light",
  danger: "bg-[#B24A4A] text-white hover:brightness-95",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-sm",
};

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * buttonStyles is exported so <Link> elements can look exactly like buttons
 * without nesting a <button> inside an <a> (which is invalid HTML).
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    loading && "pointer-events-none",
    className,
  );
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonStyleOptions {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant,
      size,
      fullWidth,
      loading = false,
      className,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonStyles({ variant, size, fullWidth, loading, className })}
        {...props}
      >
        {/* Never render stale icons while the action is in progress. */}
        {loading ? <Spinner size="sm" label="Please wait" /> : leftIcon}
        {children}
        {!loading ? rightIcon : null}
      </button>
    );
  },
);
