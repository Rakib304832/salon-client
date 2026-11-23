/**
 * Motion barrel.
 *
 * HomeMotion is the client island; gsap.ts keeps plugin registration in one
 * place. Section-specific motion lives beside its section.
 */
export { HomeMotion } from "./HomeMotion";
export { ENTER_EASE, ScrollTrigger, SplitText, gsap, useGSAP } from "./gsap";
