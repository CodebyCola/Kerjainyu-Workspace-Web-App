"use client";

import { useState } from "react";
import { MonthCalendar, type Task } from "@/components/calendar/MonthCalendar";
import Container from "@/components/layout/Container";

// This is the ONE array both Task Board and Calendar would read from in
// production (fetched once from GET /projects/:id/tasks and passed down,
// or held in a shared query cache / store). MonthCalendar never stores
// its own copy — it only derives day groupings from whatever `tasks`
// array it's given, so editing a task here is enough to prove the
// calendar reacts without touching MonthCalendar's code at all.
const initialTasks: Task[] = [
  {
    id: "1",
    title: "Implement new navigation shell",
    status: "ongoing",
    deadline: "2026-07-01",
  },
  {
    id: "2",
    title: "Audit existing design system tokens",
    status: "unclaimed",
    deadline: "2026-07-05",
  },
  {
    id: "3",
    title: "Draft landing page wireframes",
    status: "todo",
    deadline: "2026-07-05",
  },
  {
    id: "4",
    title: "Review user feedback report",
    status: "submitted",
    deadline: "2026-07-06",
  },
  {
    id: "5",
    title: "Team sync meeting prep",
    status: "todo",
    deadline: "2026-07-08",
  },
  {
    id: "6",
    title: "Submit asset pack",
    status: "in_revision",
    deadline: "2026-07-10",
  },
  {
    id: "7",
    title: "Final presentation deck",
    status: "ongoing",
    deadline: "2026-07-22",
  },
  { id: "8", title: "Client call", status: "todo", deadline: "2026-07-22" },
  { id: "9", title: "Prep Q&A notes", status: "todo", deadline: "2026-07-22" },
  {
    id: "10",
    title: "Send follow-up email",
    status: "approved",
    deadline: "2026-07-22",
  },
];

export default function Calendar() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Demo action only — in production this would be a mutation call
  // (e.g. PATCH /tasks/:id) followed by refetching or updating the same
  // shared task list. The calendar needs no changes either way; it just
  // re-renders from whatever `tasks` looks like after the update.
  function moveTaskToToday(taskId: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, deadline: new Date().toISOString().slice(0, 10) }
          : task,
      ),
    );
  }

  return (
    <Container>
      <div className="flex items-start justify-between mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Calendar</h1>
          <span className="text-sm text-text-secondary">
            Project Title
          </span>
        </div>
      {/* Delete this button later! */}
        <button
          type="button"
          onClick={() => moveTaskToToday("6")}
          className="text-xs text-tertiary hover:underline cursor-pointer"
        >
          Demo: move &quot;Submit asset pack&quot; to today
        </button>
      </div>

      <MonthCalendar
        tasks={tasks}
        onTaskClick={(task) => console.log("open task detail", task)}
      />
    </Container>
  );
}
