"use client";

import { createAuthClient } from "better-auth/react";
import { API_BASE_URL } from "./api/client";

/**
 * The ONLY Better Auth client in this repository.
 *
 * Part 1 removed the accidental in-Next.js auth server (MongoDB + route handler)
 * because authentication lives on the Express API. This client therefore points
 * at NEXT_PUBLIC_API_URL and uses Better Auth's default /api/auth base path,
 * which matches the server's mounted handler.
 *
 * Why credentials are explicit:
 * - Client and server are on different origins in production.
 * - Cross-site session cookies require credentials: "include".
 * - Without it, getSession() would always look signed out and CORS/cookie
 *   errors would appear in the browser.
 */
export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
});
