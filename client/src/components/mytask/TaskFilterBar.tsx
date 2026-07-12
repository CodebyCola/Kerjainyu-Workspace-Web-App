"use client";

import clsx from "clsx";
import { ChevronDown, ListFilter } from "lucide-react";
import { useState } from "react";
import {
  getStatusStyle,
  type TaskStatus,
} from "@/components/taskboard/TaskCard";

const STATUS_FILTERS: (TaskStatus | "all")[] = [
  "all",
  "todo",
  "ongoing",
  "submitted",
  "in_revision",
  "approved",
];

/**
 * Visual only, per instructions — clicking a pill updates local active
 * state so the UI feels alive, but nothing here actually filters the
 * table rows yet. Wiring this to real filtering later just means
 * passing `activeStatus` up to the parent instead of holding it here.
 */
export function TaskFilterBar() {
  const [activeStatus, setActiveStatus] = useState<TaskStatus | "all">("all");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((status) => {
          const isActive = activeStatus === status;
          const label = status === "all" ? "All" : getStatusStyle(status).label;

          return (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={clsx(
                "text-xs font-medium px-3 py-1.5 rounded-md transition-colors duration-150 ease-in-out cursor-pointer",
                isActive
                  ? "bg-tertiary text-on-tertiary"
                  : "bg-surface-container text-text-secondary hover:text-text-primary",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary border border-outline-subtle rounded-md px-3 py-1.5 transition-colors duration-150 ease-in-out cursor-pointer"
      >
        <ListFilter className="size-3.5" aria-hidden="true" />
        Sort: Deadline
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
