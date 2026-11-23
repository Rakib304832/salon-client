import { ROUTES } from "@/lib/constants";
import type {
  ApiEnvelope,
  ApiErrorDetail,
} from "@/types";

/**
 * ONE fetch wrapper for every app-API request.
 *
 * Rules enforced here so individual pages do not have to remember them:
 * - API origin always comes from NEXT_PUBLIC_API_URL (never hardcoded).
 * - credentials: "include" on every call, so cross-site Better Auth cookies work.
 * - query params are built in one place.
 * - multipart uploads do not get a manual Content-Type header.
 * - { success, data, message } envelopes are unwrapped into `data`.
 * - all failures become a single ApiError type.
 * - 401 redirects to /sign-in with a return URL.
 * - 403 is NOT redirected; guards/pages render the Access Denied or Blocked UI.
 *
 * Better Auth routes are handled by lib/auth-client.ts instead, because those
 * endpoints use their own response format.
 */

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
  /\/+$/,
  "",
);

if (!API_BASE_URL && process.env.NODE_ENV !== "production") {
  // Development-only hint. We do not throw at module load because next build
  // must still succeed before env files are configured on a new machine.
  console.warn(
    "[SalonBook] NEXT_PUBLIC_API_URL is not set. Add it to .env.local as the API origin (e.g. http://localhost:5000, without /api) and restart the dev server.",
  );
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly errors?: ApiErrorDetail[];

  constructor({
    message,
    status,
    code,
    errors,
  }: {
    message: string;
    status: number;
    code?: string;
    errors?: ApiErrorDetail[];
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  /** JSON body. Automatically stringified and given the right Content-Type. */
  body?: unknown;
  /** FormData for image uploads. Content-Type is left to the browser. */
  rawBody?: FormData;
  params?: QueryParams;
  /** Use for silent checks that must not redirect on 401. */
  skipAuthRedirect?: boolean;
  /** Set false only for non-enveloped endpoints (none in the app API today). */
  parseEnvelope?: boolean;
}

export function apiUrl(path: string, params?: QueryParams): string {
  if (!API_BASE_URL) {
    throw new ApiError({
      message:
        "API URL is not configured. Set NEXT_PUBLIC_API_URL in .env.local to the API origin, then restart the dev server.",
      status: 500,
      code: "MISSING_API_URL",
    });
  }

  const url = new URL(path.startsWith("/") ? path : `/${path}`, API_BASE_URL);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    // Empty filters must be omitted so the server does not receive category=.
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function buildHeaders(
  headers: HeadersInit | undefined,
  body: unknown,
  rawBody: FormData | undefined,
): Headers {
  const result = new Headers(headers);
  result.set("Accept", "application/json");

  if (!rawBody && body !== undefined && !result.has("Content-Type")) {
    result.set("Content-Type", "application/json");
  }

  return result;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    // A non-JSON error body is still useful as a message.
    return { message: text };
  }
}

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return typeof value === "object" && value !== null && "success" in value;
}

function extractFailure(payload: unknown, statusText: string) {
  const object =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : {};

  const message =
    typeof object.message === "string" && object.message.trim()
      ? object.message
      : statusText || "Request failed.";

  const code = typeof object.code === "string" ? object.code : undefined;
  const errors = Array.isArray(object.errors)
    ? (object.errors as ApiErrorDetail[])
    : undefined;

  return { message, code, errors };
}

function redirectToSignIn(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === ROUTES.signIn) return;

  const returnTo = `${window.location.pathname}${window.location.search}`;

  // A 401 can arrive from any async API call, not from a component event. A
  // full-document navigation is therefore correct here. Building an absolute
  // URL also avoids Next.js's "relative location.assign" lint warning.
  const target = new URL(ROUTES.signIn, window.location.origin);
  target.searchParams.set("returnTo", returnTo);
  window.location.assign(target.toString());
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    body,
    rawBody,
    params,
    headers,
    skipAuthRedirect = false,
    parseEnvelope = true,
    ...init
  } = options;

  const response = await fetch(apiUrl(path, params), {
    ...init,
    credentials: "include",
    headers: buildHeaders(headers, body, rawBody),
    body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    const failure = extractFailure(payload, response.statusText);
    if (response.status === 401 && !skipAuthRedirect) redirectToSignIn();

    throw new ApiError({
      message: failure.message,
      status: response.status,
      code: failure.code,
      errors: failure.errors,
    });
  }

  // Defensive: a 2xx response with success:false is still a failure.
  if (isEnvelope(payload) && payload.success === false) {
    throw new ApiError({
      message: payload.message,
      status: response.status,
      code: payload.code,
      errors: payload.errors,
    });
  }

  if (!parseEnvelope) return payload as T;
  if (isEnvelope(payload) && payload.success) return payload.data as T;

  // Graceful fallback for an endpoint that returns bare data. The server's
  // documented format is enveloped, but this keeps the client resilient.
  return payload as T;
}

/** Thin verb helpers keep endpoint modules readable. */
export const api = {
  get<T>(path: string, options: ApiRequestOptions = {}) {
    return apiFetch<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, options: ApiRequestOptions = {}) {
    return apiFetch<T>(path, { ...options, method: "POST" });
  },
  put<T>(path: string, options: ApiRequestOptions = {}) {
    return apiFetch<T>(path, { ...options, method: "PUT" });
  },
  patch<T>(path: string, options: ApiRequestOptions = {}) {
    return apiFetch<T>(path, { ...options, method: "PATCH" });
  },
  delete<T>(path: string, options: ApiRequestOptions = {}) {
    return apiFetch<T>(path, { ...options, method: "DELETE" });
  },
};
