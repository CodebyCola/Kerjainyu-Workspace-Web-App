"use client";

import { differenceInCalendarDays, format } from "date-fns";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ROUTES } from "@/routes/route";
import { getProjects, type Project } from "@/service/project/project.service";
import { getErrorMessage } from "@/utils/Errors";
import { isProjectUrgent } from "@/service/project/project.service";

type LoadStatus = "loading" | "error" | "ready";

/**
 * True when the project has a deadline, isn't already completed, and
 * that deadline is fewer than 3 days out — including today and
 * already-overdue deadlines (a negative day count is still "urgent",
 * arguably more so). Completed projects are excluded because a
 * finished project's original deadline isn't something anyone still
 * needs to race against.
 */

/**
 * GET /projects (see project.service.ts) already scopes results to
 * the current session's active memberships server-side — there is no
 * client-side filtering by user here because there's nothing to
 * filter; the server never returns another user's projects in the
 * first place. Archived projects are excluded on the server too
 * (they live on the Archive page instead, see (protected)/archive).
 */
export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const data = await getProjects();
      setProjects(data.filter((project) => !project.is_archived));
      setStatus("ready");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) =>
      project.title.toLowerCase().includes(q),
    );
  }, [query, projects]);

  function handleCreated(project: Project) {
    setModalOpen(false);
    // Prepend rather than re-fetch — the server already confirmed the
    // create, so a full round-trip here would just be a slower way to
    // show the same thing the response already gave us.
    setProjects((prev) => [project, ...prev]);
  }

  return (
    <Container>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <span className="text-sm text-text-secondary">
            Projects you're a member of
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
              placeholder="Search projects..."
              className="bg-surface border border-outline-subtle rounded-md pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary w-full sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer shrink-0"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            New project
          </button>
        </div>
      </div>

      {status === "loading" && (
        <p className="text-sm text-text-muted px-1">Loading projects...</p>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-2 px-1">
          <p className="text-sm text-danger">
            {errorMessage ?? "Could not load your projects."}
          </p>
          <button
            type="button"
            onClick={loadProjects}
            className="text-xs font-medium text-tertiary hover:opacity-80 transition-opacity duration-150 ease-in-out cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && filteredProjects.length === 0 && (
        <p className="text-sm text-text-muted px-1">
          {projects.length === 0
            ? "You're not a member of any projects yet."
            : "No projects match your search."}
        </p>
      )}

      {status === "ready" && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Link key={project.id} href={ROUTES.PROJECT_TASKBOARD(project.id)}>
              <ProjectCard
                title={project.title}
                role={project.role}
                status={project.status}
                memberCount={project.memberCount}
                deadlineLabel={
                  project.deadline
                    ? `Due ${format(new Date(project.deadline), "MMM d")}`
                    : undefined
                }
                isUrgent={isProjectUrgent(project)}
              />
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </Container>
  );
}
