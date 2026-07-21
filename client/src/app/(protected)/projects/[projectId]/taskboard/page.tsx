"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import { CreateTaskModal } from "@/components/taskboard/CreateTaskModal";
import { KanbanBoard } from "@/components/taskboard/KanbanBoard";
import { KanbanColumn } from "@/components/taskboard/KanbanColumn";
import { TaskCard, type TaskStatus } from "@/components/taskboard/TaskCard";
import { ROUTES } from "@/routes/route";
import { useTasks } from "@/hooks/useTasks";
import { useProject } from "@/hooks/useProject";
import {
  claimTask,
  formatDeadlineLabel,
  isTaskUrgent,
  type Task,
} from "@/service/task/task.service";
import { getErrorMessage } from "@/utils/Errors";
import { getInitials } from "@/utils/Avatar";

const COLUMNS: TaskStatus[] = [
  "unclaimed",
  "todo",
  "ongoing",
  "submitted",
  "in_revision",
  "approved",
  "rejected",
];

function ownerInitialsFor(task: Task): string | undefined {
  if (!task.assignee_id) return undefined;
  return getInitials(task.assignee_username);
}

export default function Taskboard({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();

  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    project,
    isLoading: isProjectLoading,
    error: projectError,
    reload: reloadProject,
  } = useProject(projectId);

  const {
    tasks,
    setTasks,
    isLoading: isTasksLoading,
    error: tasksError,
    reload: reloadTasks,
  } = useTasks(projectId);

  const status =
    isProjectLoading || isTasksLoading
      ? "loading"
      : projectError || tasksError
        ? "error"
        : "ready";

  const loadErrorMessage = projectError
    ? getErrorMessage(projectError)
    : tasksError
      ? getErrorMessage(tasksError)
      : null;

  function handleRetry() {
    reloadProject();
    reloadTasks();
  }

  const tasksByStatus = useMemo(() => {
    const grouped = new Map<TaskStatus, Task[]>();
    for (const column of COLUMNS) grouped.set(column, []);
    for (const task of tasks) {
      grouped.get(task.status)?.push(task);
    }
    return grouped;
  }, [tasks]);

  const isLeader = project?.role === "leader";

  async function handleClaim(task: Task) {
    setClaimingId(task.id);
    setActionError(null);
    try {
      const updated = await claimTask(projectId, task.id);

      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setClaimingId(null);
    }
  }

  function handleCreated(task: Task) {
    setTasks((prev) => [task, ...prev]);

    requestAnimationFrame(() => {
      setModalOpen(false);
    });
  }

  return (
    <Container>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Task board</h1>
          <span className="text-sm text-text-secondary">
            {project?.title ?? (status === "loading" ? "Loading..." : "")}
          </span>
        </div>

        {isLeader && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer shrink-0"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add task
          </button>
        )}
      </div>

      {status === "loading" && (
        <p className="text-sm text-text-muted px-1">Loading task board...</p>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-2 px-1">
          <p className="text-sm text-danger">
            {loadErrorMessage ?? "Could not load the task board."}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-xs font-medium text-tertiary hover:opacity-80 transition-opacity duration-150 ease-in-out cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && (
        <>
          {actionError && (
            <p role="alert" className="text-xs text-danger mb-3 px-1">
              {actionError}
            </p>
          )}

          <KanbanBoard>
            {COLUMNS.map((column) => {
              const columnTasks = tasksByStatus.get(column) ?? [];
              return (
                <KanbanColumn
                  key={column}
                  status={column}
                  count={columnTasks.length}
                >
                  {columnTasks.length === 0 ? (
                    <p className="text-xs text-text-muted px-1 py-2">
                      No tasks here.
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        title={task.title}
                        status={task.status}
                        deadline={formatDeadlineLabel(task.deadline)}
                        isUrgent={isTaskUrgent(task)}
                        ownerInitials={ownerInitialsFor(task)}
                        onClaim={
                          task.is_claimable
                            ? () => handleClaim(task)
                            : undefined
                        }
                        isClaiming={claimingId === task.id}
                        onClick={() =>
                          router.push(
                            `${ROUTES.PROJECT_TASKBOARD(projectId)}/${task.id}`,
                          )
                        }
                      />
                    ))
                  )}
                </KanbanColumn>
              );
            })}
          </KanbanBoard>
        </>
      )}

      {isLeader && modalOpen && (
        <CreateTaskModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          projectId={projectId}
          onCreated={handleCreated}
        />
      )}
    </Container>
  );
}