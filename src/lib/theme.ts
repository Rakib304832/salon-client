/**
 * GLOBAL THEME STORE
 * ------------------
 * Theme is kept outside React state on purpose. The inline bootstrap script in
 * the root layout sets `data-theme` on <html> before the first paint, so a
 * saved dark preference never flashes the light palette. React components then
 * subscribe to that same DOM attribute through `useTheme`, which means the
 * navbar toggle, the paper-page switch and any future control stay in sync.
 */

export const THEME_STORAGE_KEY = "salonbook:theme";
export const THEME_CHANGE_EVENT = "salonbook:themechange";

export type Theme = "light" | "dark";

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

/** Reads the live theme from <html>, which is the single source of truth. */
export function getDocumentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/**
 * Writes the theme everywhere it needs to go:
 * - <html data-theme> drives every CSS variable and `[data-theme]` selector.
 * - `color-scheme` tells native controls and scrollbars which palette to use.
 * - localStorage persists the explicit choice across reloads and route changes.
 * - A DOM event wakes up every mounted `useTheme` subscriber.
 */
export function setDocumentTheme(theme: Theme): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked in private browsing; the theme still works for
    // this session because the attribute above is authoritative.
  }

  window.dispatchEvent(
    new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: theme }),
  );
}

/**
 * Kept as a string so the root layout can place it in <head> without relying on
 * a Client Component, which would run too late to prevent a theme flash.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)},t=localStorage.getItem(k),old=localStorage.getItem("salonbook:paper-theme");if(t!=="light"&&t!=="dark"){t=old==="light"||old==="dark"?old:(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}var r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t}catch(e){document.documentElement.setAttribute("data-theme","light")}})();`;
