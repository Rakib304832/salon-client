/**
 * SHARED next/image SAFETY CHECK
 * ------------------------------
 * next.config.ts allows the image optimiser to fetch only two HTTPS hosts:
 * i.ibb.co and ibb.co. Any other remote src would make next/image throw during
 * render, which would take down the whole product card or detail page.
 *
 * Service records come from the API, so their `image` field is data rather than
 * trusted source code. This helper lets cards and detail pages fall back to a
 * branded placeholder instead of crashing when a value is empty or unexpected.
 *
 * This module has no "use client" directive: it is a pure function usable from
 * both Server and Client Components.
 */
const ALLOWED_IMAGE_HOSTS = new Set(["i.ibb.co", "ibb.co"]);

export function canRenderWithNextImage(src: string | null | undefined): boolean {
  if (!src || src.trim().length === 0) return false;

  try {
    // A relative local path is always served by Next.js itself.
    if (src.startsWith("/")) return true;

    const url = new URL(src);
    return url.protocol === "https:" && ALLOWED_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
