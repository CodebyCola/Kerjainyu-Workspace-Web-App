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