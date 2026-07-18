"use client";

import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import {
  type Task as CalendarTask,
  MonthCalendar,
} from "@/components/calendar/MonthCalendar";
import Container from "@/components/layout/Container";
import { ROUTES } from "@/routes/route";
import {
  getProjectById,
  type Project,
} from "@/service/project/project.service";
import {
  getTasks,
  type Task,
  toCalendarTask,
} from "@/service/task/task.service";
import { getErrorMessage } from "@/utils/Errors";

type LoadStatus = "loading" | "error" | "ready";

export default function Calendar({
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

  const calendarTasks = useMemo(() => tasks.map(toCalendarTask), [tasks]);

  function handleTaskClick(task: CalendarTask) {
    router.push(`${ROUTES.PROJECT_TASKBOARD(projectId)}/${task.id}`);
  }

  return (
    <Container>
      <div className="flex items-start justify-between mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Calendar</h1>
          <span className="text-sm text-text-secondary">
            {project?.title ?? (status === "loading" ? "Loading..." : "")}
          </span>
        </div>
      </div>

      {status === "loading" && (
        <p className="text-sm text-text-muted px-1">Loading calendar...</p>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-2 px-1">
          <p className="text-sm text-danger">
            {errorMessage ?? "Could not load the calendar."}
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
        <MonthCalendar tasks={calendarTasks} onTaskClick={handleTaskClick} />
      )}
    </Container>
  );
}
