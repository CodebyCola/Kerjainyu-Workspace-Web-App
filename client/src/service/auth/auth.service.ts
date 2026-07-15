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

/**
 * Throws on failure (network error, non-2xx response) instead of
 * swallowing it — callers are expected to catch and display the real
 * message (via getErrorMessage(err)) as a form-level error, see
 * app/(auth)/login/page.tsx. Never invent a frontend-authored message
 * here; whatever the server said is what the user sees.
 */
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

/**
 * Same contract as login(): throws with the server's own message on
 * failure (e.g. "Username already taken"), see
 * app/(auth)/register/page.tsx. confirmPassword is intentionally not
 * sent — it's a client-only check (see registerSchema's .refine),
 * the server only needs the credentials it will store.
 */
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

/**
 * Shape of GET /auth/me on the real server (server/src/controllers/
 * auth.controller.ts -> `res.json({ success: true, data: req.user })`),
 * where req.user is the decoded JWT payload (server/src/shared/jwt.ts's
 * JwtPayload) — NOT the same shape as AuthUser from auth.service.ts
 * (which comes from the login/register response body, a full user row
 * with `id` and `created_at`). /me only has whatever was encoded into
 * the token: `userId` and `username`.
 */

/**
 * Resolves the current session by calling the Next.js proxy at
 * /api/me (see app/api/me/route.ts) — never touches a token directly;
 * the httpOnly cookie holding it isn't readable from client-side JS in
 * the first place, and shouldn't be.
 *
 * Returns null for "not logged in" (401 from the proxy) rather than
 * throwing — that's an expected, common state for this call, not a
 * failure. Throws only for genuine errors (network failure, 5xx,
 * malformed response) so AuthProvider can tell "no session" apart from
 * "couldn't check."
 */
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

/**
 * Clears the local session cookie via /api/logout (see
 * app/api/logout/route.ts). No server round-trip to Express — JWTs
 * here are stateless, there's nothing there to invalidate.
 */
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
