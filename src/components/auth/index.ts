/**
 * Auth UI barrel. Pages import from "@/components/auth" so guards and their
 * matching state screens stay in sync as the app grows.
 */
export { AccessDenied } from "./AccessDenied";
export { AccountBlocked } from "./AccountBlocked";
export {
  AdminGuard,
  CustomerGuard,
  GuestOnly,
  RouteGuard,
} from "./RouteGuard";
export type { RouteGuardProps } from "./RouteGuard";
