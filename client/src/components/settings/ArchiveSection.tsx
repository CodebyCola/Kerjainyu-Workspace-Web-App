"use client";

import clsx from "clsx";
import { Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  archiveProject,
  type Project,
  unarchiveProject,
} from "@/service/project/project.service";
import { getErrorMessage } from "@/utils/Errors";

export interface ArchiveSectionProps {
  project: Project;
  onUpdated: (project: Project) => void;
}

export function ArchiveSection({ project, onUpdated }: ArchiveSectionProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const confirmed = window.confirm(
      project.is_archived
        ? "Unarchive this project? It'll show up in the active projects list again."
        : "Archive this project? It'll move out of the active list — you can bring it back any time from Settings or the Archive page.",
    );
    if (!confirmed) return;

    setSubmitting(true);
    setError(null);
    try {
      const updated = project.is_archived
        ? await unarchiveProject(project.id)
        : await archiveProject(project.id);
      onUpdated(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 bg-surface border border-outline-subtle rounded-lg p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-text-primary">Archive</h2>
        <p className="text-xs text-text-secondary">
          {project.is_archived
            ? "This project is archived — it's hidden from the active projects list but nothing's been deleted."
            : "Archiving hides the project from the active list without deleting anything. Fully reversible."}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={submitting}
        onClick={handleToggle}
        className={clsx(
          "flex items-center justify-center gap-2 self-start text-sm font-medium px-4 py-2 rounded-md",
          "border border-outline-subtle text-text-secondary hover:text-text-primary",
          "transition-colors duration-150 ease-in-out cursor-pointer",
          submitting && "opacity-60 cursor-wait",
        )}
      >
        {submitting ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : project.is_archived ? (
          <ArchiveRestore className="size-3.5" aria-hidden="true" />
        ) : (
          <Archive className="size-3.5" aria-hidden="true" />
        )}
        {submitting
          ? "Saving..."
          : project.is_archived
            ? "Unarchive project"
            : "Archive project"}
      </button>
    </div>
  );
}
