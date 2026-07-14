import { NextResponse } from "next/server";

/**
 * Proxies to the real Express server's POST /auth/login
 * (server/src/routes/auth.route.ts). Replaces the previous dummy stub
 * now that the backend endpoint is wired up — no changes needed in
 * auth.service.ts or the login page, since this route keeps the exact
 * same request/response contract they already expect:
 *   - success: whatever the server returns, forwarded as-is
 *     ({ success: true, data: { user, token } })
 *   - failure: the server's own { error, details? } body, forwarded
 *     with the server's own status code, so getErrorMessage() on the
 *     client shows the real reason (wrong password, unknown username,
 *     rate limited, etc.) instead of a generic message.
 *
 * This indirection (browser -> Next.js route -> Express server) rather
 * than fetching the Express server directly from auth.service.ts
 * keeps SERVER_URL server-side only (never shipped to the browser
 * bundle) and sidesteps CORS entirely, since the browser only ever
 * talks to same-origin Next.js routes.
 *
 * On success, the server's JWT is also set as an httpOnly cookie here
 * — nothing on the client (auth.service.ts, the login page) currently
 * persists `data.token` anywhere, so without this the login call would
 * "succeed" but every subsequent authenticated request would still
 * have no credential to send. httpOnly means client-side JS can never
 * read this cookie (an XSS payload can't exfiltrate it), only the
 * browser automatically attaches it to same-origin requests.
 */

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:4000";
const TOKEN_COOKIE_NAME = "token";
const TOKEN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 1; // 1 minute

export async function POST(request: Request) {
  const body = await request.text();

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(`${SERVER_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch {
    // The Express server itself is unreachable (not running, wrong
    // SERVER_URL, network issue) — distinct from the server responding
    // with an error, which is handled below by simply forwarding it.
    return NextResponse.json(
      { error: "Could not reach the server. Please try again." },
      { status: 502 },
    );
  }

  const upstreamBody = await upstreamRes.json().catch(() => null);

  if (upstreamBody === null) {
    return NextResponse.json(
      { error: "Received an invalid response from the server." },
      { status: 502 },
    );
  }

  const response = NextResponse.json(upstreamBody, {
    status: upstreamRes.status,
  });

  const token: unknown = upstreamBody?.data?.token;
  if (upstreamRes.ok && typeof token === "string") {
    response.cookies.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_COOKIE_MAX_AGE_SECONDS,
    });
  }

  return response;
}
