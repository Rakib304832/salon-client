"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./useTheme";

/**
 * GLOBAL THEME CONTROL
 * --------------------
 * The `local` flag marks controls mounted inside an app shell. A single
 * fixed fallback in the root layout hides itself whenever one of these local
 * controls exists, so every page gets exactly one visible switch.
 *
 * Both variants read and write the same root attribute through `useTheme`;
 * neither owns private theme state. That is what lets the paper-page switch
 * and the navbar switch stay in sync.
 */
export interface ThemeToggleProps {
  variant?: "icon" | "segmented";
  local?: boolean;
  className?: string;
}

export function ThemeToggle({
  variant = "icon",
  local = false,
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const localClass = local ? "theme-toggle-local" : undefined;

  if (variant === "segmented") {
    return (
      <div
        role="group"
        aria-label="Colour theme"
        className={cn("theme-segmented", localClass, className)}
      >
        <button
          type="button"
          aria-pressed={theme === "light"}
          onClick={() => setTheme("light")}
          className="theme-segmented-option"
        >
          <Sun aria-hidden="true" className="h-4 w-4" />
          Light
        </button>
        <button
          type="button"
          aria-pressed={theme === "dark"}
          onClick={() => setTheme("dark")}
          className="theme-segmented-option"
        >
          <Moon aria-hidden="true" className="h-4 w-4" />
          Dark
        </button>
      </div>
    );
  }

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      onClick={() => setTheme(nextTheme)}
      className={cn(
        "theme-toggle",
        localClass,
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-plum transition-colors hover:bg-blush-light focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold",
        className,
      )}
    >
      {/* CSS chooses the visible icon from `[data-theme]` so the control has
          the right glyph even before React hydrates. */}
      <Sun aria-hidden="true" className="theme-icon theme-icon-sun h-5 w-5" />
      <Moon aria-hidden="true" className="theme-icon theme-icon-moon h-5 w-5" />
    </button>
  );
}
