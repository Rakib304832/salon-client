import type { Metadata } from "next";
import { AccessDenied } from "@/components/auth";

/**
 * Standalone Access Denied route.
 *
 * The RouteGuard renders the same component inline, but having a real URL is
 * useful for bookmarks, support links and direct navigation. The component is
 * a Client Component because it reads the shared auth context to choose the
 * correct dashboard link.
 */
export const metadata: Metadata = {
  title: "Access denied",
};

export default function AccessDeniedPage() {
  return <AccessDenied />;
}
