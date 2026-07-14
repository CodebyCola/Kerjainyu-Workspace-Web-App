"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from "@/service/auth/auth.context";
import {
  getMe,
  logout as logoutRequest,
  type SessionUser,
} from "@/service/auth/auth.service";

/**
 * Resolves the session once on mount by calling GET /api/me (which
 * itself reads the httpOnly cookie server-side and checks it against
 * the real Express server — see app/api/me/route.ts). Meant to be
 * mounted exactly once, wrapping RootLayout's children, so any
 * component anywhere in the tree can call useAuth() without knowing
 * or caring where in the tree it sits.
 *
 * Modeled after ToastProvider (components/toast/ToastContext.tsx):
 * a context + hook pair, one provider instance at the root. The
 * "loading" status exists specifically so consumers (e.g. the
 * (protected) layout) can tell "still checking, don't redirect yet"
 * apart from "confirmed logged out, redirect now" — collapsing those
 * into one boolean would either flash a redirect on every page load
 * or silently allow a flash of protected content before the check
 * resolves.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const sessionUser = await getMe();
      setUser(sessionUser);
      setStatus(sessionUser ? "authenticated" : "unauthenticated");
    } catch {
      // A genuine failure (network error, 5xx, malformed response) is
      // treated the same as "no session" for gating purposes — a
      // protected route shouldn't render on a hunch. The difference
      // between "confirmed logged out" and "couldn't tell" isn't
      // exposed here; callers that need to distinguish them should use
      // getMe() from lib/auth/auth.api.ts directly.
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, refresh, logout }),
    [user, status, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}