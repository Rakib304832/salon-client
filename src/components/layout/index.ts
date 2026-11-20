/**
 * Shared layout barrel.
 *
 * Route-group layouts import from here so the public header/footer stay behind
 * one stable path as more shells (dashboard, auth) are added.
 */
export { Logo } from "./Logo";
export type { LogoProps } from "./Logo";
export { PublicFooter } from "./PublicFooter";
export { PublicHeader } from "./PublicHeader";
