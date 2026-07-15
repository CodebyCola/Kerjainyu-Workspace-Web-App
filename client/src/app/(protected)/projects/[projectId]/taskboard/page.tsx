"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import { CreateTaskModal } from "@/components/taskboard/CreateTaskModal";
import { KanbanBoard } from "@/components/taskboard/KanbanBoard";
import { KanbanColumn } from "@/components/taskboard/KanbanColumn";
import { TaskCard, type TaskStatus } from "@/components/taskboard/TaskCard";
import { ROUTES } from "@/routes/route";
import {
  getProjectById,
  type Project,
} from "@/service/project/project.service";
import {
  claimTask,
  formatDeadlineLabel,
  getTasks,
  isTaskUrgent,
  type Task,
} from "@/service/task/task.service";
import { getErrorMessage } from "@/utils/Errors";
import { getInitials } from "@/utils/Avatar";

type LoadStatus = "loading" | "error" | "ready";

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

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const [projectData, tasksData] = await Promise.all([
        getProjectById(projectId),
        getTasks(projectId),
      ]);
      setProject(projectData);
      setTasks(tasksData);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setStatus("error");
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    setErrorMessage(null);
    try {
      const updated = await claimTask(projectId, task.id);

      setTasks((prev) => {
        const next = prev.map((t) => (t.id === updated.id ? updated : t));
        return next;
      });
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
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
            {errorMessage ?? "Could not load the task board."}
          </p>
          <button
            type="button"
            onClick={loadData}
            className="text-xs font-medium text-tertiary hover:opacity-80 transition-opacity duration-150 ease-in-out cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && (
        <>
          {errorMessage && (
            <p role="alert" className="text-xs text-danger mb-3 px-1">
              {errorMessage}
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
