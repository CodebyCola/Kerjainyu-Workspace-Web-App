"use client";

import clsx from "clsx";
import { Clock } from "lucide-react";

export type TaskStatus =
  | "unclaimed"
  | "todo"
  | "ongoing"
  | "submitted"
  | "in_revision"
  | "approved"
  | "rejected";

export interface TaskCardProps {
  title: string;
  status: TaskStatus;
  /** Free-form deadline label, e.g. "Today", "Tomorrow", "Oct 15". */
  deadline?: string;
  /** true = deadline styled as urgent (e.g. due today/overdue). */
  isUrgent?: boolean;
  /** Owner's initials for the avatar chip. Omit for unclaimed tasks. */
  ownerInitials?: string;
  /** Called when the "Claim" button is pressed (unclaimed tasks only). */
  onClaim?: () => void;
  /** Called when the card itself is clicked (opens task detail). */
  onClick?: () => void;
  className?: string;
}

const STATUS_STYLES: Record<
  TaskStatus,
  { border: string; badgeBg: string; badgeText: string; label: string }
> = {
  unclaimed: {
    border: "border-l-outline",
    badgeBg: "bg-surface-container",
    badgeText: "text-text-secondary",
    label: "Unclaimed",
  },
  todo: {
    border: "border-l-secondary",
    badgeBg: "bg-surface-container",
    badgeText: "text-text-secondary",
    label: "To do",
  },
  ongoing: {
    border: "border-l-tertiary",
    badgeBg: "bg-surface-container",
    badgeText: "text-tertiary",
    label: "Ongoing",
  },
  submitted: {
    border: "border-l-warning",
    badgeBg: "bg-warning-container",
    badgeText: "text-warning",
    label: "Submitted",
  },
  in_revision: {
    border: "border-l-danger",
    badgeBg: "bg-danger-container",
    badgeText: "text-danger",
    label: "In revision",
  },
  approved: {
    border: "border-l-success",
    badgeBg: "bg-success-container",
    badgeText: "text-success",
    label: "Approved",
  },
  rejected: {
    border: "border-l-danger",
    badgeBg: "bg-danger-container",
    badgeText: "text-danger",
    label: "Rejected",
  },
};

export function TaskCard({
  title,
  status,
  deadline,
  isUrgent = false,
  ownerInitials,
  onClaim,
  onClick,
  className,
}: TaskCardProps) {
  const style = STATUS_STYLES[status];
  const isUnclaimed = status === "unclaimed";

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: TaskCard is a composite interactive container containing its own controls. */
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={clsx(
        "bg-surface border border-outline-subtle border-l-4 rounded-md",
        "px-4 py-3 flex flex-col gap-3",
        style.border,
        onClick &&
          "cursor-pointer hover:border-outline transition-colors duration-150 ease-in-out",
        className,
      )}
    >
      <p className="text-sm font-semibold text-text-primary leading-snug">
        {title}
      </p>

      <div className="flex items-center justify-between">
        {deadline ? (
          <span
            className={clsx(
              "flex items-center gap-1 text-xs",
              isUrgent ? "text-danger" : "text-text-muted",
            )}
          >
            <Clock className="size-3.5" aria-hidden="true" />
            {deadline}
          </span>
        ) : (
          <span />
        )}

        {isUnclaimed ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClaim?.();
            }}
            className={clsx(
              "text-xs font-medium px-3 py-1 rounded-md border border-outline",
              "text-text-primary hover:border-tertiary hover:text-tertiary",
              "transition-colors duration-150 ease-in-out cursor-pointer",
            )}
          >
            Claim
          </button>
        ) : ownerInitials ? (
          <span
            className={clsx(
              "flex items-center justify-center size-6 rounded-full",
              "bg-surface-container text-text-secondary text-[10px] font-semibold",
            )}
            aria-label={`Assigned to ${ownerInitials}`}
            role="img"
          >
            {ownerInitials}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** Small helper export so column headers can reuse the same status label/tone. */
export function getStatusStyle(status: TaskStatus) {
  return STATUS_STYLES[status];
}
