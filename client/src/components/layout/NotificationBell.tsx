"use client";

import clsx from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  ClipboardCheck,
  Clock,
  Gavel,
  MessageSquare,
  Repeat2,
  UserPlus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ROUTES } from "@/routes/route";
import { acceptInvite, declineInvite } from "@/service/invite/invite.service";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
  type NotificationType,
} from "@/service/notification/notification.service";
import { getErrorMessage } from "@/utils/Errors";

const POLL_INTERVAL_MS = 30_000;

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  deadline_reminder: Clock,
  task_assigned: ClipboardCheck,
  task_swapped: Repeat2,
  swap_requested: Repeat2,
  submission_pending: ClipboardCheck,
  submission_reviewed: ClipboardCheck,
  comment_added: MessageSquare,
  appeal_updated: Gavel,
  member_added: UserPlus,
  member_invited: UserPlus,
};

function linkFor(notification: Notification): string | null {
  const isResolvedInviteType =
    notification.type === "member_added" ||
    (notification.type === "member_invited" && notification.is_read);

  if (
    isResolvedInviteType &&
    notification.reference_type === "project" &&
    notification.reference_id
  ) {
    return ROUTES.PROJECT_TEAM(notification.reference_id);
  }
  return null;
}

function isPendingInvite(notification: Notification): boolean {
  return (
    notification.type === "member_invited" &&
    !notification.is_read &&
    notification.reference_type === "project" &&
    notification.reference_id != null
  );
}

