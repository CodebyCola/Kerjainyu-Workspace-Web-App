"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Link2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { createProject, type Project } from "@/service/project/project.service";
import {
  type CreateProjectFormValues,
  type CreateProjectInput,
  createProjectSchema,
  type ProjectLinkCategory,
} from "@/service/project/project.validator";
import { getErrorMessage } from "@/utils/Errors";

const CATEGORY_OPTIONS: { value: ProjectLinkCategory; label: string }[] = [
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "docs", label: "Docs & references" },
  { value: "other", label: "Other" },
];

/** Empty starting values for a newly-added link row. */
const EMPTY_LINK = { label: "", url: "", category: "other" as const };

export interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { title: "", allowFreeSwap: false, links: [] },
  });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({ control, name: "links" });

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
    const validated = data as CreateProjectInput;

    try {
      const project = await createProject(validated);
      onCreated(project);
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
        "w-full max-w-lg max-h-[85vh]",
      )}
    >
      <div className="bg-surface border border-outline-subtle rounded-lg p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
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
              {...register("allowFreeSwap")}
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

          <div className="flex flex-col gap-3 pt-1 border-t border-outline-subtle">
            <div className="flex items-center justify-between pt-3">
              <span className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                <Link2 className="size-3.5" aria-hidden="true" />
                Resource links{" "}
                <span className="text-text-muted font-normal">
                  (optional, up to 20)
                </span>
              </span>
              <button
                type="button"
                onClick={() => appendLink(EMPTY_LINK)}
                disabled={linkFields.length >= 20}
                className="flex items-center gap-1 text-xs font-medium text-tertiary hover:opacity-80 transition-opacity duration-150 ease-in-out cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add link
              </button>
            </div>

            {errors.links?.message && (
              <p className="text-xs text-danger">{errors.links.message}</p>
            )}

            {linkFields.length === 0 && (
              <p className="text-xs text-text-muted">
                No links yet. You can also add these later from the project's
                Resources page.
              </p>
            )}

            {linkFields.map((field, index) => {
              const linkErrors = errors.links?.[index];
              return (
                <div
                  key={field.id}
                  className="flex flex-col gap-2 bg-neutral border border-outline-subtle rounded-md p-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          placeholder="Label, e.g. Figma board"
                          aria-invalid={!!linkErrors?.label}
                          aria-label={`Link ${index + 1} label`}
                          className={clsx(
                            "bg-surface border rounded-md px-2.5 py-1.5 text-sm text-text-primary",
                            "placeholder:text-text-muted focus:outline-none transition-colors duration-150 ease-in-out",
                            linkErrors?.label
                              ? "border-danger focus:border-danger"
                              : "border-outline-subtle focus:border-tertiary",
                          )}
                          {...register(`links.${index}.label`)}
                        />
                        {linkErrors?.label && (
                          <p className="text-[11px] text-danger">
                            {linkErrors.label.message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <input
                          type="url"
                          placeholder="https://..."
                          aria-invalid={!!linkErrors?.url}
                          aria-label={`Link ${index + 1} URL`}
                          className={clsx(
                            "bg-surface border rounded-md px-2.5 py-1.5 text-sm text-text-primary",
                            "placeholder:text-text-muted focus:outline-none transition-colors duration-150 ease-in-out",
                            linkErrors?.url
                              ? "border-danger focus:border-danger"
                              : "border-outline-subtle focus:border-tertiary",
                          )}
                          {...register(`links.${index}.url`)}
                        />
                        {linkErrors?.url && (
                          <p className="text-[11px] text-danger">
                            {linkErrors.url.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      aria-label={`Remove link ${index + 1}`}
                      className="text-text-muted hover:text-danger transition-colors duration-150 ease-in-out cursor-pointer p-1.5"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <label key={opt.value} className="cursor-pointer">
                        <input
                          type="radio"
                          value={opt.value}
                          className="peer sr-only"
                          {...register(`links.${index}.category`)}
                        />
                        <span className="block text-[11px] font-medium px-2 py-1 rounded-md border border-outline-subtle text-text-secondary peer-checked:border-tertiary peer-checked:bg-tertiary/10 peer-checked:text-tertiary-foreground transition-colors duration-150 ease-in-out">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

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
