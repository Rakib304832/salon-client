"use client";

import { useSyncExternalStore } from "react";
import {
  THEME_CHANGE_EVENT,
  getDocumentTheme,
  setDocumentTheme,
  type Theme,
} from "@/lib/theme";

/**
 * React bridge for the root <html data-theme> attribute.
 *
 * `useSyncExternalStore` is a better fit than an effect here: the server
 * snapshot is deliberately "light", while the client snapshot reads the
 * attribute the pre-paint script already set. React swaps snapshots after
 * hydration without a mismatch, so the toggle label can be correct without
 * delaying the first paint.
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getServerSnapshot(): Theme {
  return "light";
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    getDocumentTheme,
    getServerSnapshot,
  );

  return { theme, setTheme: setDocumentTheme };
}
