"use client";

import { ApiError, API_BASE_URL } from "./api/client";
import { usersApi } from "./api/users";
import { authClient } from "./auth-client";
import { ROUTES } from "./constants";
import type { ClientSession, User, UserRole } from "@/types";
import type { SignInInput, SignUpInput } from "./validators";

/**
 * Thin wrappers around the Better Auth client.
 *
 * Components should call these helpers instead of touching authClient directly.
 * That keeps Google callback URLs, error handling, and the role/isBlocked cast
 * in one place.
 */

/** Role-to-dashboard mapping used by guards and auth forms. */
export function dashboardForRole(role: UserRole): string {
  return role === "admin" ? ROUTES.adminDashboard : ROUTES.customerDashboard;
}

/**
 * Better Auth's session user does not know our extra fields at type level.
 * Exported so the global AuthProvider can instantly derive role/isBlocked from
 * the session while its fresh /api/users/me request is still in flight.
 */
export function toUserFromSession(value: unknown): User | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== "string" || typeof raw.email !== "string") return null;

  const role: UserRole = raw.role === "admin" ? "admin" : "customer";

  return {
    id: raw.id,
    name: typeof raw.name === "string" ? raw.name : "SalonBook User",
    email: raw.email,
    image: typeof raw.image === "string" ? raw.image : undefined,
    role,
    isBlocked: raw.isBlocked === true,
    phone: typeof raw.phone === "string" ? raw.phone : undefined,
    createdAt:
      typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt:
      typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };
}

/** Returns Better Auth's raw session, already narrowed to our shape. */
export async function getClientSession(): Promise<ClientSession | null> {
  const result = await authClient.getSession();
  if (result.error) {
    throw new Error(result.error.message ?? "Unable to read your session.");
  }
  if (!result.data?.user) return null;
  return result.data as unknown as ClientSession;
}

/** Reads role/isBlocked from the session without an extra app-API call. */
export async function getSessionUser(): Promise<User | null> {
  const session = await getClientSession();
  return session ? toUserFromSession(session.user) : null;
}

/**
 * Turns an already-loaded Better Auth session into the freshest app user.
 *
 * Why not trust the session alone?
 * - Role and isBlocked are server-assigned and can change while a cookie is
 *   still valid. /api/users/me reads the live database record.
 * - A blocked account may receive 403 on that endpoint. We still keep the user
 *   (so the UI can show the Account Blocked screen) but force isBlocked = true.
 * - A 401 means the cookie is stale; the visitor is treated as signed out.
 * - Any other failure falls back to session data, which is better than logging
 *   someone out because of a temporary network problem.
 */
export async function getFreshUser(session: ClientSession): Promise<User | null> {
  const sessionUser = toUserFromSession(session.user);
  if (!sessionUser) return null;

  try {
    return await usersApi.me();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    if (error instanceof ApiError && error.status === 403) {
      return { ...sessionUser, isBlocked: true };
    }
    return sessionUser;
  }
}

/**
 * Fresh profile used by guards and the navbar.
 *
 * This is a convenience wrapper for code that only needs the final user. The
 * AuthProvider calls getClientSession() and getFreshUser() separately so it can
 * reuse the same session object without a second Better Auth round trip.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getClientSession();
  return session ? getFreshUser(session) : null;
}

/**
 * Optional Bearer token for endpoints that prefer Authorization headers.
 * The app API primarily uses cookies, but the server exposes /api/auth/token.
 */
export async function getAccessToken(): Promise<string | null> {
  if (!API_BASE_URL) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as { token?: string };
    return data.token ?? null;
  } catch {
    return null;
  }
}

export function signInWithEmail({ email, password }: SignInInput) {
  return authClient.signIn.email({ email, password });
}

export function signUpWithEmail({
  name,
  email,
  password,
  image,
}: SignUpInput) {
  return authClient.signUp.email({
    name,
    email,
    password,
    image: image || undefined,
  });
}

/** Google login is configured on the server; we only start the redirect. */
export function signInWithGoogle(callbackURL: string) {
  return authClient.signIn.social({
    provider: "google",
    callbackURL,
  });
}

export function signOut() {
  return authClient.signOut();
}
