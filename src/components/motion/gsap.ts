/**
 * GSAP SETUP
 * ----------
 * One module registers every plugin the site uses, so a component never has to
 * remember to. It is a Client Module ("use client"), which also means GSAP is
 * only ever loaded in the browser.
 *
 * Plugins:
 * - ScrollTrigger: the statement moment is scrubbed to the scrollbar.
 * - SplitText: the hero headline is measured into real lines, then each line
 *   rises out of its own mask. Measuring lines in the browser is the only way
 *   to stay correct at every width and with the real Playfair metrics.
 * - CustomEase: the design's entrance curve, cubic-bezier(.22, 1, .36, 1),
 *   written once instead of faking it with an overshooting built-in ease.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

/** Name of the entrance curve; use with `ease: ENTER_EASE`. */
export const ENTER_EASE = "salon-enter";

let isRegistered = false;

function registerMotion() {
  if (isRegistered || typeof window === "undefined") return;

  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);

  // cubic-bezier(.22, 1, .36, 1): fast away from the start, long calm settle.
  // No bounce, no overshoot.
  CustomEase.create(ENTER_EASE, "M0,0 C0.22,1 0.36,1 1,1");

  // Mobile browsers fire resize when the address bar shows or hides. Without
  // this, ScrollTrigger would re-measure mid-scroll and the statement would
  // jump.
  ScrollTrigger.config({ ignoreMobileResize: true });

  isRegistered = true;
}

registerMotion();

export { gsap, ScrollTrigger, SplitText, useGSAP };
