"use client";

import clsx from "clsx";
import { Clock } from "lucide-react";
import {
  getStatusStyle,
  type TaskStatus,
} from "@/components/taskboard/TaskCard";

export interface TaskTableRowProps {
  title: string;
  projectTitle: string;
  status: TaskStatus;
  deadlineLabel?: string;
  isUrgent?: boolean;
  priorityLabel?: string;
  onClick?: () => void;
}

export function TaskTableRow({
  title,
  projectTitle,
  status,
  deadlineLabel,
  isUrgent = false,
  priorityLabel,
  onClick,
}: TaskTableRowProps) {
  const style = getStatusStyle(status);

  return (
    <tr
      onClick={onClick}
      className={clsx(
        "border-b border-outline-subtle last:border-b-0",
        onClick &&
          "cursor-pointer hover:bg-surface-container/60 transition-colors duration-150 ease-in-out",
      )}
    >
      <td className="py-3 pl-4 pr-3">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-muted">{projectTitle}</p>
      </td>

      <td className="py-3 px-3">
        <span
          className={clsx(
            "text-[11px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap",
            style.badgeBg,
            style.badgeText,
          )}
        >
          {style.label}
        </span>
      </td>

      <td className="py-3 px-3">
        <span className="text-xs text-text-secondary">
          {priorityLabel ?? <span className="text-text-muted">—</span>}
        </span>
      </td>

      <td className="py-3 pl-3 pr-4 text-right">
        {deadlineLabel ? (
          <span
            className={clsx(
              "inline-flex items-center gap-1 text-xs whitespace-nowrap",
              isUrgent ? "text-danger" : "text-text-secondary",
            )}
          >
            <Clock className="size-3.5" aria-hidden="true" />
            {deadlineLabel}
          </span>
        ) : (
          <span className="text-xs text-text-muted">No deadline</span>
        )}
      </td>
    </tr>
  );
}
