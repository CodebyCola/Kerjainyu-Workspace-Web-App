"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { format } from "date-fns";
import { Loader2, Repeat2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  type Project,
  updateProjectSettings,
} from "@/service/project/project.service";
import {
  type ProjectSettingsFormValues,
  type ProjectSettingsInput,
  projectSettingsSchema,
} from "@/service/project/settings/project-settings.validator";

export interface GeneralSettingsFormProps {
  project: Project;
  onUpdated: (project: Project) => void;
}

export function GeneralSettingsForm({
  project,
  onUpdated,
}: GeneralSettingsFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProjectSettingsFormValues, any, ProjectSettingsInput>({
    resolver: zodResolver(projectSettingsSchema),
    defaultValues: {
      title: project.title,
      deadline: toDateInputValue(project.deadline),
      allowFreeSwap: project.allow_free_swap,
    },
  });

  useEffect(() => {
    reset({
      title: project.title,
      deadline: toDateInputValue(project.deadline),
      allowFreeSwap: project.allow_free_swap,
    });
  }, [project, reset]);

  const allowFreeSwap = watch("allowFreeSwap");

  async function onSubmit(values: ProjectSettingsInput) {
    const updated = await updateProjectSettings(project.id, {
      title: values.title,
      deadline: values.deadline ? new Date(values.deadline) : null,
      allowFreeSwap: values.allowFreeSwap,
    });
    onUpdated(updated);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 bg-surface border border-outline-subtle rounded-lg p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-text-primary">General</h2>
        <p className="text-xs text-text-secondary">
          Basic details every member sees across the project.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="settings-title"
          className="text-xs font-medium text-text-secondary"
        >
          Project name
        </label>
        <input
          id="settings-title"
          type="text"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "settings-title-error" : undefined}
          className={clsx(
            "bg-neutral border rounded-md px-3 py-2 text-sm text-text-primary",
            "focus:outline-none transition-colors duration-150 ease-in-out",
            errors.title
              ? "border-danger focus:border-danger"
              : "border-outline-subtle focus:border-tertiary",
          )}
          {...register("title")}
        />
        {errors.title && (
          <p id="settings-title-error" className="text-xs text-danger">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="settings-deadline"
          className="text-xs font-medium text-text-secondary"
        >
          Deadline <span className="text-text-muted">(optional)</span>
        </label>
        <input
          id="settings-deadline"
          type="date"
          className="bg-neutral border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-tertiary transition-colors duration-150 ease-in-out w-fit"
          {...register("deadline")}
        />
        {watch("deadline") && (
          <button
            type="button"
            onClick={() => setValue("deadline", "", { shouldDirty: true })}
            className="w-fit text-xs text-text-muted hover:text-text-secondary transition-colors duration-150 ease-in-out cursor-pointer"
          >
            Clear deadline
          </button>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 pt-1 border-t border-outline-subtle">
        <div className="flex items-start gap-2.5 pt-4">
          <Repeat2
            className="size-4 text-text-muted mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-text-primary">
              Allow free task swaps
            </span>
            <p className="text-xs text-text-secondary max-w-md">
              {allowFreeSwap
                ? "Members can approve or reject swap requests among themselves — you don't have to mediate every one."
                : "Every swap request needs your approval as leader before it goes through."}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={allowFreeSwap}
          onClick={() =>
            setValue("allowFreeSwap", !allowFreeSwap, { shouldDirty: true })
          }
          className={clsx(
            "relative inline-flex items-center h-6 w-11 rounded-full shrink-0 mt-4",
            "transition-colors duration-150 ease-in-out cursor-pointer",
            allowFreeSwap ? "bg-tertiary" : "bg-surface-container",
          )}
        >
          <span
            className={clsx(
              "inline-block size-4 rounded-full bg-neutral transition-transform duration-150 ease-in-out",
              allowFreeSwap ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={!isDirty || isSubmitting}
          className={clsx(
            "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md",
            "bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer",
            (!isDirty || isSubmitting) && "opacity-60 cursor-not-allowed",
          )}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-3.5" aria-hidden="true" />
          )}
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
        {isDirty && !isSubmitting && (
          <span className="text-xs text-text-muted">Unsaved changes</span>
        )}
      </div>
    </form>
  );
}

function toDateInputValue(deadline: Date | string | null | undefined): string {
  if (!deadline) return "";
  const date = typeof deadline === "string" ? new Date(deadline) : deadline;
  return format(date, "yyyy-MM-dd");
}
