"use client";

import { useRef, type ReactNode } from "react";
import { THEME_CHANGE_EVENT } from "@/lib/theme";
import { ENTER_EASE, ScrollTrigger, SplitText, gsap, useGSAP } from "./gsap";

/**
 * HOME MOTION
 * -----------
 * The only client island on the home page. Every section stays a Server
 * Component and simply marks the parts that take part in the motion; this
 * component reads those markers and does the work.
 *
 * The page moves in exactly three places, and nothing else:
 *
 * 1. The hero entrance, once on load. The headline rises line by line out of
 *    line masks, then the lead, buttons and facts fade up 12px. The picture is
 *    never hidden or faded; it settles from 1.05 to 1 inside its frame.
 * 2. One statement moment. The "Why SalonBook" statement rests at a lighter
 *    grey and turns to ink word by word as it crosses the screen, running back
 *    on the way up.
 * 3. The hover and press layer, which is pure CSS in `app/motion.css`. It is
 *    not scripted here because it must also work by keyboard and while the
 *    page is still hydrating.
 *
 * Deliberately absent: scroll-triggered reveals on cards and sections, tilt,
 * magnetic buttons, parallax on text, carousels and marquees. Those read as
 * noise, and they break the moment the content is read without script.
 *
 * Accessibility: every animation is inside a
 * `(prefers-reduced-motion: no-preference)` matchMedia. Under reduced motion
 * none of this runs, so the page shows its finished, readable state.
 */

/** Content below this statement height needs no scroll range of its own. */
const STATEMENT_START = "top 80%";
const STATEMENT_END = "bottom 45%";

export function HomeMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const motion = gsap.matchMedia();

      motion.add("(prefers-reduced-motion: no-preference)", () => {
        const cleanupHero = playHeroEntrance(root);
        let cleanupStatement = lightStatement(root);

        // GSAP resolves the statement colours when the tween is created. A
        // global theme switch changes those colours, so rebuild the tween
        // from the new computed values instead of leaving stale inline ink.
        const syncStatement = () => {
          cleanupStatement();
          cleanupStatement = lightStatement(root);
          ScrollTrigger.refresh();
        };
        document.addEventListener(THEME_CHANGE_EVENT, syncStatement);

        // SplitText edits the live DOM, so it must undo itself when this
        // component unmounts or when a development double-mount happens.
        return () => {
          cleanupStatement();
          document.removeEventListener(THEME_CHANGE_EVENT, syncStatement);
          cleanupHero?.();
        };
      });

      // Web fonts and the hero image settle after the first paint. Scroll
      // positions measured before that would be wrong, so re-measure once.
      const refresh = () => ScrollTrigger.refresh();

      if (document.fonts.status === "loaded") {
        refresh();
      } else {
        void document.fonts.ready.then(refresh);
      }

      window.addEventListener("load", refresh, { once: true });

      return () => {
        motion.revert();
        window.removeEventListener("load", refresh);
      };
    },
    { scope },
  );

  return (
    <main id="main-content" ref={scope}>
      {children}
    </main>
  );
}

/* ------------------------------------------------------------------------- */
/* 1. Hero entrance                                                           */
/* ------------------------------------------------------------------------- */

