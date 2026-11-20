"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getClientSession,
  getFreshUser,
  signOut as authSignOut,
} from "@/lib/auth";
import type { User, UserRole } from "@/types";

/**
 * GLOBAL AUTH PROVIDER
 * --------------------
 * One place owns "who is signed in" for the whole app. Navbars, route guards,
 * dashboards and forms all read the same context instead of each calling
 * getSession() and disagreeing for a few seconds.
 *
 * IMPORTANT ARCHITECTURE NOTE
 * - There is no Better Auth server inside this Next.js app.
 * - getClientSession() calls the Express API's /api/auth/get-session endpoint.
 * - getFreshUser() then calls /api/users/me so role/isBlocked come from the
 *   live database, not only from the cookie payload.
 *
 * The provider is a Client Component because it uses hooks and browser-side
 * cookies. It is mounted in the root layout so every route can use useAuth().
 */

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** True when the server marks this account as blocked. */
  isBlocked: boolean;
  /** Network/session error worth showing with a Retry action. */
  error: string | null;
  /** Re-reads session + fresh profile. Call after sign-in/profile updates. */
  refresh: () => Promise<User | null>;
  /** Used locally after profile saves so the UI updates without a reload. */
  setUser: (user: User | null) => void;
  signOutUser: () => Promise<void>;
  hasRole: (role: UserRole | readonly UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  /**
   * Request IDs prevent a slow first request from overwriting a newer result.
   * This matters when a user signs in and refresh() runs before the initial
   * mount check has finished.
   */
  const requestId = useRef(0);

  const load = useCallback(async (): Promise<User | null> => {
    const currentRequest = ++requestId.current;
    setStatus("loading");
    setError(null);

    try {
      const session = await getClientSession();
      if (currentRequest !== requestId.current) return null;

      if (!session) {
        setUserState(null);
        setStatus("unauthenticated");
        return null;
      }

      // getFreshUser() handles 401 (stale cookie), 403 (blocked account) and
      // network failures, so the provider receives a decision-ready value.
      const freshUser = await getFreshUser(session);
      if (currentRequest !== requestId.current) return null;

      setUserState(freshUser);
      setStatus(freshUser ? "authenticated" : "unauthenticated");
      return freshUser;
    } catch (caught) {
      if (currentRequest !== requestId.current) return null;

      setUserState(null);
      setStatus("unauthenticated");
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to check your session. Please try again.",
      );
      return null;
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Local update used by the profile page after a successful PATCH. */
  const setUser = useCallback((nextUser: User | null) => {
    setUserState(nextUser);
    setStatus(nextUser ? "authenticated" : "unauthenticated");
  }, []);

  const signOutUser = useCallback(async () => {
    // Invalidate any in-flight refresh before clearing state.
    requestId.current += 1;
    await authSignOut();
    setUserState(null);
    setStatus("unauthenticated");
    setError(null);
  }, []);

  const hasRole = useCallback(
    (role: UserRole | readonly UserRole[]) => {
      if (!user) return false;
      const allowed: readonly UserRole[] = typeof role === "string" ? [role] : role;
      return allowed.includes(user.role);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isLoading: status === "loading",
      isAuthenticated: status === "authenticated" && Boolean(user),
      isBlocked: user?.isBlocked === true,
      error,
      refresh: load,
      setUser,
      signOutUser,
      hasRole,
    }),
    [user, status, error, load, setUser, signOutUser, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth is the only supported way to read auth state.
 *
 * Throwing when no provider exists turns a missing provider into an immediate,
 * obvious development error instead of a silent `undefined.user` crash deep in
 * a dashboard page.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}
