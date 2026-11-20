"use client";

import { ApiError, API_BASE_URL } from "./api/client";
import { usersApi } from "./api/users";
import { authClient } from "./auth-client";
import type { ClientSession, User, UserRole } from "@/types";
import type { SignInInput, SignUpInput } from "./validators";

/**
 * Thin wrappers around the Better Auth client.
 *
 * Components should call these helpers instead of touching authClient directly.
 * That keeps Google callback URLs, error handling, and the role/isBlocked cast
 * in one place.
 */

/** Better Auth's session user does not know our extra fields at type level. */
function normaliseUser(value: unknown): User | null {
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
  return session ? normaliseUser(session.user) : null;
}

/**
 * Fresh profile used by guards and the navbar.
 *
 * We prefer /api/users/me because block status can change while a session is
 * still valid. If that request fails for a non-session reason, the session user
 * is still a safe fallback.
 */
export async function getCurrentUser(): Promise<User | null> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  try {
    return await usersApi.me();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    return sessionUser;
  }
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