function playHeroEntrance(root: HTMLElement): (() => void) | undefined {
  const hero = root.querySelector<HTMLElement>("[data-enter]");
  if (!hero) return;

  const heading = hero.querySelector<HTMLElement>("[data-enter-heading]");
  const eyebrow = hero.querySelector<HTMLElement>("[data-enter-eyebrow]");
  const lead = hero.querySelector<HTMLElement>("[data-enter-lead]");
  const media = hero.querySelector<HTMLElement>("[data-enter-media]");
  const actions = gsap.utils.toArray<HTMLElement>("[data-enter-action]", hero);
  const facts = gsap.utils.toArray<HTMLElement>("[data-enter-fact]", hero);
  const cards = gsap.utils.toArray<HTMLElement>("[data-enter-card]", hero);

  const timeline = gsap.timeline({ defaults: { ease: ENTER_EASE } });

  // The picture is never hidden and never fades; it settles inside its frame.
  if (media) {
    timeline.fromTo(media, { scale: 1.05 }, { scale: 1, duration: 1.1 }, 0);
  }

  // A line above the headline arrives with the first headline line.
  if (eyebrow) {
    timeline.fromTo(
      eyebrow,
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.52 },
      0,
    );
  }

  // The lead/button/fact block starts as the last headline line is half way up.
  let followUpAt = 0.35;
  let cleanupSplit: (() => void) | undefined;

  if (heading) {
    let hasPlayed = false;

    const splitText = SplitText.create(heading, {
      type: "lines",
      mask: "lines",
      // Re-measure if the viewport or the web font changes the line breaks.
      autoSplit: true,
      onSplit: (self) => {
        if (hasPlayed) {
          // Only the first split is an entrance. Later re-splits must leave the
          // headline standing exactly where the visitor last saw it.
          gsap.set(self.lines, { yPercent: 0 });
          return;
        }

        hasPlayed = true;

        gsap.set(self.lines, { yPercent: 115 });
        timeline.to(
          self.lines,
          { yPercent: 0, duration: 0.7, stagger: 0.08 },
          0,
        );

        followUpAt = (self.lines.length - 1) * 0.08 + 0.35;
      },
    });

    // Hand the headline back to the DOM on unmount so a second mount (React
    // Strict Mode in development) splits the original text, not the result.
    cleanupSplit = () => splitText.revert();
  }

  if (lead) {
    timeline.fromTo(
      lead,
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.52 },
      followUpAt,
    );
  }

  if (actions.length > 0) {
    timeline.fromTo(
      actions,
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.52, stagger: 0.06 },
      followUpAt + 0.06,
    );
  }

  if (facts.length > 0) {
    timeline.fromTo(
      facts,
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.52, stagger: 0.06 },
      followUpAt + 0.12,
    );
  }

  if (cards.length > 0) {
    timeline.fromTo(
      cards,
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.52, stagger: 0.06 },
      followUpAt + 0.18,
    );
  }

  return cleanupSplit;
}

/* ------------------------------------------------------------------------- */
/* 2. Statement moment                                                        */
/* ------------------------------------------------------------------------- */

/**
 * The words rest at `--statement-rest`, a grey that still passes 4:1 on the
 * blush band, and turn to plum as the statement crosses the middle of the
 * screen. One strong word turns to the deep accent instead. The tween is
 * scrubbed, so it runs back on the way up and shows a finished state at both
 * ends.
 */
function lightStatement(root: HTMLElement): () => void {
  const statement = root.querySelector<HTMLElement>("[data-statement]");
  if (!statement) return () => undefined;

  const words = gsap.utils.toArray<HTMLElement>(
    "[data-statement-word]",
    statement,
  );
  if (words.length === 0) return () => undefined;

  // Read the resolved palette from CSS. The dark layer redefines these vars,
  // so rebuilding this tween after a theme change picks up the right colours.
  const styles = getComputedStyle(statement);
  const rest =
    styles.getPropertyValue("--statement-rest").trim() || "#7e6f73";
  const accent =
    styles.getPropertyValue("--statement-accent").trim() || "#a9653f";
  const ink = styles.color || "#4a2c3f";

  gsap.set(words, { color: rest });

  // Resolve the target colour once per word rather than inside the tween.
  const litColours = words.map((word) =>
    word.dataset.accent === "true" ? accent : ink,
  );

  const tween = gsap.to(words, {
    color: (index: number) => litColours[index],
    ease: "none",
    stagger: 0.08,
    scrollTrigger: {
      trigger: statement,
      start: STATEMENT_START,
      end: STATEMENT_END,
      scrub: true,
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.set(words, { clearProps: "color" });
  };
}
