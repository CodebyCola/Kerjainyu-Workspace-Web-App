"use client";

import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/service/auth/auth.context";

/**
 * Single access point for auth state anywhere in the component tree —
 * same pattern as useToast() in components/toast/ToastContext.tsx.
 * Throws instead of returning a nullable value: a component reading
 * `user`/`status` without checking "did this hook even resolve" is a
 * bug waiting to happen, so that mistake fails loudly at the call site
 * instead of silently rendering with undefined data.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
