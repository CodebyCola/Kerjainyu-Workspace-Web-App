"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  type CreateProjectFormValues,
  type CreateProjectInput,
  createProjectSchema,
} from "@/Service/project/project.validator";

export interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with validated input once the server confirms creation. */
  onCreated: (project: { id: number; title: string }) => void;
}

/**
 * Uses the native <dialog> element rather than a hand-rolled overlay —
 * gets focus trapping, Escape-to-close, and backdrop semantics for free
 * from the browser instead of reimplementing them.
 */
export function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { title: "", allow_free_swap: false },
  });

  useEffect(() => {
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;

    if (open && !dialogEl.open) {
      dialogEl.showModal();
    } else if (!open && dialogEl.open) {
      dialogEl.close();
    }
  }, [open]);

  function handleClose() {
    reset();
    setServerError(null);
    onClose();
  }

  async function onSubmit(data: CreateProjectFormValues) {
    setServerError(null);

    // zodResolver has already validated `data` against createProjectSchema
    // by this point, so allow_free_swap is guaranteed to be a boolean
    // (default applied) even though the pre-validation form type marks
    // it optional.
    const validated = data as CreateProjectInput;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validated,
          // Server expects an ISO date string for `deadline` (z.coerce.date());
          // omit the key entirely when no deadline was set, rather than
          // sending an empty string it would fail to coerce.
          deadline: validated.deadline
            ? validated.deadline.toISOString()
            : undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setServerError(
          body?.message ?? "Could not create the project. Please try again.",
        );
        return;
      }

      const body = await res.json();
      onCreated(body.project);
      reset();
    } catch {
      setServerError("Could not reach the server. Please try again.");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className={clsx(
        "backdrop:bg-neutral/70 bg-transparent p-0 m-auto",
        "w-full max-w-md",
      )}
    >
      <div className="bg-surface border border-outline-subtle rounded-lg p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            New project
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="text-text-muted hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="title"
              className="text-xs font-medium text-text-secondary"
            >
              Project title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Website Redesign Sprint"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              className={clsx(
                "bg-neutral border rounded-md px-3 py-2 text-sm text-text-primary",
                "placeholder:text-text-muted focus:outline-none transition-colors duration-150 ease-in-out",
                errors.title
                  ? "border-danger focus:border-danger"
                  : "border-outline-subtle focus:border-tertiary",
              )}
              {...register("title")}
            />
            {errors.title && (
              <p id="title-error" className="text-xs text-danger">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="deadline"
              className="text-xs font-medium text-text-secondary"
            >
              Deadline <span className="text-text-muted">(optional)</span>
            </label>
            <input
              id="deadline"
              type="date"
              aria-invalid={!!errors.deadline}
              aria-describedby={errors.deadline ? "deadline-error" : undefined}
              className={clsx(
                "bg-neutral border rounded-md px-3 py-2 text-sm text-text-primary",
                "focus:outline-none transition-colors duration-150 ease-in-out",
                errors.deadline
                  ? "border-danger focus:border-danger"
                  : "border-outline-subtle focus:border-tertiary",
              )}
              {...register("deadline")}
            />
            {errors.deadline && (
              <p id="deadline-error" className="text-xs text-danger">
                {errors.deadline.message}
              </p>
            )}
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-outline-subtle bg-neutral accent-tertiary cursor-pointer"
              {...register("allow_free_swap")}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm text-text-primary">
                Allow free task swaps
              </span>
              <span className="text-xs text-text-muted">
                Members can swap tasks with each other without your approval.
              </span>
            </span>
          </label>

          {serverError && (
            <p role="alert" className="text-xs text-danger">
              {serverError}
            </p>
          )}

          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 text-sm font-medium py-2.5 rounded-md border border-outline-subtle text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 text-sm font-medium py-2.5 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
