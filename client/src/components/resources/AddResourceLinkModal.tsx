"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  type CreateResourceLinkInput,
  createResourceLinkSchema,
} from "@/Service/resources/resources.validator";

export interface AddResourceLinkModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (link: { id: string; label: string; url: string }) => void;
}

export function AddResourceLinkModal({
  open,
  onClose,
  onCreated,
}: AddResourceLinkModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateResourceLinkInput>({
    resolver: zodResolver(createResourceLinkSchema),
    defaultValues: { label: "", url: "" },
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

  async function onSubmit(data: CreateResourceLinkInput) {
    setServerError(null);

    try {
      const res = await fetch("/api/project-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setServerError(
          body?.message ?? "Could not add the link. Please try again.",
        );
        return;
      }

      const body = await res.json();
      onCreated(body.link);
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
          <h2 className="text-lg font-semibold text-text-primary">Add link</h2>
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
              htmlFor="label"
              className="text-xs font-medium text-text-secondary"
            >
              Label
            </label>
            <input
              id="label"
              type="text"
              placeholder="e.g. Figma, GitHub repo, Shared docs"
              aria-invalid={!!errors.label}
              aria-describedby={errors.label ? "label-error" : undefined}
              className={clsx(
                "bg-neutral border rounded-md px-3 py-2 text-sm text-text-primary",
                "placeholder:text-text-muted focus:outline-none transition-colors duration-150 ease-in-out",
                errors.label
                  ? "border-danger focus:border-danger"
                  : "border-outline-subtle focus:border-tertiary",
              )}
              {...register("label")}
            />
            {errors.label && (
              <p id="label-error" className="text-xs text-danger">
                {errors.label.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="url"
              className="text-xs font-medium text-text-secondary"
            >
              URL
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://docs.google.com/document/..."
              aria-invalid={!!errors.url}
              aria-describedby={errors.url ? "url-error" : undefined}
              className={clsx(
                "bg-neutral border rounded-md px-3 py-2 text-sm text-text-primary",
                "placeholder:text-text-muted focus:outline-none transition-colors duration-150 ease-in-out",
                errors.url
                  ? "border-danger focus:border-danger"
                  : "border-outline-subtle focus:border-tertiary",
              )}
              {...register("url")}
            />
            {errors.url && (
              <p id="url-error" className="text-xs text-danger">
                {errors.url.message}
              </p>
            )}
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
              {isSubmitting ? "Adding..." : "Add link"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
