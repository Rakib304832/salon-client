import { api } from "./client";
import type { Service, ServiceInput, ServiceStatus } from "@/types";

/**
 * The server's create/update schemas accept content fields only. Status has a
 * dedicated PATCH route, so omitting it here prevents an admin form from
 * accidentally sending a value the server would ignore.
 */
export type AdminServiceInput = Omit<ServiceInput, "status">;
import type { ServiceSort } from "@/lib/constants";

export interface ServiceQuery {
  search?: string;
  category?: string;
  sort?: ServiceSort;
  // Allows this interface to be passed straight to apiFetch's QueryParams.
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Service endpoints.
 *
 * Public browsing calls list(), while admin pages call adminList(). The server
 * guarantees public results are active-only; the client must not filter them
 * again because that could hide a newly activated service until refresh.
 */
export const servicesApi = {
  list(params: ServiceQuery = {}) {
    return api.get<Service[]>("/api/services", { params });
  },

  getById(id: string) {
    return api.get<Service>(`/api/services/${encodeURIComponent(id)}`);
  },

  adminList(params: ServiceQuery = {}) {
    return api.get<Service[]>("/api/admin/services", { params });
  },

  create(input: AdminServiceInput) {
    return api.post<Service>("/api/services", { body: input });
  },

  update(id: string, input: Partial<AdminServiceInput>) {
    return api.put<Service>(`/api/services/${encodeURIComponent(id)}`, {
      body: input,
    });
  },

  setStatus(id: string, status: ServiceStatus) {
    return api.patch<Service>(
      `/api/services/${encodeURIComponent(id)}/status`,
      { body: { status } },
    );
  },

  remove(id: string) {
    return api.delete<{ _id: string }>(`/api/services/${encodeURIComponent(id)}`);
  },
};
