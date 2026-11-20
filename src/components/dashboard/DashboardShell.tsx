"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/components/providers";
import { Logo } from "@/components/layout";
import { Spinner, buttonStyles } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { cn, getInitials } from "@/lib/utils";

/**
 * DASHBOARD SHELL
 * ---------------
 * Shared chrome for authenticated dashboard areas. It deliberately knows only
 * a small `area` string rather than receiving an array of nav items: passing
 * React components or icon functions across a Server/Client boundary is not
 * serialisable, so the navigation table stays inside this Client Component.
 *
 * Layout strategy:
 * - desktop: a full-height plum sidebar plus a soft content column
 * - mobile: a compact top bar and a horizontally scrollable nav strip
 *
 * The shell never decides whether a user may enter an area. That is the job of
 * CustomerGuard/AdminGuard in the page layouts and, ultimately, the Express
 * API on every request.
 */
export type DashboardArea = "customer" | "admin";

interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const DASHBOARD_NAV: Record<DashboardArea, DashboardNavItem[]> = {
  customer: [
    { href: ROUTES.customerDashboard, label: "Overview", icon: LayoutDashboard },
    { href: ROUTES.customerAppointments, label: "Appointments", icon: CalendarDays },
    { href: ROUTES.customerProfile, label: "My profile", icon: UserRound },
  ],
  admin: [
    { href: ROUTES.adminDashboard, label: "Overview", icon: LayoutDashboard },
    { href: ROUTES.adminAppointments, label: "Appointments", icon: CalendarDays },
    { href: ROUTES.adminServices, label: "Services", icon: Wrench },
    { href: ROUTES.adminUsers, label: "Users", icon: Users },
    { href: ROUTES.adminTransactions, label: "Transactions", icon: CreditCard },
    { href: ROUTES.adminProfile, label: "My profile", icon: Settings },
  ],
};

const AREA_COPY: Record<DashboardArea, { eyebrow: string; home: string }> = {
  customer: { eyebrow: "Customer area", home: ROUTES.customerDashboard },
  admin: { eyebrow: "Admin area", home: ROUTES.adminDashboard },
};

export interface DashboardShellProps {
  area: DashboardArea;
  children: ReactNode;
}

export function DashboardShell({ area, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOutUser } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const navItems = DASHBOARD_NAV[area];
  const copy = AREA_COPY[area];
  const displayName = user?.name?.trim() || "SalonBook user";

  function isActive(href: string): boolean {
    // The overview route must be an exact match; otherwise it would stay active
    // on every nested dashboard page because of the shared prefix.
    if (href === copy.home) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOutUser();
      toastSuccess("Signed out", "See you again soon.");
      router.replace(ROUTES.home);
    } catch (caught) {
      toastApiError(caught, "Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-ivory lg:flex">
      {/* Desktop sidebar. text-white is repeated on links because Tailwind does
          not inherit the parent's text colour into anchor elements. */}
      <aside className="hidden w-72 shrink-0 flex-col bg-plum-dark px-6 py-8 text-white lg:flex lg:sticky lg:top-0 lg:h-screen">
        <Logo tone="light" />
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-blush">
          {copy.eyebrow}
        </p>

        <nav aria-label={`${copy.eyebrow} navigation`} className="mt-10 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-input px-4 py-3 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold",
                  active
                    ? "bg-white text-plum"
                    : "text-blush hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush text-sm font-bold text-plum">
              {getInitials(displayName)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-white">
                {displayName}
              </span>
              <span className="block truncate text-xs text-blush">{user?.email}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
          >
            {signingOut ? (
              <Spinner size="sm" label="Signing out" />
            ) : (
              <LogOut aria-hidden="true" className="h-4 w-4" />
            )}
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header and nav strip */}
        <header className="border-b border-line bg-white px-4 py-4 sm:px-6 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <Logo />
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
              aria-label="Sign out"
              className="rounded-full border border-line p-2 text-plum hover:bg-blush-light disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
            >
              {signingOut ? (
                <Spinner size="sm" label="Signing out" />
              ) : (
                <LogOut aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>

          <nav
            aria-label={`${copy.eyebrow} navigation`}
            className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold",
                    active
                      ? "bg-plum text-white"
                      : "bg-blush-light text-plum hover:bg-blush",
                  )}
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="border-b border-line bg-white/70 px-4 py-5 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-rose-gold">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                {copy.eyebrow}
              </p>
              <p className="mt-1 text-sm font-bold text-plum">
                Hello, {displayName.split(" ")[0]}
              </p>
            </div>
            <Link
              href={ROUTES.services}
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              Browse services
            </Link>
          </div>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
