const STATS = [
  { value: "12k+", label: "Happy clients" },
  { value: "25+", label: "Expert stylists" },
  { value: "40+", label: "Premium services" },
] as const;

/**
 * Hero statistics strip from the Figma design.
 *
 * Each figure is a `data-enter-fact` marker, so HomeMotion fades the three of
 * them up 12px, 60ms apart, just after the headline settles. The figures are
 * never counted up: the final number is already in the HTML, which is what a
 * visitor, a screen reader and a reduced-motion user all need to see.
 */
export function StatsRow() {
  return (
    <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-6">
      {STATS.map((stat) => (
        <div key={stat.label} data-enter-fact>
          <dt className="sr-only">{stat.label}</dt>
          <dd>
            <span className="block font-display text-2xl font-semibold text-plum sm:text-3xl">
              {stat.value}
            </span>
            <span className="mt-1 block text-xs font-medium text-muted">
              {stat.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