export default function NotificationBell() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [listStatus, setListStatus] = useState<
    "idle" | "loading" | "error" | "ready"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [respondingId, setRespondingId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // Silent — a failed badge refresh shouldn't interrupt whatever
      // page the user is actually on. The next poll tick retries.
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  const loadNotifications = useCallback(async () => {
    setListStatus("loading");
    setErrorMessage(null);
    try {
      const data = await getNotifications({ limit: 20 });
      setNotifications(data);
      setListStatus("ready");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setListStatus("error");
    }
  }, []);

  function handleToggle() {
    setOpen((prev) => {
      const next = !prev;
      if (next) loadNotifications();
      return next;
    });
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleNotificationClick(notification: Notification) {
    if (!notification.is_read) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      markNotificationAsRead(notification.id).catch(() => {
        // Best-effort — a failed mark-as-read isn't worth surfacing an
        // error toast over; the next full list load will reconcile it.
      });
    }

    const href = linkFor(notification);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  }

  async function handleInviteResponse(
    notification: Notification,
    action: "accept" | "decline",
  ) {
    if (!notification.reference_id) return;
    const projectId = notification.reference_id;

    setRespondingId(notification.id);
    setErrorMessage(null);
    try {
      if (action === "accept") {
        await acceptInvite(projectId);
      } else {
        await declineInvite(projectId);
      }
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n,
        ),
      );
      if (!notification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      if (action === "accept") {
        setOpen(false);
        router.push(ROUTES.PROJECT_TEAM(projectId));
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setRespondingId(null);
    }
  }

  async function handleMarkAllAsRead() {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-haspopup="menu"
        aria-expanded={open}
        className={clsx(
          "relative text-text-secondary hover:text-text-primary",
          "transition-colors duration-200 ease-in-out cursor-pointer",
        )}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span
            className={clsx(
              "absolute -top-1.5 -right-1.5 flex items-center justify-center",
              "min-w-[1.1rem] h-[1.1rem] px-1 rounded-full",
              "bg-danger text-neutral text-[10px] font-semibold leading-none",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className={clsx(
            "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-80 max-w-[calc(100vw-2rem)]",
            "bg-surface border border-outline-subtle rounded-lg shadow-xl",
            "animate-dropdown-in overflow-hidden flex flex-col",
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-subtle">
            <p className="text-sm font-semibold text-text-primary">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className={clsx(
                  "flex items-center gap-1 text-xs font-medium text-tertiary",
                  "hover:opacity-80 transition-opacity duration-150 ease-in-out cursor-pointer",
                  markingAll && "opacity-60 cursor-wait",
                )}
              >
                <CheckCheck className="size-3.5" aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {listStatus === "loading" && (
              <p className="text-sm text-text-muted px-4 py-6 text-center">
                Loading...
              </p>
            )}

            {listStatus === "error" && (
              <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                <p className="text-sm text-danger">
                  {errorMessage ?? "Could not load notifications."}
                </p>
                <button
                  type="button"
                  onClick={loadNotifications}
                  className="text-xs font-medium text-tertiary hover:opacity-80 transition-opacity duration-150 ease-in-out cursor-pointer"
                >
                  Try again
                </button>
              </div>
            )}

            {listStatus === "ready" && notifications.length === 0 && (
              <p className="text-sm text-text-muted px-4 py-6 text-center">
                You're all caught up.
              </p>
            )}

            {listStatus === "ready" && errorMessage && (
              <p className="text-xs text-danger px-4 py-2 border-b border-outline-subtle">
                {errorMessage}
              </p>
            )}

            {listStatus === "ready" &&
              notifications.map((notification) => {
                const Icon = TYPE_ICON[notification.type] ?? Bell;
                const isInvite = isPendingInvite(notification);
                const href = linkFor(notification);
                const isClickable = !isInvite && href !== null;
                const isResponding = respondingId === notification.id;

                const header = (
                  <>
                    <span
                      className={clsx(
                        "flex items-center justify-center size-8 rounded-full shrink-0 mt-0.5",
                        notification.is_read
                          ? "bg-surface-container text-text-muted"
                          : "bg-tertiary/15 text-tertiary",
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="size-4" />
                    </span>

                    <div className="flex-1 min-w-0">
                      <p
                        className={clsx(
                          "text-sm leading-snug",
                          notification.is_read
                            ? "text-text-secondary"
                            : "text-text-primary font-medium",
                        )}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatDistanceToNowStrict(
                          new Date(notification.created_at),
                          { addSuffix: true },
                        )}
                      </p>
                    </div>

                    {!notification.is_read && !isInvite && (
                      <span
                        className="size-2 rounded-full bg-tertiary shrink-0 mt-1.5"
                        aria-hidden="true"
                      />
                    )}
                  </>
                );

                if (isInvite) {
                  return (
                    <div
                      key={notification.id}
                      className={clsx(
                        "flex flex-col gap-2.5 px-4 py-3 border-b border-outline-subtle last:border-b-0",
                        !notification.is_read && "bg-tertiary/5",
                      )}
                    >
                      <div className="flex items-start gap-3">{header}</div>
                      <div className="flex items-center gap-2 pl-11">
                        <button
                          type="button"
                          disabled={isResponding}
                          onClick={() =>
                            handleInviteResponse(notification, "accept")
                          }
                          className={clsx(
                            "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md",
                            "bg-tertiary text-on-tertiary hover:opacity-90",
                            "transition-opacity duration-150 ease-in-out cursor-pointer",
                            isResponding && "opacity-60 cursor-wait",
                          )}
                        >
                          <Check className="size-3.5" aria-hidden="true" />
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={isResponding}
                          onClick={() =>
                            handleInviteResponse(notification, "decline")
                          }
                          className={clsx(
                            "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md",
                            "border border-outline-subtle text-text-secondary hover:text-text-primary",
                            "transition-colors duration-150 ease-in-out cursor-pointer",
                            isResponding && "opacity-60 cursor-wait",
                          )}
                        >
                          <X className="size-3.5" aria-hidden="true" />
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={notification.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleNotificationClick(notification)}
                    className={clsx(
                      "flex items-start gap-3 w-full px-4 py-3 text-left border-b border-outline-subtle last:border-b-0",
                      "transition-colors duration-150 ease-in-out",
                      isClickable
                        ? "hover:bg-surface-container cursor-pointer"
                        : "cursor-default",
                      !notification.is_read && "bg-tertiary/5",
                    )}
                  >
                    {header}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
