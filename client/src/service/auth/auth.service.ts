import type { LoginInput, RegisterInput } from "@/service/auth/auth.validator";
import { getErrorMessage } from "@/utils/errors/Errors";

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

/**
 * Throws on failure (network error, non-2xx response) instead of
 * swallowing it — callers are expected to catch and display the real
 * message (via getErrorMessage(err)) as a form-level error, see
 * app/(auth)/login/page.tsx. Never invent a frontend-authored message
 * here; whatever the server said is what the user sees.
 */
export async function login(data: LoginInput): Promise<AuthResult> {
  const res = await fetch("/api/login", {
    method: "POST",
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

/**
 * Same contract as login(): throws with the server's own message on
 * failure (e.g. "Username already taken"), see
 * app/(auth)/register/page.tsx. confirmPassword is intentionally not
 * sent — it's a client-only check (see registerSchema's .refine),
 * the server only needs the credentials it will store.
 */
export async function register(data: RegisterInput): Promise<AuthResult> {
  const res = await fetch("/api/register", {
    method: "POST",
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
