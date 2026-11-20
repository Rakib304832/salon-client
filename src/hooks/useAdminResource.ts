"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * SHARED ADMIN LIST LOADER
 * ------------------------
 * Every admin management screen needs the same four behaviours:
 * - load a list from an authenticated Express endpoint
 * - show a stable loading state while a reload is in flight
 * - keep an inline error with a retry action
 * - patch or remove one row after a mutation without refetching everything
 *
 * Duplicating that logic in five components would invite subtle bugs, so it is
 * centralised here. The `key` argument is a serialised description of the active
 * filters; when it changes, the previous request is ignored even if it finishes
 * later. That prevents a slow response from overwriting newer filter results.
 */
interface AdminResourceState<T> {
  key: string;
  items: T[] | null;
  error: string | null;
}

/**
 * MongoDB documents use `_id`, while Better Auth users use `id`. Supporting both
 * lets users, services, appointments and transactions share this hook without a
 * lossy data normalisation layer.
 */
interface AdminResourceRow {
  _id?: string;
  id?: string;
}

function rowId(item: AdminResourceRow): string {
  return item._id ?? item.id ?? "";
}

export function useAdminResource<T extends AdminResourceRow>(
  load: () => Promise<T[]>,
  key: string,
  fallbackError: string,
) {
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<AdminResourceState<T> | null>(null);

  // Callers create `load` inline from filter state. A ref lets the effect call
  // the newest loader without making the function identity part of the request
  // key (which would trigger an endless reload loop).
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  const requestKey = `${key}|${reloadCount}`;
  const current = state?.key === requestKey ? state : null;
  const items = current?.items ?? null;
  const error = current?.error ?? null;
  const loading = !current || (items === null && error === null);

  useEffect(() => {
    let active = true;

    loadRef.current()
      .then((data) => {
        if (!active) return;
        setState({ key: requestKey, items: data, error: null });
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setState({
          key: requestKey,
          items: null,
          error:
            caught instanceof Error && caught.message
              ? caught.message
              : fallbackError,
        });
      });

    return () => {
      active = false;
    };
  }, [requestKey, fallbackError]);

  const reload = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  /** Replace one row after PATCH/PUT without losing the rest of the list. */
  const replaceItem = useCallback(
    (updated: T) => {
      setState((previous) => {
        if (!previous || previous.key !== requestKey || !previous.items) {
          return previous;
        }

        return {
          ...previous,
          items: previous.items.map((item) =>
            rowId(item) === rowId(updated) ? updated : item,
          ),
        };
      });
    },
    [requestKey],
  );

  /** Remove one row after DELETE without a full refetch. */
  const removeItem = useCallback(
    (id: string) => {
      setState((previous) => {
        if (!previous || previous.key !== requestKey || !previous.items) {
          return previous;
        }

        return {
          ...previous,
          items: previous.items.filter((item) => rowId(item) !== id),
        };
      });
    },
    [requestKey],
  );

  return { items, error, loading, reload, replaceItem, removeItem };
}
