"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Container from "@/components/layout/Container";
import { MyTaskEmptyState } from "@/components/mytask/MyTaskEmptyState";
import { TaskFilterBar } from "@/components/mytask/TaskFilterBar";
import { TaskTableRow } from "@/components/mytask/TaskTableRow";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import type { TaskStatus } from "@/components/taskboard/TaskCard";
import { ROUTES } from "@/routes/route";
import { getProjects } from "@/service/project/project.service";
import {
  formatDeadlineLabel,
  formatPriorityLabel,
  getMyTasks,
  isTaskUrgent,
  type MyTask,
  type MyTaskSort,
} from "@/service/task/task.service";
import { getErrorMessage } from "@/utils/Errors";

type LoadStatus = "loading" | "error" | "ready";

export default function MyTaskPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // null = "haven't checked yet" so the empty state doesn't flash
  // "no projects" for a returning member while the very first
  // project-membership check is still in flight.
  const [hasProjects, setHasProjects] = useState<boolean | null>(null);

  const [activeStatus, setActiveStatus] = useState<TaskStatus | "all">("all");
  const [activeSort, setActiveSort] = useState<MyTaskSort>("deadline_asc");
  const [modalOpen, setModalOpen] = useState(false);

  // Membership is checked once — whether the user belongs to any
  // project at all doesn't change based on the status/sort filters
  // below, so it doesn't need to re-run every time those change.
  useEffect(() => {
    getProjects()
      .then((projects) => setHasProjects(projects.length > 0))
      .catch(() => setHasProjects(null));
  }, []);

  const loadTasks = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const data = await getMyTasks({ status: activeStatus, sort: activeSort });
      setTasks(data);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setStatus("error");
    }
  }, [activeStatus, activeSort]);

  // Re-fetches from the server on every filter/sort change instead of
  // filtering the previously-loaded list client-side — status and sort
  // are both applied in the DB query (see task.service.ts), so this
  // keeps "My Tasks" from ever holding more rows in memory or in the
  // DOM than the current view actually needs.
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const isFiltered = activeStatus !== "all";

  function handleProjectCreated() {
    setModalOpen(false);
    setHasProjects(true);
    // The new project has no tasks yet, so there's nothing to
    // re-fetch here — the table stays on whatever empty state applies.
  }

  return (
    <Container>
      <div className="flex flex-col gap-1 mb-6 px-1">
        <h1 className="text-2xl font-bold text-text-primary">My Tasks</h1>
        <span className="text-sm text-text-secondary">
          Tasks assigned to you across all projects
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <TaskFilterBar
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          activeSort={activeSort}
          onSortChange={setActiveSort}
        />

        {status === "loading" && (
          <p className="text-sm text-text-muted px-1">Loading your tasks...</p>
        )}

        {status === "error" && (
          <div className="flex flex-col items-start gap-2 px-1">
            <p className="text-sm text-danger">
              {errorMessage ?? "Could not load your tasks."}
            </p>
            <button
              type="button"
              onClick={loadTasks}
              className="text-xs font-medium text-tertiary hover:opacity-80 transition-opacity duration-150 ease-in-out cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {status === "ready" && tasks.length === 0 && (
          <MyTaskEmptyState
            hasNoProjects={hasProjects === false}
            isFiltered={isFiltered}
            onCreateProject={() => setModalOpen(true)}
          />
        )}

        {status === "ready" && tasks.length > 0 && (
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
                {tasks.map((task) => (
                  <TaskTableRow
                    key={task.id}
                    title={task.title}
                    projectTitle={task.project_title}
                    status={task.status}
                    deadlineLabel={formatDeadlineLabel(task.deadline)}
                    isUrgent={isTaskUrgent(task)}
                    priorityLabel={formatPriorityLabel(task.priority)}
                    onClick={() =>
                      router.push(ROUTES.PROJECT_TASKBOARD(task.project_id))
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleProjectCreated}
      />
    </Container>
  );
}
