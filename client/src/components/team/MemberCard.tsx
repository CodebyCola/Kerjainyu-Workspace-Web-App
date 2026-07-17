"use client";

import clsx from "clsx";
import { LogOut, MoreVertical, ShieldCheck, UserMinus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type MemberStatus = "active" | "invited" | "removed";

export interface MemberCardProps {
  name: string;
  initials: string;
  status: MemberStatus;
  isLeader?: boolean;
  activeTaskCount?: number;
  onResendInvite?: () => void;
  /** Shown only for the row that represents the signed-in user. */
  isCurrentUser?: boolean;
  /** Presence of each handler controls whether that menu item renders at all. */
  onTransferLeader?: () => void;
  onRemove?: () => void;
  onLeave?: () => void;
  className?: string;
}

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
  isCurrentUser = false,
  onTransferLeader,
  onRemove,
  onLeave,
  className,
}: MemberCardProps) {
  const style = STATUS_STYLES[status];
  const isRemoved = status === "removed";
  const isInvited = status === "invited";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasMenuItems = !!(onTransferLeader || onRemove || onLeave);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

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
            <p className="text-sm font-semibold text-text-primary">
              {name}
              {isCurrentUser && (
                <span className="text-text-muted font-normal"> (You)</span>
              )}
            </p>
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

      <div className="flex items-center gap-1.5">
        <span
          className={clsx(
            "text-[11px] font-medium px-2 py-1 rounded-md",
            style.badgeBg,
            style.badgeText,
          )}
        >
          {style.label}
        </span>

        {hasMenuItems && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={`More actions for ${name}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={clsx(
                "flex items-center justify-center size-7 rounded-md",
                "text-text-muted hover:text-text-primary hover:bg-surface-container",
                "transition-colors duration-150 ease-in-out cursor-pointer",
              )}
            >
              <MoreVertical className="size-4" aria-hidden="true" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label={`Actions for ${name}`}
                className={clsx(
                  "absolute right-0 top-[calc(100%+0.375rem)] z-20 w-44",
                  "bg-surface border border-outline-subtle rounded-lg shadow-xl",
                  "animate-dropdown-in overflow-hidden py-1",
                )}
              >
                {onTransferLeader && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onTransferLeader();
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-left text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer"
                  >
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    Make leader
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onRemove();
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-left text-danger hover:bg-danger-container transition-colors duration-150 ease-in-out cursor-pointer"
                  >
                    <UserMinus className="size-4" aria-hidden="true" />
                    Remove from project
                  </button>
                )}
                {onLeave && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onLeave();
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-left text-danger hover:bg-danger-container transition-colors duration-150 ease-in-out cursor-pointer"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Leave project
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
