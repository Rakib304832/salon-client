"use client";

import { useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input, Select, buttonStyles } from "@/components/ui";
import {
  SORT_OPTIONS,
  isServiceSort,
  type CategoryPillOption,
  type ServiceSort,
} from "@/lib/constants";
import { CategoryPills } from "./CategoryPills";

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
  /** Design-friendly pills plus any extra live categories. */
  categoryOptions: CategoryPillOption[];
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
  // Debounce only the commit to the URL. Cancelling the previous timer keeps
  // intermediate strings such as "fa", "fac", "faci" out of history and API.
  useEffect(() => {
    const nextSearch = searchDraft.trim();
    if (nextSearch === searchValue) return;

    const timer = window.setTimeout(() => {
      onSearchCommit(nextSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchDraft, searchValue, onSearchCommit]);

  const canClear = hasActiveFilters || searchDraft.trim().length > 0;

  return (
    <form
      role="search"
      aria-label="Filter services"
      onSubmit={(event) => {
        event.preventDefault();
        onSearchCommit(searchDraft.trim());
      }}
      className="space-y-5 rounded-card border border-line bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-end">
        <Input
          type="search"
          name="search"
          label="Search"
          placeholder="Search services by name…"
          autoComplete="off"
          value={searchDraft}
          leadingIcon={<Search aria-hidden="true" className="h-4 w-4" />}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <Select
          name="sort"
          label="Sort by:"
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

      <CategoryPills
        options={categoryOptions}
        value={categoryValue}
        onChange={onCategoryChange}
      />

      <button type="submit" className="sr-only">
        Apply search
      </button>
    </form>
  );
}
