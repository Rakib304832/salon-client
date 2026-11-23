import { cn } from "@/lib/utils";

/**
 * PURE BUTTON CLASS BUILDER
 * -------------------------
 * This module intentionally has NO "use client" directive.
 *
 * Next.js 16 Server Components cannot *call* a function exported from a Client
 * Module, even a pure one. `buttonStyles` is needed by Server Components such
 * as the home hero and footer CTA to style <Link> elements, so it must live in
 * its own server-safe module.
 *
 * Button.tsx still re-exports these symbols, and the ui barrel exports them
 * from here, so existing imports from "@/components/ui" keep working.
 */
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
  danger: "bg-status-blocked-text text-white hover:brightness-95",
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
 * Builds the exact same classes used by <Button> so <Link> elements can look
 * like buttons without nesting a <button> inside an <a> (invalid HTML).
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    "m-btn inline-flex items-center justify-center gap-2 rounded-full font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    loading && "pointer-events-none",
    className,
  );
}
