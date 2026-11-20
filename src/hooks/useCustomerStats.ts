"use client";

import { useCallback, useEffect, useState } from "react";
import { statsApi } from "@/lib/api";
import type { CustomerStats } from "@/types";

/**
 * SERVER-CALCULATED CUSTOMER COUNTS
 * ---------------------------------
 * The numbers on the dashboard must come from GET /api/appointments/stats, not
 * from filtering the list in the browser. The server scopes that endpoint to
 * the authenticated customer, and it stays correct even if the list endpoint
 * is later paginated.
 *
 * As with the appointments hook, every response carries the key that requested
 * it. Retrying, signing in as another user, or navigating quickly can therefore
 * never let an older response win.
 */
interface StatsState {
  key: string;
  stats: CustomerStats | null;
  error: string | null;
}

export function useCustomerStats() {
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<StatsState | null>(null);

  const requestKey = String(reloadCount);
  const current = state?.key === requestKey ? state : null;
  const stats = current?.stats ?? null;
  const error = current?.error ?? null;
  const loading = !current || (stats === null && error === null);

  useEffect(() => {
    let active = true;

    statsApi
      .customer()
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
              : "We could not load your dashboard numbers.",
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
