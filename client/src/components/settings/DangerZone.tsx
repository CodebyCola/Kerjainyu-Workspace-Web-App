"use client";

import clsx from "clsx";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/routes/route";
import { deleteProject, type Project } from "@/service/project/project.service";
import { getErrorMessage } from "@/utils/Errors";

export interface DangerZoneProps {
  project: Project;
}

export function DangerZone({ project }: DangerZoneProps) {
  const router = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = confirmText === project.title;

  async function handleDelete() {
    if (!canConfirm) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteProject(project.id);
      router.push(ROUTES.PROJECTS);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 bg-surface border border-danger/40 rounded-lg p-5">
      <div className="flex items-start gap-2.5">
        <AlertTriangle
          className="size-4 text-danger mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-danger">Danger zone</h2>
          <p className="text-xs text-text-secondary">
            Deleting this project removes every task, submission, comment, and
            file reference under it. This can't be undone.
          </p>
        </div>
      </div>

      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex items-center justify-center gap-2 self-start text-sm font-medium px-4 py-2 rounded-md border border-danger/40 text-danger hover:bg-danger-container transition-colors duration-150 ease-in-out cursor-pointer"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Delete project
        </button>
      ) : (
        <div className="flex flex-col gap-3 pt-1 border-t border-outline-subtle">
          <div className="flex flex-col gap-1.5 pt-3">
            <label
              htmlFor="delete-confirm"
              className="text-xs text-text-secondary"
            >
              Type{" "}
              <span className="font-semibold text-text-primary">
                {project.title}
              </span>{" "}
              to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="bg-neutral border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-danger transition-colors duration-150 ease-in-out"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs text-danger">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                setConfirmText("");
                setError(null);
              }}
              className="text-sm font-medium px-4 py-2 rounded-md border border-outline-subtle text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canConfirm || submitting}
              onClick={handleDelete}
              className={clsx(
                "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md",
                "bg-danger text-neutral hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer",
                (!canConfirm || submitting) && "opacity-60 cursor-not-allowed",
              )}
            >
              {submitting && (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              )}
              {submitting ? "Deleting..." : "Permanently delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
