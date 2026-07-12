"use client";

import clsx from "clsx";
import { Link2, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

/** Mirrors the `project_link_category` enum (server/src/database/types.ts). */
export type ResourceCategory = "design" | "development" | "docs" | "other";

const CATEGORY_OPTIONS: { value: ResourceCategory; label: string }[] = [
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "docs", label: "Docs & references" },
  { value: "other", label: "Other" },
];

export interface AddResourceValues {
  /**
   * Called `label` (not `title`) to match createProjectLinkSchema on the
   * server 1:1 — server/src/schemas/projectLink.schema.ts.
   */
  label: string;
  url: string;
  category: ResourceCategory;
}

export interface AddResourceModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Left optional so the modal stays usable as a stub before the client
   * has an API layer wired up — see the note on InviteMemberModal for
   * the same pattern. Mirrors the real POST /projects/:projectId/links
   * response shape: a conflict (duplicate label) is the one documented
   * error case in ProjectLinkService.addLinkToProject.
   */
  onSubmit?: (
    values: AddResourceValues,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

/**
 * Add-resource form for the CTA on the project Resources page. Fields
 * map directly to createProjectLinkSchema: label (max 100, unique per
 * project — server throws a 409 on duplicates), url (must be a valid
 * http(s):// URL), category (defaults to "other"). `added_by` and
 * `project_id` are set server-side, not form fields.
 */
export function AddResourceModal({
  open,
  onClose,
  onSubmit,
}: AddResourceModalProps) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("other");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLabel("");
    setUrl("");
    setCategory("other");
    setError(null);
  }, [open]);

  if (!open) return null;

  function validate(): string | null {
    if (!label.trim()) return "Give this resource a label.";
    if (label.trim().length > 100)
      return "Label must be 100 characters or fewer.";
    if (!/^https?:\/\/.+/.test(url.trim())) {
      return "URL must start with http:// or https://";
    }
    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!onSubmit) {
      // No API wired up yet — close as a no-op stub, same as
      // InviteMemberModal's fallback when its callbacks are omitted.
      onClose();
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await onSubmit({
      label: label.trim(),
      url: url.trim(),
      category,
    });
    setSubmitting(false);

    if (result.ok) {
      onClose();
    } else {
      setError(result.error);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-resource-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-neutral/70"
      />

      <div className="relative w-full max-w-md mx-4 bg-surface border border-outline-subtle rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-subtle">
          <div className="flex items-center gap-2">
            <Link2 className="size-4.5 text-tertiary" aria-hidden="true" />
            <h2
              id="add-resource-title"
              className="text-base font-semibold text-text-primary"
            >
              Add resource
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center size-8 rounded-md text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <div className="px-5 pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="resource-label"
              className="text-xs font-medium text-text-secondary"
            >
              Label
            </label>
            <input
              id="resource-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Design system tokens (Figma)"
              maxLength={100}
              className="bg-surface-container border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary"
            />
            <p className="text-[11px] text-text-muted">
              Must be unique within this project.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="resource-url"
              className="text-xs font-medium text-text-secondary"
            >
              URL
            </label>
            <input
              id="resource-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="bg-surface-container border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-secondary">
              Category
            </span>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value)}
                  className={clsx(
                    "text-sm font-medium px-3 py-1.5 rounded-md border transition-colors duration-150 ease-in-out cursor-pointer",
                    category === opt.value
                      ? "border-tertiary bg-tertiary/10 text-tertiary-foreground"
                      : "border-outline-subtle text-text-secondary hover:text-text-primary",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium px-4 py-2 rounded-md text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className={clsx(
              "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-opacity duration-150 ease-in-out",
              submitting
                ? "opacity-70 cursor-wait"
                : "hover:opacity-90 cursor-pointer",
              "bg-tertiary text-on-tertiary",
            )}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add resource
          </button>
        </div>
      </div>
    </div>
  );
}
