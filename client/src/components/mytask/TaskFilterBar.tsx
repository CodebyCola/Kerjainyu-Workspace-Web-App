"use client";

import clsx from "clsx";
import { Check, ChevronDown, ListFilter } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getStatusStyle,
  type TaskStatus,
} from "@/components/taskboard/TaskCard";
import type { MyTaskSort } from "@/service/task/task.service";

const STATUS_FILTERS: (TaskStatus | "all")[] = [
  "all",
  "todo",
  "ongoing",
  "submitted",
  "in_revision",
  "approved",
];

const SORT_OPTIONS: { value: MyTaskSort; label: string }[] = [
  { value: "deadline_asc", label: "Deadline (soonest)" },
  { value: "deadline_desc", label: "Deadline (latest)" },
  { value: "priority", label: "Priority" },
  { value: "recent", label: "Recently created" },
];

export interface TaskFilterBarProps {
  activeStatus: TaskStatus | "all";
  onStatusChange: (status: TaskStatus | "all") => void;
  activeSort: MyTaskSort;
  onSortChange: (sort: MyTaskSort) => void;
}

/**
 * Controlled by the parent (mytask/page.tsx) rather than holding its
 * own state — the page needs `activeStatus`/`activeSort` to build the
 * actual API request (GET /projects/tasks/mine?status=&sort=), so the
 * source of truth has to live where the fetch happens, not in here.
 */
export function TaskFilterBar({
  activeStatus,
  onStatusChange,
  activeSort,
  onSortChange,
}: TaskFilterBarProps) {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(e.target as Node)
      ) {
        setSortMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortMenuOpen]);

  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.value === activeSort)?.label ??
    "Deadline";

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
              onClick={() => onStatusChange(status)}
              aria-pressed={isActive}
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

      <div className="relative" ref={sortMenuRef}>
        <button
          type="button"
          onClick={() => setSortMenuOpen((open) => !open)}
          aria-expanded={sortMenuOpen}
          aria-haspopup="listbox"
          className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary border border-outline-subtle rounded-md px-3 py-1.5 transition-colors duration-150 ease-in-out cursor-pointer"
        >
          <ListFilter className="size-3.5" aria-hidden="true" />
          Sort: {activeSortLabel}
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </button>

        {sortMenuOpen && (
          <div
            role="listbox"
            className="absolute right-0 z-10 mt-1.5 w-48 bg-surface border border-outline-subtle rounded-md shadow-lg py-1"
          >
            {SORT_OPTIONS.map((option) => {
              const isActive = option.value === activeSort;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onSortChange(option.value);
                    setSortMenuOpen(false);
                  }}
                  className={clsx(
                    "flex items-center justify-between gap-2 w-full text-left text-xs px-3 py-1.5 transition-colors duration-150 ease-in-out cursor-pointer",
                    isActive
                      ? "text-text-primary font-medium"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {option.label}
                  {isActive && (
                    <Check
                      className="size-3.5 text-tertiary"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
