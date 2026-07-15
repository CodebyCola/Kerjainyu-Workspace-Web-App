"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export interface KanbanBoardProps {
  children: ReactNode;
  className?: string;
}

export function KanbanBoard({ children, className }: KanbanBoardProps) {
  return (
    <div
      className={clsx(
        "flex gap-4 overflow-x-auto",
        "h-[calc(100vh-4rem-2.5rem-5rem)]",
        "pb-1.5 scrollbar-x-visible",
        className,
      )}
    >
      {children}
    </div>
  );
}
