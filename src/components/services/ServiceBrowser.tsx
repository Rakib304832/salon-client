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
  CATEGORY_PILL_OPTIONS,
  isCoveredApiCategory,
  isServiceSort,
  resolveCategorySelection,
  type CategoryPillOption,
  type ServiceSort,
} from "@/lib/constants";
import type { Service } from "@/types";
import { ServiceCard } from "./ServiceCard";
import { ServiceFilters } from "./ServiceFilters";

/**
 * SERVICE BROWSER
 * ---------------
 * Client-side orchestration for /services. The URL remains the state container
 * so category tiles can link here and browser Back/Forward restores filters.
 *
 * Figma labels such as "Hair Coloring" are resolved to the short API category
 * "Hair" before fetching, while the friendly label stays in the URL and in the
 * selected pill.
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

  const search = (searchParams.get("search") ?? "").trim();
  const category = searchParams.get("category") ?? "";
  const rawSort = searchParams.get("sort") ?? "";
  const sort: ServiceSort = isServiceSort(rawSort) ? rawSort : "";
  const selection = resolveCategorySelection(category);
  const categoryQuery = selection?.query ?? "";

  const [searchDraft, setSearchDraft] = useState(search);
  const [lastSyncedSearch, setLastSyncedSearch] = useState(search);

  if (search !== lastSyncedSearch) {
    setLastSyncedSearch(search);
    setSearchDraft(search);
  }

  const [categories, setCategories] = useState<string[]>(() => [
    ...API_CATEGORIES,
  ]);

  const [results, setResults] = useState<ResultsState | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const requestKey = `${search}\u0000${categoryQuery}\u0000${sort}\u0000${reloadCount}`;
  const isCurrentResult = results?.key === requestKey;
  const loading = !isCurrentResult;
  const error = isCurrentResult ? results.error : null;
  const services = isCurrentResult ? results.items : [];

  const hasActiveFilters = Boolean(search || category || sort);

  const updateParam = useCallback(
    (name: "search" | "category" | "sort", value: string) => {
      if ((searchParams.get(name) ?? "") === value) return;

      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(name, value);
      else params.delete(name);

      const query = params.toString();
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
    setSearchDraft("");
    if (searchParams.toString().length === 0) return;
    router.replace(pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  // Secondary request keeps the pill list aware of categories that are not part
  // of the seven curated design groups, such as Waxing and Bridal.
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
        // Keep the constant fallback already in state.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    servicesApi
      .list({ search, category: categoryQuery, sort })
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
  }, [search, categoryQuery, sort, requestKey]);

  const categoryOptions = useMemo<CategoryPillOption[]>(() => {
    const options: CategoryPillOption[] = [...CATEGORY_PILL_OPTIONS];

    for (const value of categories) {
      if (isCoveredApiCategory(value)) continue;
      if (!options.some((option) => option.value === value)) {
        options.push({ label: value, value });
      }
    }

    if (
      selection &&
      !options.some((option) => option.value === selection.label)
    ) {
      options.push({ label: selection.label, value: selection.label });
    }

    return options;
  }, [categories, selection]);

  function handleRetry() {
    setReloadCount((count) => count + 1);
  }

  const resultLabel = loading
    ? "Loading services…"
    : hasActiveFilters
      ? `Showing ${services.length} ${services.length === 1 ? "service" : "services"}`
      : `Showing ${services.length} active services`;

  return (
    <div>
      <ServiceFilters
        searchValue={search}
        searchDraft={searchDraft}
        categoryValue={selection?.label ?? category}
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
