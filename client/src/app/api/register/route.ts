import { NextResponse } from "next/server";

/**
 * Proxies to the real Express server's POST /auth/register
 * (server/src/routes/auth.route.ts). Replaces the previous dummy stub
 * — same forwarding contract as app/api/login/route.ts, see that file
 * for the full rationale (why a proxy instead of fetching Express
 * directly from the client, why upstream status/body are forwarded
 * as-is, why the JWT is set as an httpOnly cookie here).
 *
 * The server's AuthService.register also returns a token (see
 * server/src/services/auth.service.ts), so a successful registration
 * logs the user in immediately — they land on /projects already
 * authenticated rather than being sent to log in again with the
 * credentials they just typed.
 */

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:4000";
const TOKEN_COOKIE_NAME = "token";
const TOKEN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 1 * 1; // 1 minute

export async function POST(request: Request) {
  const body = await request.text();

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(`${SERVER_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
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

  const token: unknown = upstreamBody?.data?.token;
  if (upstreamRes.ok && typeof token === "string") {
    console.log(upstreamBody);
    console.log(upstreamBody?.data?.token);
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
