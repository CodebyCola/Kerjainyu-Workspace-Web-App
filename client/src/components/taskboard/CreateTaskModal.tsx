"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createTask, type Task } from "@/service/task/task.service";
import {
  type CreateTaskFormValues,
  type CreateTaskInput,
  createTaskSchema,
} from "@/service/task/task.validator";
import { getErrorMessage } from "@/utils/Errors";

export interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  projectId: number | string;
  onCreated: (task: Task) => void;
}

export function CreateTaskModal({
  open,
  onClose,
  projectId,
  onCreated,
}: CreateTaskModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: undefined,
      status: "unclaimed",
      isClaimable: false,
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleClose() {
    reset();
    setServerError(null);
    onClose();
  }

  async function onSubmit(data: CreateTaskFormValues) {
    setServerError(null);
    const validated = data as CreateTaskInput;
    try {
      const task = await createTask(projectId, validated);
      onCreated(task);
      reset();
    } catch (err) {
      setServerError(getErrorMessage(err));
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
          <h2 className="text-lg font-semibold text-text-primary">New task</h2>
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
              htmlFor="task-title"
              className="text-xs font-medium text-text-secondary"
            >
              Task title
            </label>
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Design onboarding flow"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "task-title-error" : undefined}
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
              <p id="task-title-error" className="text-xs text-danger">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="task-description"
              className="text-xs font-medium text-text-secondary"
            >
              Description <span className="text-text-muted">(optional)</span>
            </label>
            <textarea
              id="task-description"
              rows={3}
              placeholder="What needs to be done?"
              className={clsx(
                "bg-neutral border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary",
                "placeholder:text-text-muted focus:outline-none focus:border-tertiary transition-colors duration-150 ease-in-out resize-none",
              )}
              {...register("description")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="task-deadline"
              className="text-xs font-medium text-text-secondary"
            >
              Deadline <span className="text-text-muted">(optional)</span>
            </label>
            <input
              id="task-deadline"
              type="date"
              aria-invalid={!!errors.deadline}
              aria-describedby={
                errors.deadline ? "task-deadline-error" : undefined
              }
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
              <p id="task-deadline-error" className="text-xs text-danger">
                {errors.deadline.message}
              </p>
            )}
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-outline-subtle bg-neutral accent-tertiary cursor-pointer"
              {...register("isClaimable")}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm text-text-primary">
                Open for anyone to claim
              </span>
              <span className="text-xs text-text-muted">
                Members can claim this task themselves instead of waiting to be
                assigned.
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
              {isSubmitting ? "Creating..." : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
