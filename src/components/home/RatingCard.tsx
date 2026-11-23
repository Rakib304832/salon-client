/**
 * Floating social-proof card from the Figma hero.
 */
export function RatingCard() {
  return (
    <div
      data-enter-card
      className="pointer-events-none absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-lg sm:left-8"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blush-light font-display text-lg font-semibold text-rose-gold">
        ★
      </span>
      <span>
        <span className="block font-display text-xl font-semibold leading-none text-plum">
          4.9
        </span>
        <span className="mt-1 block text-xs font-medium text-muted">
          2,400+ reviews
        </span>
        <span className="block text-[11px] text-muted">Loved by clients</span>
      </span>
    </div>
  );
}
