"use client";

import { useCallback, useEffect, useState } from "react";
import { statsApi } from "@/lib/api";
import type { AdminStats } from "@/types";

/**
 * ADMIN DASHBOARD DATA
 * --------------------
 * Every value on the admin overview comes from GET /api/admin/stats. The route
 * is admin-only on the Express side, so no client-side role filtering is needed
 * (and none would be trusted). A request key is kept for the same reason as the
 * customer hooks: a retry must never be overwritten by an older response.
 */
interface AdminStatsState {
  key: string;
  stats: AdminStats | null;
  error: string | null;
}

export function useAdminStats() {
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<AdminStatsState | null>(null);

  const requestKey = String(reloadCount);
  const current = state?.key === requestKey ? state : null;
  const stats = current?.stats ?? null;
  const error = current?.error ?? null;
  const loading = !current || (stats === null && error === null);

  useEffect(() => {
    let active = true;

    statsApi
      .admin()
      .then((data) => {
        if (!active) return;
        setState({ key: requestKey, stats: data, error: null });
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setState({
          key: requestKey,
          stats: null,
          error:
            caught instanceof Error && caught.message
              ? caught.message
              : "We could not load the admin dashboard.",
        });
      });

    return () => {
      active = false;
    };
  }, [requestKey]);

  const reload = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  return { stats, error, loading, reload };
}
