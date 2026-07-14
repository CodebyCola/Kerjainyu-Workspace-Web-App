import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Proxies to the real Express server's GET /auth/me
 * (server/src/routes/auth.route.ts), which is guarded by requireAuth
 * (server/src/middlewares/Auth.middleware.ts) — that middleware reads
 * the token ONLY from an `Authorization: Bearer <token>` header, never
 * from a cookie.
 *
 * The login/register proxies store the JWT as an httpOnly cookie
 * (see app/api/login/route.ts) specifically so client-side JS can
 * never read it — but that means the browser can't attach it as a
 * Bearer header itself either. This route is the bridge: it runs
 * server-side, where httpOnly cookies ARE readable (the httpOnly flag
 * only blocks `document.cookie` in the browser, not server code), and
 * it re-attaches the token as the Bearer header the real server
 * expects. AuthContext calls this route and never touches the raw
 * token at all.
 */

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:4000";
const TOKEN_COOKIE_NAME = "token";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    // No session cookie at all — this is the expected, common case for
    // a logged-out visitor, not a server failure. 401 lets AuthContext
    // treat "no user" as a normal resolved state rather than an error.
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(`${SERVER_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      // Always hit the real server fresh — auth state must never be
      // served from Next.js's fetch cache.
      cache: "no-store",
    });
  } catch {
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

  // The token the middleware rejected is stale/invalid (expired,
  // tampered, or the server's JWT_SECRET rotated) — clear it so the
  // browser stops sending a cookie that will only ever fail from here
  // on, instead of silently failing on every future request.
  if (upstreamRes.status === 401) {
    response.cookies.delete(TOKEN_COOKIE_NAME);
  }

  return response;
}
