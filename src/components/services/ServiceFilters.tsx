"use client";

import { useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input, Select, buttonStyles } from "@/components/ui";
import {
  SORT_OPTIONS,
  isServiceSort,
  type ServiceSort,
} from "@/lib/constants";

/**
 * SERVICE FILTER BAR
 * ------------------
 * Presentational Client Component for the three controls required by the brief:
 * search text, category and price sort.
 *
 * It deliberately owns NO API logic. The parent ServiceBrowser keeps the URL
 * as the single source of truth and passes values/callbacks down. That means a
 * filter copied from the address bar always matches what the user sees, and the
 * back button restores the previous result set.
 *
 * Search text is split into two values:
 * - `searchValue` is the committed URL value (what the API last requested).
 * - `searchDraft` updates on every keystroke and is debounced by the parent.
 *
 * React 19 lint rules discourage copying a prop into state inside an effect.
 * The parent performs the documented render-time adjustment instead, so this
 * component stays free of prop-to-state synchronisation.
 *
 * The sort values come from SORT_OPTIONS so the labels and server contract can
 * never drift apart. isServiceSort() re-checks the value from the <select>
 * because DOM events are technically untrusted input.
 */
const SORT_SELECT_OPTIONS = SORT_OPTIONS.map(({ value, label }) => ({
  value,
  label,
}));

const SEARCH_DEBOUNCE_MS = 350;

export interface ServiceFiltersProps {
  /** Committed URL search value used as the debounce comparison point. */
  searchValue: string;
  /** Instantly updating text in the input. */
  searchDraft: string;
  categoryValue: string;
  sortValue: ServiceSort;
  /** Categories derived from the API, with the shared constants as fallback. */
  categoryOptions: string[];
  onSearchChange: (value: string) => void;
  onSearchCommit: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: ServiceSort) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function ServiceFilters({
  searchValue,
  searchDraft,
  categoryValue,
  sortValue,
  categoryOptions,
  onSearchChange,
  onSearchCommit,
  onCategoryChange,
  onSortChange,
  onClear,
  hasActiveFilters,
}: ServiceFiltersProps) {
  const categorySelectOptions = [
    { value: "", label: "All categories" },
    ...categoryOptions.map((category) => ({ value: category, label: category })),
  ];

  // Debounce only the commit to the URL. Cancelling the previous timer keeps
  // intermediate strings such as "fa", "fac", "faci" out of history and API.
  // No state is written here: the parent owns the draft.
  useEffect(() => {
    const nextSearch = searchDraft.trim();
    if (nextSearch === searchValue) return;

    const timer = window.setTimeout(() => {
      onSearchCommit(nextSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchDraft, searchValue, onSearchCommit]);

  // Include typed-but-not-yet-committed text so Clear is available while the
  // debounce timer is still waiting.
  const canClear = hasActiveFilters || searchDraft.trim().length > 0;

  return (
    <form
      role="search"
      aria-label="Filter services"
      onSubmit={(event) => {
        // Without preventDefault the browser would perform a full GET reload,
        // throwing away the client-side navigation and skeleton states.
        event.preventDefault();
        onSearchCommit(searchDraft.trim());
      }}
      className="rounded-card border border-line bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
        <Input
          type="search"
          name="search"
          label="Search services"
          placeholder="Try facial, haircut, massage…"
          autoComplete="off"
          value={searchDraft}
          leadingIcon={<Search aria-hidden="true" className="h-4 w-4" />}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <Select
          name="category"
          label="Category"
          value={categoryValue}
          options={categorySelectOptions}
          onChange={(event) => onCategoryChange(event.target.value)}
        />

        <Select
          name="sort"
          label="Sort by"
          value={sortValue}
          options={SORT_SELECT_OPTIONS}
          onChange={(event) => {
            const nextValue = event.target.value;
            onSortChange(isServiceSort(nextValue) ? nextValue : "");
          }}
        />

        <button
          type="button"
          onClick={onClear}
          disabled={!canClear}
          className={buttonStyles({
            variant: "ghost",
            className: "w-full md:w-auto",
          })}
        >
          <X aria-hidden="true" className="h-4 w-4" />
          Clear
        </button>
      </div>

      {/* Implicit submission for keyboard users; visually hidden because the
          search field itself is the obvious control. */}
      <button type="submit" className="sr-only">
        Apply search
      </button>
    </form>
  );
}
