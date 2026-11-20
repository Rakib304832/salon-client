"use client";

import { useCallback, useEffect, useState } from "react";
import { appointmentsApi } from "@/lib/api";
import type { Appointment } from "@/types";

/**
 * ONE CUSTOMER APPOINTMENT LIST, SHARED BY TWO PAGES
 * --------------------------------------------------
 * The dashboard overview needs the latest three requests; the appointments page
 * needs the whole list. Both should agree, so they use this hook instead of
 * duplicating fetch, retry and stale-response logic.
 *
 * The request key pattern is important. A reload increments a counter and
 * changes the key immediately, which puts the hook into its loading state while
 * the new request runs. Responses from the previous key are ignored even if
 * they arrive later, so a slow network cannot replace fresh data with old data.
 */
interface AppointmentsState {
  key: string;
  appointments: Appointment[] | null;
  error: string | null;
}

export function useCustomerAppointments() {
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<AppointmentsState | null>(null);

  const requestKey = String(reloadCount);
  const current = state?.key === requestKey ? state : null;
  const appointments = current?.appointments ?? null;
  const error = current?.error ?? null;
  const loading = !current || (appointments === null && error === null);

  useEffect(() => {
    let active = true;

    appointmentsApi
      .mine()
      .then((data) => {
        if (!active) return;
        setState({ key: requestKey, appointments: data, error: null });
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setState({
          key: requestKey,
          appointments: null,
          error:
            caught instanceof Error && caught.message
              ? caught.message
              : "We could not load your appointments.",
        });
      });

    return () => {
      active = false;
    };
  }, [requestKey]);

  const reload = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  /** Patch one item after cancel without discarding the rest of the list. */
  const replaceAppointment = useCallback(
    (updated: Appointment) => {
      setState((previous) => {
        if (!previous || previous.key !== requestKey || !previous.appointments) {
          return previous;
        }

        return {
          ...previous,
          appointments: previous.appointments.map((appointment) =>
            appointment._id === updated._id ? updated : appointment,
          ),
        };
      });
    },
    [requestKey],
  );

  return { appointments, error, loading, reload, replaceAppointment };
}
