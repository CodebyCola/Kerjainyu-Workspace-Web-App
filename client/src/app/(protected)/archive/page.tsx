"use client";

import { format } from "date-fns";
import { Archive, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import { ArchivedProjectCard } from "@/components/projects/ArchivedProjectCard";
import { ROUTES } from "@/routes/route";
import {
  getProjects,
  type Project,
  unarchiveProject,
} from "@/service/project/project.service";
import { getErrorMessage } from "@/utils/Errors";

type LoadStatus = "loading" | "error" | "ready";

export default function ArchivePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [unarchivingId, setUnarchivingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const data = await getProjects();
      setProjects(data.filter((project) => project.is_archived));
      setStatus("ready");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) =>
      project.title.toLowerCase().includes(q),
    );
  }, [projects, query]);

  async function handleUnarchive(project: Project) {
    setUnarchivingId(project.id);
    setErrorMessage(null);
    try {
      await unarchiveProject(project.id);
      // Server-confirmed — drop it from this list rather than mark it
      // some other way, since "archived" is the entire reason it's on
      // this page at all.
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setUnarchivingId(null);
    }
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

      {status === "loading" && (
        <p className="text-sm text-text-muted px-1">
          Loading archived projects...
        </p>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-2 px-1">
          <p className="text-sm text-danger">
            {errorMessage ?? "Could not load archived projects."}
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
            <p role="alert" className="text-xs text-danger px-1 mb-3">
              {errorMessage}
            </p>
          )}

          {filteredProjects.length === 0 ? (
            projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 text-center bg-surface border border-outline-subtle rounded-lg py-16 px-6">
                <div className="flex items-center justify-center size-12 rounded-full bg-surface-container text-text-secondary">
                  <Archive className="size-6" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-text-primary">
                    No archived projects
                  </p>
                  <p className="text-sm text-text-secondary max-w-sm">
                    Projects you archive from their Settings page show up here —
                    nothing's archived right now.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted px-1">
                No archived projects match your search.
              </p>
            )
          ) : (
            <div className="bg-surface border border-outline-subtle rounded-lg divide-y divide-outline-subtle px-4">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={ROUTES.PROJECT_SETTINGS(project.id)}
                  className="block"
                >
                  <ArchivedProjectCard
                    title={project.title}
                    status={project.status}
                    memberCount={project.memberCount}
                    archivedDate={
                      project.is_archived_at
                        ? format(
                          new Date(project.is_archived_at),
                          "MMM d, yyyy",
                        )
                        : "unknown date"
                    }
                    onUnarchive={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnarchive(project);
                    }}
                    unarchiving={unarchivingId === project.id}
                  />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </Container>
  );
}