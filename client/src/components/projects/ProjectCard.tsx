"use client";

import clsx from "clsx";
import { Calendar, Users } from "lucide-react";

export type ProjectStatus = "ongoing" | "completed";

export interface ProjectCardProps {
  title: string;
  role: "leader" | "member";
  status: ProjectStatus;
  memberCount: number;
  /** Human-readable deadline label, e.g. "Due Oct 20". Omit if no deadline. */
  deadlineLabel?: string;
  onClick?: () => void;
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

export function ProjectCard({
  title,
  role,
  status,
  memberCount,
  deadlineLabel,
  onClick,
  className,
}: ProjectCardProps) {
  const style = STATUS_STYLES[status];
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={clsx(
        "bg-surface border border-outline-subtle rounded-lg p-4 flex flex-col gap-3 text-left w-full",
        onClick &&
          "cursor-pointer hover:border-outline transition-colors duration-150 ease-in-out",
        className,
      )}
    >
      <p className="text-sm font-semibold text-text-primary leading-snug">
        {title}
      </p>

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-surface-container text-text-secondary">
          {role === "leader" ? "Leader" : "Member"}
        </span>
        <span
          className={clsx(
            "text-[11px] font-medium px-2 py-0.5 rounded-md",
            style.badgeBg,
            style.badgeText,
          )}
        >
          {style.label}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted mt-1">
        <span className="flex items-center gap-1">
          <Users className="size-3.5" aria-hidden="true" />
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </span>
        {deadlineLabel && (
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" aria-hidden="true" />
            {deadlineLabel}
          </span>
        )}
      </div>
    </Wrapper>
  );
}
