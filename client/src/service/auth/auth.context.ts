import { createContext } from "react";
import type { SessionUser } from "@/service/auth/auth.service";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: SessionUser | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
