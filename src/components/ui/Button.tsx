"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Spinner } from "./Spinner";
import { buttonStyles } from "./button-styles";
import type { ButtonStyleOptions } from "./button-styles";

/**
 * The style builder lives in ./button-styles (without "use client") so Server
 * Components can call it for <Link> styling. Re-exporting here keeps older
 * direct imports from "./Button" working.
 */
export { buttonStyles } from "./button-styles";
export type {
  ButtonSize,
  ButtonStyleOptions,
  ButtonVariant,
} from "./button-styles";

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
