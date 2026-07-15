import type { LoginInput, RegisterInput } from "@/service/auth/auth.validator";
import { getErrorMessage } from "@/utils/Errors";

/**
 * Matches AuthService.login/register on the server exactly
 * (server/src/services/auth.service.ts) — `id` and `created_at`, not
 * `userId`, since that's the shape returned inside `data.user`.
 */
export interface AuthUser {
  id: number;
  username: string;
  created_at: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

/** Envelope every successful auth response is wrapped in on this API. */
interface AuthApiResponse {
  success: true;
  data: AuthResult;
}

export interface SessionUser {
  userId: number;
  username: string;
}

interface MeApiResponse {
  success: true;
  data: SessionUser;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(data: LoginInput): Promise<AuthResult> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body));
  }

  const body: AuthApiResponse = await res.json();
  return body.data;
}

export async function register(data: RegisterInput): Promise<AuthResult> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: data.username,
      password: data.password,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body));
  }

  const body: AuthApiResponse = await res.json();
  return body.data;
}

export async function getMe(): Promise<SessionUser | null> {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    cache: "no-store",
    credentials: "include",
  });

  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body));
  }

  const body = await res.json();
  return body.data;
}

export async function logout() {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body));
  }

  const body: MeApiResponse = await res.json();
  return body.data;
}
