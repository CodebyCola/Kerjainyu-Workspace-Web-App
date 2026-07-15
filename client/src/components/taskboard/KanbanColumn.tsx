"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { getStatusStyle, type TaskStatus } from "./TaskCard";

export interface KanbanColumnProps {
  status: TaskStatus;
  label?: string;
  count: number;
  children: ReactNode;
  className?: string;
}

export function KanbanColumn({
  status,
  label,
  count,
  children,
  className,
}: KanbanColumnProps) {
  const style = getStatusStyle(status);

  return (
    <div
      className={clsx(
        "flex flex-col min-h-0 h-full",
        "min-w-65 max-w-[320px] w-full shrink-0 sm:shrink",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-1 pb-3 shrink-0">
        <p className="text-xs font-semibold text-text-secondary">
          {label ?? style.label}
        </p>
        <span
          className={clsx(
            "flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full",
            "text-[10px] font-semibold",
            style.badgeBg,
            style.badgeText,
          )}
        >
          {count}
        </span>
      </div>

      <div
        className={clsx(
          "flex flex-col gap-3 overflow-y-auto min-h-0",
          "pb-2 pr-1 scrollbar-y-hover",
          "mask-[linear-gradient(to_bottom,black_calc(100%-16px),transparent)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
