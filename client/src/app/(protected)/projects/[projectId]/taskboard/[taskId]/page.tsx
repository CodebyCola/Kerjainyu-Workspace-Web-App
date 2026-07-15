"use client";

import clsx from "clsx";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import Container from "@/components/layout/Container";
import { getStatusStyle } from "@/components/taskboard/TaskCard";
import { ROUTES } from "@/routes/route";
import {
  getProjectById,
  type Project,
} from "@/service/project/project.service";
import { claimTask, getTaskById, type Task } from "@/service/task/task.service";
import { getErrorMessage } from "@/utils/Errors";

type LoadStatus = "loading" | "error" | "ready";

export default function TaskDetail({
  params,
}: {
  params: Promise<{ projectId: string; taskId: string }>;
}) {
  const { projectId, taskId } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const loadData = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const [projectData, taskData] = await Promise.all([
        getProjectById(projectId),
        getTaskById(projectId, taskId),
      ]);
      setProject(projectData);
      setTask(taskData);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setStatus("error");
    }
  }, [projectId, taskId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleClaim() {
    setClaiming(true);
    setErrorMessage(null);
    try {
      const updated = await claimTask(projectId, taskId);
      setTask(updated);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setClaiming(false);
    }
  }

  const backHref = ROUTES.PROJECT_TASKBOARD(projectId);

  return (
    <Container>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out mb-6 px-1"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to task board
      </Link>

      {status === "loading" && (
        <p className="text-sm text-text-muted px-1">Loading task...</p>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-2 px-1">
          <p className="text-sm text-danger">
            {errorMessage ?? "Could not load this task."}
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

      {status === "ready" && task && (
        <div className="flex flex-col gap-6 max-w-2xl">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={clsx(
                  "text-xs font-medium px-2 py-0.5 rounded-md",
                  getStatusStyle(task.status).badgeBg,
                  getStatusStyle(task.status).badgeText,
                )}
              >
                {getStatusStyle(task.status).label}
              </span>
              {project && (
                <span className="text-xs text-text-muted">{project.title}</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-text-primary leading-snug">
              {task.title}
            </h1>

            {task.deadline && (
              <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Calendar className="size-4" aria-hidden="true" />
                Due {format(new Date(task.deadline), "MMM d, yyyy")}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-secondary">
              Description
            </span>
            <p className="text-sm text-text-primary whitespace-pre-wrap">
              {task.description ?? (
                <span className="text-text-muted">No description yet.</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-text-secondary">
                Assignee
              </span>
              <span className="text-text-primary">
                {task.assignee_id ? `User #${task.assignee_id}` : "Unassigned"}
              </span>
            </div>

            {task.priority !== null && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-text-secondary">
                  Priority
                </span>
                <span className="text-text-primary">{task.priority}</span>
              </div>
            )}
          </div>

          {task.status === "unclaimed" && task.is_claimable && (
            <button
              type="button"
              disabled={claiming}
              onClick={handleClaim}
              className={clsx(
                "flex items-center justify-center gap-2 self-start text-sm font-medium px-4 py-2 rounded-md",
                "bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer",
                claiming && "opacity-60 cursor-wait",
              )}
            >
              {claiming && <Loader2 className="size-4 animate-spin" />}
              {claiming ? "Claiming..." : "Claim this task"}
            </button>
          )}

          {task.status === "unclaimed" && !task.is_claimable && (
            <p className="text-xs text-text-muted">
              This task isn't open for self-claiming — the project leader will
              assign it.
            </p>
          )}

          {errorMessage && status === "ready" && (
            <p role="alert" className="text-xs text-danger">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </Container>
  );
}
