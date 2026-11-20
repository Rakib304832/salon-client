/**
 * Provider barrel. Keeping providers behind one import path makes the root
 * layout readable and gives future global providers one stable entry point.
 */
export { AuthProvider, useAuth } from "./AuthProvider";
export type { AuthContextValue, AuthStatus } from "./AuthProvider";
