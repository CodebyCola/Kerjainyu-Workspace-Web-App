import { createContext } from "react";
import type { SessionUser } from "@/service/auth/auth.service";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: SessionUser | null;
  status: AuthStatus;
  /**
   * Re-runs the /me check — call after login/register succeeds so the
   * rest of the app picks up the new session immediately, instead of
   * waiting for a future navigation or refresh to notice.
   */
  refresh: () => Promise<void>;
  /** Clears the session and resets user/status to logged-out. */
  logout: () => Promise<void>;
}

/**
 * No default value (null) on purpose — every consumer goes through
 * useAuth() (hooks/useAuth.ts), which throws a clear error if called
 * outside AuthProvider rather than silently working with placeholder
 * data. Kept in its own file, separate from AuthProvider.tsx: this
 * file has no "use client" directive and no JSX, so anything that only
 * needs the TYPES (AuthContextValue, SessionUser) can import from here
 * without pulling in the provider's client-only implementation.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
