import clsx from "clsx";
import { getAvatarColors, getInitials } from "@/utils/Avatar";

const SIZE_CLASSES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
} as const;

export interface AvatarProps {
  username: string | null | undefined;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export default function Avatar({
  username,
  size = "sm",
  className,
}: AvatarProps) {
  const { background, foreground } = getAvatarColors(username);
  const initials = getInitials(username);

  return (
    <div
      role="img"
      aria-label={username ? `${username}'s avatar` : "User avatar"}
      style={{ background, color: foreground }}
      className={clsx(
        "flex items-center justify-center shrink-0 rounded-full border border-outline-subtle font-semibold font-sans select-none",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
