import {
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const FEATURES: Feature[] = [
  {
    number: "01",
    title: "Easy Online Booking",
    description: "Pick a service, date and time slot in under a minute.",
    icon: CalendarCheck,
  },
  {
    number: "02",
    title: "Expert Stylists",
    description:
      "Certified professionals with years of hands-on experience.",
    icon: UserRound,
  },
  {
    number: "03",
    title: "Secure Payments",
    description: "Pay only after your appointment is confirmed.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    title: "Premium Products",
    description:
      "Only salon-grade, skin-friendly brands touch your hair and skin.",
    icon: Sparkles,
  },
];

/**
 * The page's one statement moment.
 *
 * The sentence rests at a lighter grey that still reads at 4:1 on the blush
 * band, then turns to ink word by word as it crosses the middle of the screen
 * and darkens back on the way up. "Conversation" carries the accent. This is
 * the only thing on the page that follows the scroll; nothing else moves.
 *
 * The words are ordinary inline spans, so the sentence is complete, selectable
 * and readable without JavaScript, and under reduced motion it simply stays in
 * ink with the accent word in the accent.
 */
const STATEMENT =
  "Every visit starts with a conversation. We ask what your hair has been through, recommend only the work it needs, and never rush the chair.";

const ACCENT_WORD = "conversation";

/**
 * Figma "Why Choose Us" section. The id keeps the header's "Why SalonBook"
 * anchor working even though the visible heading now matches the design.
 */
export function WhyChooseUs() {
  return (
    <section
      id="why-us"
      aria-labelledby="why-choose-us-heading"
      className="scroll-mt-20 bg-blush-light/60 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-gold">
            Why SalonBook
          </p>
          <h2
            id="why-choose-us-heading"
            className="mt-3 text-3xl sm:text-4xl"
          >
            Beauty, Made Effortless
          </h2>
        </div>

        <p
          data-statement
          className="mx-auto mt-10 max-w-4xl text-center font-display text-2xl leading-[1.35] text-plum sm:mt-12 sm:text-3xl lg:text-4xl"
        >
          {STATEMENT.split(" ").map((word, index) => {
            const isAccent = word.toLowerCase().replace(/[^a-z]/g, "") === ACCENT_WORD;

            return (
              <span
                key={`${word}-${index}`}
                data-statement-word
                data-accent={isAccent ? "true" : undefined}
                className={isAccent ? "text-[var(--statement-accent)]" : undefined}
              >
                {word}{" "}
              </span>
            );
          })}
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {FEATURES.map(({ number, title, description, icon: Icon }) => (
            <article
              key={number}
              className="rounded-card border border-line bg-white p-6 shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-light text-plum">
                <Icon aria-hidden="true" className="h-6 w-6" />
              </span>
              <span className="mt-5 block font-display text-sm font-semibold text-rose-gold">
                {number}
              </span>
              <h3 className="mt-1 text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
