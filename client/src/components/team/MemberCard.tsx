"use client";

import clsx from "clsx";

/**
 * Mirrors the `member_status` enum from the DBML schema.
 */
export type MemberStatus = "active" | "invited" | "removed";

export interface MemberCardProps {
  name: string;
  initials: string;
  status: MemberStatus;
  /** true = this member is the project leader (projects.leader_id). */
  isLeader?: boolean;
  /** Number of tasks currently owned by this member (active status only). */
  activeTaskCount?: number;
  /** Called when "Resend invite" is clicked (invited status only). */
  onResendInvite?: () => void;
  className?: string;
}

/**
 * Single source of truth for member_status visuals — same pattern as
 * TaskCard's STATUS_STYLES, so adding a new status later is a one-line
 * addition here rather than a hunt through JSX.
 */
const STATUS_STYLES: Record<
  MemberStatus,
  { badgeBg: string; badgeText: string; label: string }
> = {
  active: {
    badgeBg: "bg-success-container",
    badgeText: "text-success",
    label: "Active",
  },
  invited: {
    badgeBg: "bg-warning-container",
    badgeText: "text-warning",
    label: "Invited",
  },
  removed: {
    badgeBg: "bg-surface-container",
    badgeText: "text-text-muted",
    label: "Removed",
  },
};

export function MemberCard({
  name,
  initials,
  status,
  isLeader = false,
  activeTaskCount,
  onResendInvite,
  className,
}: MemberCardProps) {
  const style = STATUS_STYLES[status];
  const isRemoved = status === "removed";
  const isInvited = status === "invited";

  return (
    <div
      className={clsx(
        "flex items-center justify-between py-4 px-1",
        isRemoved && "opacity-50",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={clsx(
            "flex items-center justify-center size-9 rounded-md shrink-0",
            "bg-tertiary text-on-tertiary text-xs font-semibold",
          )}
          aria-hidden="true"
        >
          {initials}
        </span>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">{name}</p>
            {isLeader && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-container text-text-secondary">
                Leader
              </span>
            )}
          </div>

          {isInvited ? (
            <button
              type="button"
              onClick={onResendInvite}
              className="w-fit text-xs text-tertiary hover:underline cursor-pointer"
            >
              Resend invite
            </button>
          ) : typeof activeTaskCount === "number" ? (
            <p className="text-xs text-text-muted">
              {activeTaskCount} active{" "}
              {activeTaskCount === 1 ? "task" : "tasks"}
            </p>
          ) : null}
        </div>
      </div>

      <span
        className={clsx(
          "text-[11px] font-medium px-2 py-1 rounded-md",
          style.badgeBg,
          style.badgeText,
        )}
      >
        {style.label}
      </span>
    </div>
  );
}
