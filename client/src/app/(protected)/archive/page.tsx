"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import {
  ArchivedProjectCard,
  type ProjectStatus,
} from "@/components/projects/ArchivedProjectCard";

// Demo data shaped like a real query result: projects where
// is_archived_at is not null, joined with a member count from
// project_members (status = "active"). In production this comes from
// a dedicated "archived projects" query, separate from the active
// project list on app/projects/page.tsx.
interface ArchivedProject {
  id: string;
  title: string;
  status: ProjectStatus;
  memberCount: number;
  archivedDate: string;
}

const archivedProjects: ArchivedProject[] = [
  {
    id: "1",
    title: "Q3 Marketing Campaign",
    status: "completed",
    memberCount: 5,
    archivedDate: "Jun 28, 2026",
  },
  {
    id: "2",
    title: "Internal Tools Migration",
    status: "completed",
    memberCount: 3,
    archivedDate: "Jun 14, 2026",
  },
  {
    id: "3",
    title: "Client Onboarding Flow Revamp",
    status: "ongoing",
    memberCount: 4,
    archivedDate: "May 30, 2026",
  },
];

export default function ArchivePage() {
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState(archivedProjects);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) =>
      project.title.toLowerCase().includes(q),
    );
  }, [projects, query]);

  function handleUnarchive(id: string) {
    // In production this calls the inverse of archiveProject() —
    // PATCH /projects/:id with is_archived_at: null — then refetches
    // or optimistically removes it from this list, same as below.
    setProjects((prev) => prev.filter((project) => project.id !== id));
  }

  return (
    <Container>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Archive</h1>
          <span className="text-sm text-text-secondary">
            Projects you've archived
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
            placeholder="Search archived projects..."
            className="bg-surface border border-outline-subtle rounded-md pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary w-full sm:w-64"
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <p className="text-sm text-text-muted px-1">
          {projects.length === 0
            ? "You don't have any archived projects."
            : "No archived projects match your search."}
        </p>
      ) : (
        <div className="bg-surface border border-outline-subtle rounded-lg divide-y divide-outline-subtle px-4">
          {filteredProjects.map((project) => (
            <ArchivedProjectCard
              key={project.id}
              title={project.title}
              status={project.status}
              memberCount={project.memberCount}
              archivedDate={project.archivedDate}
              onUnarchive={() => handleUnarchive(project.id)}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
