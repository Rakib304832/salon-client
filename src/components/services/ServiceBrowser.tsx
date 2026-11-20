"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  EmptyState,
  ErrorState,
  SkeletonGrid,
  buttonStyles,
} from "@/components/ui";
import { servicesApi } from "@/lib/api";
import {
  API_CATEGORIES,
  isServiceSort,
  type ServiceSort,
} from "@/lib/constants";
import type { Service } from "@/types";
import { ServiceCard } from "./ServiceCard";
import { ServiceFilters } from "./ServiceFilters";

/**
 * SERVICE BROWSER
 * ---------------
 * Client-side orchestration for /services.
 *
 * Why the URL is the state container:
 * - The Home category tiles already link here as /services?category=...
 * - Filters can be bookmarked or shared.
 * - Browser Back/Forward restores the exact search, category and sort.
 *
 * Next.js 16 note: useSearchParams() is a Client Component hook. The page wraps
 * this component in <Suspense>, which is required for a prerendered route.
 *
 * Request freshness:
 * The server can answer older requests after newer ones. Each result is stored
 * with the exact filter key that requested it, and the UI only shows a result
 * whose key matches the current URL. A slow stale response can never replace
 * fresh results.
 */
interface ResultsState {
  key: string;
  items: Service[];
  error: string | null;
}

function toErrorMessage(caught: unknown, fallback: string): string {
  return caught instanceof Error && caught.message ? caught.message : fallback;
}

/** Builds the option list from whatever categories the API actually returns. */
function deriveCategories(services: Service[]): string[] {
  const values = new Set<string>();

  services.forEach((service) => {
    const category = service.category?.trim();
    if (category) values.add(category);
  });

  return Array.from(values);
}

export function ServiceBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL values are strings and may be absent, duplicated or invalid. Normalise
  // once here so the fetch, the form and the result header all agree.
  const search = (searchParams.get("search") ?? "").trim();
  const category = searchParams.get("category") ?? "";
  const rawSort = searchParams.get("sort") ?? "";
  const sort: ServiceSort = isServiceSort(rawSort) ? rawSort : "";

  // The input reacts instantly; only the URL/API update is debounced in the
  // filter component.
  const [searchDraft, setSearchDraft] = useState(search);
  const [lastSyncedSearch, setLastSyncedSearch] = useState(search);

  // React's documented "adjust state when a prop changes" pattern. Doing this
  // during render (instead of in an effect) avoids a cascading extra render.
  // It keeps Back/Forward and Clear in sync with the URL without a listener.
  if (search !== lastSyncedSearch) {
    setLastSyncedSearch(search);
    setSearchDraft(search);
  }

  // Shared constants are the fallback while the unfiltered catalogue loads or
  // if that secondary request fails. A successful response replaces them with
  // the real categories used by the current salon data.
  const [categories, setCategories] = useState<string[]>(() => [
    ...API_CATEGORIES,
  ]);

  const [results, setResults] = useState<ResultsState | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const requestKey = `${search}\u0000${category}\u0000${sort}\u0000${reloadCount}`;
  const isCurrentResult = results?.key === requestKey;
  const loading = !isCurrentResult;
  const error = isCurrentResult ? results.error : null;
  const services = isCurrentResult ? results.items : [];

  const hasActiveFilters = Boolean(search || category || sort);

  /** Merges one filter into the existing query and replaces the history entry. */
  const updateParam = useCallback(
    (name: "search" | "category" | "sort", value: string) => {
      if ((searchParams.get(name) ?? "") === value) return;

      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(name, value);
      else params.delete(name);

      const query = params.toString();
      // replace() avoids filling the history stack with every search keystroke.
      // scroll:false keeps the user next to the results while filtering.
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const commitSearch = useCallback(
    (value: string) => updateParam("search", value),
    [updateParam],
  );

  const clearFilters = useCallback(() => {
    // Also reset an uncommitted draft; otherwise Clear would leave stale text
    // in the input when no URL query existed yet.
    setSearchDraft("");

    if (searchParams.toString().length === 0) return;
    router.replace(pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  // Secondary request for the category <select>. It is unfiltered on purpose:
  // a category-filtered response could not show the other available options.
  useEffect(() => {
    let active = true;

    servicesApi
      .list()
      .then((data) => {
        if (!active) return;
        const derived = deriveCategories(data);
        setCategories(derived.length > 0 ? derived : [...API_CATEGORIES]);
      })
      .catch(() => {
        // Keep the constant fallback already in state. A filter-option failure
        // should not break the primary results grid.
      });

    return () => {
      active = false;
    };
  }, []);

  // Primary request. The key written with the response makes stale answers
  // harmless, and no loading flag needs to be toggled synchronously here.
  useEffect(() => {
    let active = true;

    servicesApi
      .list({ search, category, sort })
      .then((data) => {
        if (!active) return;
        setResults({ key: requestKey, items: data, error: null });
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setResults({
          key: requestKey,
          items: [],
          error: toErrorMessage(
            caught,
            "We could not load services. Please try again.",
          ),
        });
      });

    return () => {
      active = false;
    };
  }, [search, category, sort, requestKey]);

  // Add the active category even when the catalogue request has not provided
  // its options yet, so a shared link never shows an empty <select> value.
  const categoryOptions = useMemo(() => {
    const values = new Set(categories);
    if (category) values.add(category);
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [categories, category]);

  function handleRetry() {
    // Changing reloadCount changes requestKey, which puts the grid back into
    // its loading state and re-runs the primary effect.
    setReloadCount((count) => count + 1);
  }

  const resultLabel = loading
    ? "Loading services…"
    : hasActiveFilters
      ? `${services.length} ${services.length === 1 ? "service" : "services"} found`
      : `${services.length} ${services.length === 1 ? "service" : "services"} available`;

  return (
    <div>
      <ServiceFilters
        searchValue={search}
        searchDraft={searchDraft}
        categoryValue={category}
        sortValue={sort}
        categoryOptions={categoryOptions}
        onSearchChange={setSearchDraft}
        onSearchCommit={commitSearch}
        onCategoryChange={(value) => updateParam("category", value)}
        onSortChange={(value) => updateParam("sort", value)}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm font-medium text-muted">
          {resultLabel}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-bold text-plum underline-offset-4 hover:text-rose-gold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
          >
            Reset all filters
          </button>
        ) : null}
      </div>

      <div className="mt-6" aria-label="Service results">
        {loading ? (
          <SkeletonGrid count={6} />
        ) : error ? (
          <ErrorState
            title="Services are unavailable"
            message={error}
            onRetry={handleRetry}
          />
        ) : services.length === 0 ? (
          <EmptyState
            title="No services found"
            description="Try a different search or category, or clear the filters to see the full menu."
            action={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={buttonStyles({ variant: "primary" })}
                >
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRetry}
                  className={buttonStyles({ variant: "outline" })}
                >
                  Refresh
                </button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
