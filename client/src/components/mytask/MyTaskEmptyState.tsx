"use client";

import { ClipboardList, FolderPlus, Users } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/routes/route";

interface MyTaskEmptyStateProps {
  hasNoProjects: boolean;
  isFiltered: boolean;
  onCreateProject: () => void;
}

export function MyTaskEmptyState({
  hasNoProjects,
  isFiltered,
  onCreateProject,
}: MyTaskEmptyStateProps) {
  if (hasNoProjects) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center bg-surface border border-outline-subtle rounded-lg py-16 px-6">
        <div className="flex items-center justify-center size-12 rounded-full bg-surface-container text-text-secondary">
          <Users className="size-6" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-text-primary">
            You're not part of any project yet
          </p>
          <p className="text-sm text-text-secondary max-w-sm">
            Tasks show up here once you join a project as a member, or create
            one yourself and start assigning work.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={onCreateProject}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer"
          >
            <FolderPlus className="size-3.5" aria-hidden="true" />
            Create a project
          </button>
          <Link
            href={ROUTES.PROJECTS}
            className="text-sm font-medium px-3 py-1.5 rounded-md border border-outline-subtle text-text-secondary hover:text-text-primary hover:border-outline transition-colors duration-150 ease-in-out cursor-pointer"
          >
            Browse projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center bg-surface border border-outline-subtle rounded-lg py-16 px-6">
      <div className="flex items-center justify-center size-12 rounded-full bg-surface-container text-text-secondary">
        <ClipboardList className="size-6" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-text-primary">
          {isFiltered
            ? "No tasks match this filter"
            : "No tasks assigned to you yet"}
        </p>
        <p className="text-sm text-text-secondary max-w-sm">
          {isFiltered
            ? "Try a different status filter, or clear it to see everything assigned to you."
            : "Once a project leader assigns you a task, or you claim one from a Task Board, it'll show up here."}
        </p>
      </div>
      {!isFiltered && (
        <Link
          href={ROUTES.PROJECTS}
          className="text-sm font-medium px-3 py-1.5 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer mt-2"
        >
          Go to your projects
        </Link>
      )}
    </div>
  );
}
