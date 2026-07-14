/**
 * Derives a display avatar (initials + background color) from a
 * username, replacing the old static `/avatar-placeholder.png`. There's
 * no `avatarUrl` anywhere in AuthUser/SessionUser (see
 * service/auth/auth.service.ts) — usernames are all this API has ever
 * returned — so this is the permanent avatar strategy, not a stopgap
 * until real photos exist.
 *
 * The color is deterministic (hashed from the username), not
 * `Math.random()` on every render: the same person should get the same
 * color everywhere they appear (Navbar, Team page, comments, etc.),
 * and it shouldn't repaint on every re-render/navigation.
 */

/**
 * 1-2 letters shown inside the avatar circle.
 *  - "julian.davis"  -> "JD" (first letter of first two "word" chunks)
 *  - "julian"        -> "J"  (single chunk, just the first letter)
 *  - ""/whitespace   -> "?"  (defensive fallback, shouldn't happen for a
 *    logged-in user, but this renders instead of crashing if it does)
 *
 * Splits on whitespace, dots, underscores and hyphens so usernames like
 * "julian_davis" or "julian-davis" still produce two initials instead
 * of just "J".
 */
export function getInitials(username: string | null | undefined): string {
  const trimmed = username?.trim();
  if (!trimmed) return "?";

  const chunks = trimmed.split(/[\s._-]+/).filter(Boolean);
  if (chunks.length === 0) return "?";

  if (chunks.length === 1) {
    return chunks[0].slice(0, 2).toUpperCase();
  }

  const first = chunks[0][0] ?? "";
  const second = chunks[1][0] ?? "";
  return `${first}${second}`.toUpperCase();
}

/**
 * Simple deterministic string hash (djb2-derived). Doesn't need to be
 * cryptographically anything — just stable and reasonably well spread
 * across usernames so avatar colors don't cluster.
 */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // keep it a 32-bit int
  }
  return Math.abs(hash);
}

/**
 * Hue (0-359) derived from the username. Saturation/lightness are fixed
 * by the caller (see getAvatarColors) so every generated avatar sits at
 * the same, deliberately muted, tone consistent with this app's dark
 * palette (globals.css) — only the hue varies per-person.
 */
export function getAvatarHue(username: string | null | undefined): number {
  const seed = username?.trim() || "?";
  return hashString(seed) % 360;
}

export interface AvatarColors {
  /** CSS `background` value for the avatar circle. */
  background: string;
  /** CSS `color` value for the initials text — always light, for contrast. */
  foreground: string;
}

/**
 * Background/foreground pair for a given username. Saturation/lightness
 * are tuned to stay legible against this app's near-black surfaces
 * (see --color-surface in globals.css) without being so dark the
 * initials lose contrast, and desaturated enough to sit next to the
 * app's existing muted status colors instead of looking neon.
 */
export function getAvatarColors(
  username: string | null | undefined,
): AvatarColors {
  const hue = getAvatarHue(username);
  return {
    background: `hsl(${hue}, 42%, 32%)`,
    foreground: "hsl(0, 0%, 96%)",
  };
}
