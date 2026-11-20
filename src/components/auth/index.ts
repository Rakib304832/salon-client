/**
 * Auth UI barrel. Pages import from "@/components/auth" so guards and their
 * matching state screens stay in sync as the app grows.
 */
export { AccessDenied } from "./AccessDenied";
export { AccountBlocked } from "./AccountBlocked";
export { AuthFormSkeleton } from "./AuthFormSkeleton";
export { GoogleButton } from "./GoogleButton";
export type { GoogleButtonProps } from "./GoogleButton";
export {
  AdminGuard,
  CustomerGuard,
  GuestOnly,
  RouteGuard,
} from "./RouteGuard";
export type { RouteGuardProps } from "./RouteGuard";
export { SignInForm } from "./SignInForm";
export { SignUpForm } from "./SignUpForm";
