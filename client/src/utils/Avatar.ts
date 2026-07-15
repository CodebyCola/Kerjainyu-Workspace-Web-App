
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

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // keep it a 32-bit int
  }
  return Math.abs(hash);
}

export function getAvatarHue(username: string | null | undefined): number {
  const seed = username?.trim() || "?";
  return hashString(seed) % 360;
}

export interface AvatarColors {
  background: string;
  foreground: string;
}

export function getAvatarColors(
  username: string | null | undefined,
): AvatarColors {
  const hue = getAvatarHue(username);
  return {
    background: `hsl(${hue}, 42%, 32%)`,
    foreground: "hsl(0, 0%, 96%)",
  };
}
