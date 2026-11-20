import type { ReactNode } from "react";
import { PublicFooter, PublicHeader } from "@/components/layout";

/**
 * PUBLIC ROUTE GROUP LAYOUT
 * -------------------------
 * The parentheses in `(public)` are a Next.js route group: the folder organises
 * files but does NOT appear in the URL. This layout therefore applies to `/`,
 * `/services`, and other customer-facing pages while leaving `/sign-in`,
 * `/dashboard/*`, and standalone state pages free to use different shells.
 *
 * Body structure:
 * - sticky header
 * - flexible main area (flex-1) so the footer stays at the bottom on short pages
 * - footer
 *
 * This layout is a Server Component. The header inside it is a Client
 * Component, which is allowed: Server Components can render Client Components
 * as children without turning the whole layout into client code.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
