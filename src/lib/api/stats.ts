import { appointmentsApi } from "./appointments";
import { api } from "./client";
import type { AdminStats, CustomerStats } from "@/types";

/**
 * Dashboard stats endpoints.
 *
 * Note the asymmetry in the server contract:
 * - customer stats live under /api/appointments/stats
 * - admin stats live under /api/admin/stats (NOT /api/stats/admin)
 */
export const statsApi = {
  customer(): Promise<CustomerStats> {
    return appointmentsApi.stats();
  },

  admin() {
    return api.get<AdminStats>("/api/admin/stats");
  },
};
