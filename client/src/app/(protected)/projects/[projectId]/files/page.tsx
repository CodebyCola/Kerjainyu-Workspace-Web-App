"use client";

import clsx from "clsx";
import { Search } from "lucide-react";
import { use, useMemo, useState } from "react";
import {
  AttachmentRow,
  type AttachmentType,
} from "@/components/files/AttachmentRow";
import Container from "@/components/layout/Container";
import {
  getStatusStyle,
  type TaskStatus,
} from "@/components/taskboard/TaskCard";

// Demo lookup, same shape as the other project-scoped pages.
const PROJECT_TITLES: Record<string, string> = {
  "1": "Website Redesign Sprint",
  "2": "Mobile App Launch",
};

// Demo data shaped like a real query result: task_submissions joined
// with submission_attachments, grouped by task. In production this
// comes from the latest submission per task (see the "View earlier
// submissions" note below for the revision-history case).
interface AttachmentGroup {
  taskId: string;
  taskTitle: string;
  taskStatus: TaskStatus;
  attachments: {
    id: string;
    type: AttachmentType;
    name?: string;
    preview?: string;
    submittedBy: string;
    submittedDate: string;
  }[];
}

const groups: AttachmentGroup[] = [
  {
    taskId: "1",
    taskTitle: "Implement new navigation shell",
    taskStatus: "ongoing",
    attachments: [
      {
        id: "a1",
        type: "file",
        name: "navigation-v2.fig",
        submittedBy: "Maya Kartika",
        submittedDate: "Oct 12",
      },
      {
        id: "a2",
        type: "link",
        name: "Research Docs",
        submittedBy: "Julian D.",
        submittedDate: "Oct 11",
      },
      {
        id: "a3",
        type: "text",
        preview:
          "Note: Updated the breakpoint logic to match the new Tailwind config.",
        submittedBy: "Maya Kartika",
        submittedDate: "Oct 10",
      },
    ],
  },
  {
    taskId: "2",
    taskTitle: "Draft landing page wireframes",
    taskStatus: "submitted",
    attachments: [
      {
        id: "a4",
        type: "image",
        name: "hero-section-v1.png",
        submittedBy: "Julian D.",
        submittedDate: "Oct 08",
      },
    ],
  },
];

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
  const projectTitle = PROJECT_TITLES[projectId] ?? "Unknown project";
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filteredGroups = useMemo(() => {
    const typeFilter = FILTER_TO_TYPE[activeFilter];

    return groups
      .map((group) => ({
        ...group,
        attachments: group.attachments.filter((att) => {
          const matchesType = !typeFilter || att.type === typeFilter;
          const haystack = (att.name ?? att.preview ?? "").toLowerCase();
          const matchesQuery = haystack.includes(query.toLowerCase());
          return matchesType && matchesQuery;
        }),
      }))
      .filter((group) => group.attachments.length > 0);
  }, [query, activeFilter]);

  return (
    <Container>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Files</h1>
          <span className="text-sm text-text-secondary">{projectTitle}</span>
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

      <div className="flex flex-col gap-6">
        {filteredGroups.length === 0 ? (
          <p className="text-sm text-text-muted px-1">
            No files match your search.
          </p>
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
                      name={att.name}
                      preview={att.preview}
                      submittedBy={att.submittedBy}
                      submittedDate={att.submittedDate}
                      onDownload={() => console.log("download", att.id)}
                      onOpen={() => console.log("open", att.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Container>
  );
}
