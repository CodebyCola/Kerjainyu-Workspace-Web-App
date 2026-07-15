"use client";

import Container from "@/components/layout/Container";
import { TaskFilterBar } from "@/components/mytask/TaskFilterBar";
import { TaskTableRow } from "@/components/mytask/TaskTableRow";
import type { TaskStatus } from "@/components/taskboard/TaskCard";

interface MyTaskRow {
  id: string;
  title: string;
  projectTitle: string;
  status: TaskStatus;
  deadlineLabel?: string;
  isUrgent?: boolean;
  priorityLabel?: string;
}

// Demo data shaped like a real query result: tasks WHERE owner_id =
// current user, joined with projects for the project title. In
// production this is the same task list Task Board reads, just
// filtered to the current user and sorted by priority/deadline instead
// of grouped by status.
const myTasks: MyTaskRow[] = [
  {
    id: "1",
    title: "Implement new navigation shell",
    projectTitle: "Website Redesign Sprint",
    status: "ongoing",
    deadlineLabel: "Today",
    isUrgent: true,
    priorityLabel: "High",
  },
  {
    id: "2",
    title: "Fix auth bug on login redirect",
    projectTitle: "Website Redesign Sprint",
    status: "in_revision",
    deadlineLabel: "Tomorrow",
    priorityLabel: "High",
  },
  {
    id: "3",
    title: "Draft project brief",
    projectTitle: "Mobile App Beta Launch",
    status: "todo",
    deadlineLabel: "Oct 18",
    priorityLabel: "Medium",
  },
  {
    id: "4",
    title: "Review onboarding copy",
    projectTitle: "Website Redesign Sprint",
    status: "submitted",
    deadlineLabel: "Oct 20",
  },
  {
    id: "5",
    title: "Research accessibility audit tools",
    projectTitle: "Mobile App Beta Launch",
    status: "todo",
  },
  {
    id: "6",
    title: "Send follow-up email to client",
    projectTitle: "Q4 Marketing Campaign",
    status: "approved",
    deadlineLabel: "Oct 05",
  },
];

export default function MyTask() {
  return (
    <Container>
      <div className="flex flex-col gap-1 mb-6 px-1">
        <h1 className="text-2xl font-bold text-text-primary">My Tasks</h1>
        <span className="text-sm text-text-secondary">
          Tasks assigned to you across all projects
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <TaskFilterBar />

        <div className="bg-surface border border-outline-subtle rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-outline-subtle bg-surface-container/40">
                <th className="text-left text-xs font-medium text-text-secondary py-2.5 pl-4 pr-3">
                  Task
                </th>
                <th className="text-left text-xs font-medium text-text-secondary py-2.5 px-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-text-secondary py-2.5 px-3">
                  Priority
                </th>
                <th className="text-right text-xs font-medium text-text-secondary py-2.5 pl-3 pr-4">
                  Deadline
                </th>
              </tr>
            </thead>
            <tbody>
              {myTasks.map((task) => (
                <TaskTableRow
                  key={task.id}
                  title={task.title}
                  projectTitle={task.projectTitle}
                  status={task.status}
                  deadlineLabel={task.deadlineLabel}
                  isUrgent={task.isUrgent}
                  priorityLabel={task.priorityLabel}
                  onClick={() => console.log("open task", task.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
