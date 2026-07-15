"use client";

import clsx from "clsx";
import { ArchiveRestore, Users } from "lucide-react";

export type ProjectStatus = "ongoing" | "completed";

export interface ArchivedProjectCardProps {
  title: string;
  status: ProjectStatus;
  memberCount: number;
  archivedDate: string;
  onUnarchive?: () => void;
  className?: string;
}

const STATUS_STYLES: Record<
  ProjectStatus,
  { badgeBg: string; badgeText: string; label: string }
> = {
  ongoing: {
    badgeBg: "bg-surface-container",
    badgeText: "text-tertiary",
    label: "Ongoing",
  },
  completed: {
    badgeBg: "bg-success-container",
    badgeText: "text-success",
    label: "Completed",
  },
};

export function ArchivedProjectCard({
  title,
  status,
  memberCount,
  archivedDate,
  onUnarchive,
  className,
}: ArchivedProjectCardProps) {
  const style = STATUS_STYLES[status];

  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-3 py-4 px-1",
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="flex items-center justify-center size-9 rounded-md bg-surface-container text-text-muted shrink-0"
          aria-hidden="true"
        >
          <Users className="size-4" />
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary truncate">
              {title}
            </p>
            <span
              className={clsx(
                "text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0",
                style.badgeBg,
                style.badgeText,
              )}
            >
              {style.label}
            </span>
          </div>
          <p className="text-xs text-text-muted">
            {memberCount} {memberCount === 1 ? "member" : "members"} · Archived{" "}
            {archivedDate}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onUnarchive}
        className={clsx(
          "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-outline shrink-0",
          "text-text-primary hover:border-tertiary hover:text-tertiary",
          "transition-colors duration-150 ease-in-out cursor-pointer",
        )}
      >
        <ArchiveRestore className="size-3.5" aria-hidden="true" />
        Unarchive
      </button>
    </div>
  );
}
