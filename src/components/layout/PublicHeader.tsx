"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/components/providers";
import { buttonStyles, Spinner } from "@/components/ui";
import { dashboardForRole } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { getInitials } from "@/lib/utils";
import { Logo } from "./Logo";

/**
 * PUBLIC HEADER / NAVBAR
 * ----------------------
 * Shown on every route inside the (public) route group: Home, Services and any
 * future public detail pages. Auth pages deliberately use a different shell.
 *
 * Why this is a Client Component:
 * - It reads the shared auth context to decide between Sign in and Dashboard.
 * - It owns the mobile menu open/closed state.
 * - It signs the user out with router navigation afterwards.
 *
 * The Express API remains the security boundary. This header only changes what
 * the user sees; it never decides whether an API action is allowed.
 */

interface NavLink {
  href: string;
  label: string;
  /** Exact match for Home, prefix match for section pages. */
  exact?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: ROUTES.home, label: "Home", exact: true },
  { href: ROUTES.services, label: "Services" },
  { href: `${ROUTES.home}#why-us`, label: "Why SalonBook" },
];

function isActive(pathname: string, link: NavLink): boolean {
  if (link.href.includes("#")) return false; // hash links are not pages
  return link.exact ? pathname === link.href : pathname.startsWith(link.href);
}

interface AuthActionsProps {
  /** Closes the mobile drawer after a navigation or sign-out. */
  onNavigate?: () => void;
}

function AuthActions({ onNavigate }: AuthActionsProps) {
  const { user, isLoading, isBlocked, signOutUser } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    try {
      await signOutUser();
      toastSuccess("You have been signed out");
      onNavigate?.();
      router.replace(ROUTES.home);
    } catch (error) {
      toastApiError(error, "Could not sign out. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-10 w-28 items-center justify-center">
        <Spinner size="sm" label="Checking session" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={ROUTES.signIn}
          onClick={onNavigate}
          className="hidden rounded-full px-4 py-2 text-sm font-bold text-plum hover:bg-blush-light focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold sm:inline-flex"
        >
          Sign in
        </Link>
        <Link
          href={ROUTES.signUp}
          onClick={onNavigate}
          className={buttonStyles({ variant: "accent", size: "sm" })}
        >
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isBlocked ? (
        <Link
          href={ROUTES.accountBlocked}
          onClick={onNavigate}
          className="rounded-full bg-status-blocked-bg px-3 py-2 text-xs font-bold text-status-blocked-text"
        >
          Blocked
        </Link>
      ) : (
        <Link
          href={dashboardForRole(user.role)}
          onClick={onNavigate}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-plum hover:bg-blush-light focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
        >
          <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
          <span className="hidden lg:inline">Dashboard</span>
        </Link>
      )}

      <span
        title={user.name}
        aria-label={`Signed in as ${user.name}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-xs font-bold text-plum"
      >
        {getInitials(user.name)}
      </span>

      <button
        type="button"
        onClick={() => void handleSignOut()}
        aria-label="Sign out"
        title="Sign out"
        className="rounded-full p-2 text-muted transition-colors hover:bg-blush-light hover:text-plum focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Escape is the expected keyboard shortcut for closing any temporary overlay.
  // The mobile menu is small, but supporting it keeps navigation predictable for
  // keyboard and screen-reader users.
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link) ? "page" : undefined}
              className={`rounded-full px-1 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold ${
                isActive(pathname, link)
                  ? "text-sm font-bold text-rose-gold"
                  : "text-sm font-medium text-muted transition-colors hover:text-plum"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <AuthActions />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="public-mobile-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="rounded-full p-2 text-plum hover:bg-blush-light focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold md:hidden"
        >
          {menuOpen ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>

      {/*
        The mobile drawer is rendered only when open. Each link closes it so the
        user never lands on a new page with the menu still covering the content.
      */}
      {menuOpen ? (
        <nav
          id="public-mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-line bg-white px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-plum hover:bg-blush-light focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <AuthActions onNavigate={() => setMenuOpen(false)} />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
