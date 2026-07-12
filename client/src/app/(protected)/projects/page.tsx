"use client";

import clsx from "clsx";
import { Search, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import { ROUTES } from "@/routes/route";

// Demo data. In production this is GET /projects (projects the user
// is an active member of), same shape the taskboard/team/calendar/files
// pages' PROJECT_TITLES lookups stand in for until there's a real
// project store/query cache shared across all of them.
interface ProjectSummary {
  id: string;
  title: string;
  status: "ongoing" | "completed";
  memberCount: number;
}

const projects: ProjectSummary[] = [
  {
    id: "1",
    title: "Website Redesign Sprint",
    status: "ongoing",
    memberCount: 4,
  },
  { id: "2", title: "Mobile App Launch", status: "ongoing", memberCount: 6 },
];

const STATUS_STYLES: Record<
  ProjectSummary["status"],
  { badgeBg: string; badgeText: string; label: string }
> = {
  ongoing: {
    badgeBg: "bg-surface-container",
    badgeText: "text-tertiary",
    label: "Ongoing",
  },
  completed: {
    badgeBg: "bg-success-container",
    badgeText: "text-success",
    label: "Completed",
  },
};

export default function Projects() {
  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) =>
      project.title.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Container>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <span className="text-sm text-text-secondary">
            Projects you're a member of
          </span>
        </div>

        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="bg-surface border border-outline-subtle rounded-md pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary w-full sm:w-64"
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <p className="text-sm text-text-muted px-1">
          No projects match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const style = STATUS_STYLES[project.status];
            return (
              <Link
                key={project.id}
                href={ROUTES.PROJECT_TASKBOARD(project.id)}
                className={clsx(
                  "flex flex-col gap-3 bg-surface border border-outline-subtle rounded-lg p-4",
                  "hover:border-tertiary transition-colors duration-150 ease-in-out",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-text-primary leading-snug">
                    {project.title}
                  </p>
                  <span
                    className={clsx(
                      "text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0",
                      style.badgeBg,
                      style.badgeText,
                    )}
                  >
                    {style.label}
                  </span>
                </div>

                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Users className="size-3.5" aria-hidden="true" />
                  {project.memberCount}{" "}
                  {project.memberCount === 1 ? "member" : "members"}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
