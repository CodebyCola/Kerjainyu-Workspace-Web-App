"use client";

import clsx from "clsx";
import { UserRoundPlus } from "lucide-react";

export function InviteButton({
  compact,
  onClick,
}: {
  compact: boolean;
  onClick: () => void;
}) {
  return (
    <div className={clsx("mt-3", compact ? "px-2" : "px-4")}>
      <button
        type="button"
        onClick={onClick}
        aria-label="Invite Member"
        title={compact ? "Invite Member" : undefined}
        className={clsx(
          "group flex items-center justify-center gap-2 w-full h-10 rounded-md border border-outline",
          "bg-surface-container text-text-primary cursor-pointer",
          "transition-colors duration-200 ease-in-out",
          "hover:border-tertiary hover:text-tertiary-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2",
        )}
      >
        <UserRoundPlus className="size-4 shrink-0 transition-colors duration-200 ease-in-out text-secondary group-hover:text-primary" />
        {!compact && (
          <span className="text-sm transition-colors duration-200 ease-in-out font-medium font-sans text-secondary group-hover:text-primary">
            Invite Member
          </span>
        )}
      </button>
    </div>
  );
}
