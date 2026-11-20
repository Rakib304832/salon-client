import { api, type ApiRequestOptions } from "./client";
import type { ProfileInput, User, UserRole } from "@/types";

export interface AdminUserQuery {
  search?: string;
  role?: UserRole;
  isBlocked?: boolean;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * User endpoints.
 *
 * The server also exposes a role-change endpoint, but it is deliberately NOT
 * exposed here: the assignment says roles are server-assigned and the admin UI
 * only blocks/unblocks customers.
 */
export const usersApi = {
  /**
   * Silent session refresh: a 401 here means "not signed in", not "go log in
   * right now". Guards handle the redirect with a proper return URL.
   */
  me(options: ApiRequestOptions = {}) {
    return api.get<User>("/api/users/me", {
      skipAuthRedirect: true,
      ...options,
    });
  },

  updateMe(input: ProfileInput) {
    return api.patch<User>("/api/users/me", { body: input });
  },

  adminList(params: AdminUserQuery = {}) {
    return api.get<User[]>("/api/admin/users", { params });
  },

  adminGetById(id: string) {
    return api.get<User>(`/api/admin/users/${encodeURIComponent(id)}`);
  },

  setBlocked(id: string, isBlocked: boolean) {
    return api.patch<User>(`/api/admin/users/${encodeURIComponent(id)}/block`, {
      body: { isBlocked },
    });
  },
};
