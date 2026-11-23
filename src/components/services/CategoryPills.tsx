import type { CategoryPillOption } from "@/lib/constants";

export interface CategoryPillsProps {
  options: readonly CategoryPillOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Horizontal category filter from the Figma browse-services screen.
 * Buttons use aria-pressed so the selected pill is announced correctly.
 */
export function CategoryPills({
  options,
  value,
  onChange,
}: CategoryPillsProps) {
  return (
    <fieldset>
      <legend className="sr-only">Filter by category</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={
                selected
                  ? "rounded-full bg-plum px-4 py-2 text-sm font-bold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2"
                  : "rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-plum transition-colors hover:border-rose-gold hover:bg-blush-light focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2"
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
