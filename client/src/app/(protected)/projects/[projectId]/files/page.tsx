"use client";

import clsx from "clsx";
import { format } from "date-fns";
import { FolderOpen, Search } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import {
  AttachmentRow,
  type AttachmentType,
} from "@/components/files/AttachmentRow";
import Container from "@/components/layout/Container";
import { getStatusStyle } from "@/components/taskboard/TaskCard";
import { ROUTES } from "@/routes/route";
import {
  getProjectAttachments,
  type ProjectAttachment,
} from "@/service/files/files.service";
import {
  getProjectById,
  type Project,
} from "@/service/project/project.service";
import { displayNameForAttachment } from "@/utils/Attachment";
import { getErrorMessage } from "@/utils/Errors";

type LoadStatus = "loading" | "error" | "ready";

const FILTERS = ["All", "Files", "Images", "Links"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_TO_TYPE: Record<Filter, AttachmentType | null> = {
  All: null,
  Files: "file",
  Images: "image",
  Links: "link",
};

export default function Files({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const loadData = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const [projectData, attachmentsData] = await Promise.all([
        getProjectById(projectId),
        getProjectAttachments(projectId),
      ]);
      setProject(projectData);
      setAttachments(attachmentsData);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setStatus("error");
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredGroups = useMemo(() => {
    const typeFilter = FILTER_TO_TYPE[activeFilter];
    const q = query.trim().toLowerCase();

    const matches = attachments.filter((att) => {
      const matchesType = !typeFilter || att.type === typeFilter;
      const haystack = (
        displayNameForAttachment(att) ?? att.content
      ).toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesType && matchesQuery;
    });

    const order: number[] = [];
    const byTask = new Map<number, ProjectAttachment[]>();
    for (const att of matches) {
      if (!byTask.has(att.task_id)) {
        byTask.set(att.task_id, []);
        order.push(att.task_id);
      }
      byTask.get(att.task_id)?.push(att);
    }

    return order.map((taskId) => {
      const group = byTask.get(taskId) ?? [];
      return {
        taskId,
        taskTitle: group[0].task_title,
        taskStatus: group[0].task_status,
        attachments: group,
      };
    });
  }, [attachments, query, activeFilter]);

  function handleOpen(attachment: ProjectAttachment) {
    window.open(attachment.content, "_blank", "noopener,noreferrer");
  }

  return (
    <Container>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Files</h1>
          <span className="text-sm text-text-secondary">
            {project?.title ?? (status === "loading" ? "Loading..." : "")}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-text-muted"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files..."
              className="bg-surface border border-outline-subtle rounded-md pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary"
            />
          </div>

          <div className="flex items-center gap-1 bg-surface border border-outline-subtle rounded-md p-1">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={clsx(
                  "text-xs font-medium px-3 py-1 rounded transition-colors duration-150 ease-in-out cursor-pointer",
                  activeFilter === filter
                    ? "bg-tertiary text-on-tertiary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {status === "loading" && (
        <p className="text-sm text-text-muted px-1">Loading files...</p>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-2 px-1">
          <p className="text-sm text-danger">
            {errorMessage ?? "Could not load files."}
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
        <div className="flex flex-col gap-6">
          {filteredGroups.length === 0 ? (
            attachments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 text-center bg-surface border border-outline-subtle rounded-lg py-16 px-6">
                <div className="flex items-center justify-center size-12 rounded-full bg-surface-container text-text-secondary">
                  <FolderOpen className="size-6" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-text-primary">
                    No files yet
                  </p>
                  <p className="text-sm text-text-secondary max-w-sm">
                    Files show up here once someone submits work on a task —
                    attachments from every submission in this project land in
                    one place.
                  </p>
                </div>
                <Link
                  href={ROUTES.PROJECT_TASKBOARD(projectId)}
                  className="text-sm font-medium px-3 py-1.5 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer mt-2"
                >
                  Go to Task Board
                </Link>
              </div>
            ) : (
              <p className="text-sm text-text-muted px-1">
                No files match your search.
              </p>
            )
          ) : (
            filteredGroups.map((group) => {
              const style = getStatusStyle(group.taskStatus);
              return (
                <div key={group.taskId} className="flex flex-col">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <p className="text-sm font-semibold text-text-primary">
                      {group.taskTitle}
                    </p>
                    <span
                      className={clsx(
                        "text-[11px] font-medium px-2 py-0.5 rounded-md",
                        style.badgeBg,
                        style.badgeText,
                      )}
                    >
                      {style.label}
                    </span>
                  </div>

                  <div className="divide-y divide-outline-subtle">
                    {group.attachments.map((att) => (
                      <AttachmentRow
                        key={att.id}
                        type={att.type}
                        name={displayNameForAttachment(att)}
                        preview={att.type === "text" ? att.content : undefined}
                        submittedBy={att.submitted_by_username}
                        submittedDate={format(
                          new Date(att.created_at),
                          "MMM d",
                        )}
                        onDownload={() => handleOpen(att)}
                        onOpen={() => handleOpen(att)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </Container>
  );
}
