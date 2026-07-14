import { NextResponse } from "next/server";

/**
 * Clears the session cookie. No call to the Express server — JWTs are
 * stateless here (no session table, no token blocklist anywhere in
 * server/src), so there's nothing server-side to invalidate. The token
 * simply stops being sent by the browser after this; it remains valid
 * until it expires on its own (JWT_EXPIRES_IN), it just won't be
 * presented anymore from this browser.
 */

const TOKEN_COOKIE_NAME = "token";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(TOKEN_COOKIE_NAME);
  return response;
}
