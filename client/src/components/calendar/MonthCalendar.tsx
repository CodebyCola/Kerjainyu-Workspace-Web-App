"use client";

import clsx from "clsx";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Dot } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getStatusStyle,
  type TaskStatus,
} from "@/components/taskboard/TaskCard";

/**
 * Mirrors the `tasks` table from the DBML schema (client-facing subset).
 * This is the ONE task shape every view reads from — Task Board groups
 * these by `status`, Calendar groups the same array by `deadline`.
 * Neither view owns its own copy of task data; they're just two
 * different projections over this same array.
 */
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  /** ISO date string, e.g. "2026-07-15". Null = no deadline set. */
  deadline: string | null;
  ownerInitials?: string;
}

export interface MonthCalendarProps {
  /** The single source of truth — same task list the Task Board reads. */
  tasks: Task[];
  /** Called when a task chip is clicked, to open the task detail panel. */
  onTaskClick?: (task: Task) => void;
  className?: string;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MAX_VISIBLE_PER_DAY = 2;

export function MonthCalendar({
  tasks,
  onTaskClick,
  className,
}: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Derived, not stored — this is what makes the calendar reactive to
  // task changes for free. No local copy of "calendar events" that could
  // drift from the real task list; every render recomputes straight from
  // the `tasks` prop, so an edited deadline or new task shows up
  // immediately without any manual sync step.
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.deadline) continue;
      const key = task.deadline; // already "yyyy-MM-dd"
      const existing = map.get(key);
      if (existing) {
        existing.push(task);
      } else {
        map.set(key, [task]);
      }
    }
    return map;
  }, [tasks]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getTasksForDay = (day: Date) =>
    tasksByDate.get(format(day, "yyyy-MM-dd")) ?? [];

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <p className="text-sm font-semibold text-text-primary min-w-27.5 text-center">
            {format(currentMonth, "MMMM yyyy")}
          </p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCurrentMonth(new Date())}
          className="text-xs text-text-secondary hover:text-text-primary px-2 py-1 rounded-md border border-outline-subtle cursor-pointer"
        >
          Today
        </button>
      </div>

      <div className="grid grid-cols-7 border-t border-l border-outline-subtle rounded-lg overflow-hidden">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-xs font-medium text-text-secondary px-3 py-2 border-b border-r border-outline-subtle bg-surface"
          >
            {label}
          </div>
        ))}

        {days.map((day) => {
          const dayTasks = getTasksForDay(day);
          const visibleTasks = dayTasks.slice(0, MAX_VISIBLE_PER_DAY);
          const overflowCount = dayTasks.length - visibleTasks.length;
          const inCurrentMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={clsx(
                "min-h-23 p-2 border-b border-r border-outline-subtle flex flex-col gap-1",
                today && "ring-1 ring-inset ring-tertiary",
              )}
            >
              <span
                className={clsx(
                  "text-xs",
                  inCurrentMonth ? "text-text-secondary" : "text-text-muted/50",
                  today && "text-tertiary font-semibold",
                )}
              >
                {format(day, "d")}
              </span>

              <div className="flex flex-col gap-1">
                {visibleTasks.map((task) => {
                  const style = getStatusStyle(task.status);
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onTaskClick?.(task)}
                      className={clsx(
                        "flex items-center gap-1 text-left text-[11px] px-1.5 py-1 rounded",
                        "bg-surface-container hover:bg-outline-subtle transition-colors duration-150 ease-in-out cursor-pointer",
                        "truncate",
                      )}
                    >
                      <Dot
                        className={clsx("size-3 shrink-0", style.badgeText)}
                        aria-hidden="true"
                      />
                      <span className="truncate text-text-primary">
                        {task.title}
                      </span>
                    </button>
                  );
                })}

                {overflowCount > 0 && (
                  <span className="text-[10px] text-text-muted px-1.5">
                    +{overflowCount} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
