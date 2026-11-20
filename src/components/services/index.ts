/**
 * Service UI barrel.
 *
 * The home page, browse page and admin previews all import the same card so
 * pricing, duration and image handling stay consistent. The browser bundle
 * owns URL/filter state; the card stays reusable in both Server and Client
 * Components.
 */
export { ServiceBrowser } from "./ServiceBrowser";
export { ServiceCard } from "./ServiceCard";
export type { ServiceCardProps } from "./ServiceCard";
export { ServiceFilters } from "./ServiceFilters";
export type { ServiceFiltersProps } from "./ServiceFilters";
