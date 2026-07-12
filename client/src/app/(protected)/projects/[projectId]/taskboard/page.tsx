"use client";

import { use } from "react";
import Container from "@/components/layout/Container";
import { KanbanBoard } from "@/components/taskboard/KanbanBoard";
import { KanbanColumn } from "@/components/taskboard/KanbanColumn";
import { TaskCard, type TaskStatus } from "@/components/taskboard/TaskCard";

// HardCoded {change later}
const columns: {
  status: TaskStatus;
  tasks: {
    title: string;
    deadline?: string;
    isUrgent?: boolean;
    ownerInitials?: string;
  }[];
}[] = [
  {
    status: "unclaimed",
    tasks: [
      {
        title: "Audit existing design system tokens",
        deadline: "Today",
        isUrgent: true,
      },
      {
        title: "Write API documentation for auth endpoints",
        deadline: "Tomorrow",
      },
      { title: "Set up analytics tracking events" },
      { title: "Create onboarding email templates", deadline: "Oct 20" },
      { title: "Research accessibility audit tools" },
      { title: "Draft social media announcement copy" },
    ],
  },
  {
    status: "todo",
    tasks: [
      {
        title: "Draft landing page wireframes",
        deadline: "Tomorrow",
        ownerInitials: "JD",
      },
      {
        title: "Set up CI pipeline for staging",
        deadline: "Oct 16",
        ownerInitials: "MK",
      },
    ],
  },
  {
    status: "ongoing",
    tasks: [
      {
        title: "Implement new navigation shell",
        deadline: "Oct 15",
        ownerInitials: "MK",
      },
      {
        title: "Build task board UI components",
        deadline: "Oct 17",
        ownerInitials: "DP",
      },
    ],
  },
  {
    status: "in_revision",
    tasks: [
      { title: "Draft project brief", deadline: "Oct 18", ownerInitials: "DP" },
    ],
  },
  {
    status: "submitted",
    tasks: [
      {
        title: "Build task board logic",
        deadline: "Oct 15",
        ownerInitials: "NC",
      },
    ],
  },
];

// Demo lookup. In production this is GET /projects/:id — the id comes
// from the route param below, not a hardcoded string, so each project
// gets its own board.
const PROJECT_TITLES: Record<string, string> = {
  "1": "Website Redesign Sprint",
  "2": "Mobile App Launch",
};

export default function TaskBoard({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const projectTitle = PROJECT_TITLES[projectId] ?? "Unknown project";

  return (
    <Container>
      <div className="flex flex-col gap-1 mb-6 px-1">
        <h1 className="text-2xl font-bold text-text-primary">{projectTitle}</h1>
        <span className="w-fit text-xs px-2 py-0.5 rounded-full bg-surface-container text-text-secondary">
          team number
        </span>
      </div>

      <KanbanBoard>
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            count={column.tasks.length}
          >
            {column.tasks.map((task) => (
              <TaskCard
                key={task.title}
                title={task.title}
                status={column.status}
                deadline={task.deadline}
                isUrgent={task.isUrgent}
                ownerInitials={task.ownerInitials}
                onClaim={
                  column.status === "unclaimed"
                    ? () => console.log("claim", task.title)
                    : undefined
                }
              />
            ))}
          </KanbanColumn>
        ))}
      </KanbanBoard>
    </Container>
  );
}
