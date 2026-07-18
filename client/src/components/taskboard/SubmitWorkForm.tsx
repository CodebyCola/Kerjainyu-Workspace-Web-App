"use client";

import clsx from "clsx";
import {
  FileText,
  Image as ImageIcon,
  Link2,
  Loader2,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { useId, useState } from "react";
import type { AttachmentType } from "@/components/files/AttachmentRow";
import {
  type SubmissionAttachmentInput,
  submitTask,
  type TaskSubmission,
} from "@/service/task/submission/task-submission.service";
import { getErrorMessage } from "@/utils/Errors";

export interface SubmitWorkFormProps {
  projectId: number | string;
  taskId: number | string;
  /** "Submit" vs "Resubmit" — cosmetic only, same request either way. */
  isResubmission?: boolean;
  onSubmitted: (submission: TaskSubmission) => void;
}

const ATTACHMENT_TYPES: {
  value: AttachmentType;
  label: string;
  icon: typeof Link2;
}[] = [
  { value: "link", label: "Link", icon: Link2 },
  { value: "file", label: "File link", icon: FileText },
  { value: "image", label: "Image link", icon: ImageIcon },
];

interface AttachmentDraft extends SubmissionAttachmentInput {
  key: string;
}

function emptyDraft(): AttachmentDraft {
  return { key: crypto.randomUUID(), type: "link", content: "" };
}

export function SubmitWorkForm({
  projectId,
  taskId,
  isResubmission = false,
  onSubmitted,
}: SubmitWorkFormProps) {
  const noteId = useId();
  const [note, setNote] = useState("");
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasNote = note.trim().length > 0;
  const filledAttachments = attachments.filter((a) => a.content.trim());
  const canSubmit = (hasNote || filledAttachments.length > 0) && !submitting;

  function addAttachment() {
    setAttachments((prev) => [...prev, emptyDraft()]);
  }

  function updateAttachment(key: string, patch: Partial<AttachmentDraft>) {
    setAttachments((prev) =>
      prev.map((a) => (a.key === key ? { ...a, ...patch } : a)),
    );
  }

  function removeAttachment(key: string) {
    setAttachments((prev) => prev.filter((a) => a.key !== key));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasNote && filledAttachments.length === 0) {
      setError("Add a comment or at least one attachment before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const submission = await submitTask(projectId, taskId, {
        note: hasNote ? note : undefined,
        attachments: filledAttachments.map(({ type, content }) => ({
          type,
          content: content.trim(),
        })),
      });
      setNote("");
      setAttachments([]);
      onSubmitted(submission);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-surface border border-outline-subtle rounded-lg p-4"
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={noteId}
          className="text-xs font-medium text-text-secondary"
        >
          Comment <span className="text-text-muted">(optional)</span>
        </label>
        <textarea
          id={noteId}
          rows={3}
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What did you do? Any notes for the reviewer?"
          className="bg-neutral border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary transition-colors duration-150 ease-in-out resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">
            Attachments <span className="text-text-muted">(optional)</span>
          </span>
          <button
            type="button"
            onClick={addAttachment}
            className="flex items-center gap-1 text-xs font-medium text-tertiary hover:opacity-80 transition-opacity duration-150 ease-in-out cursor-pointer"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add attachment
          </button>
        </div>

        {attachments.length === 0 && (
          <p className="text-xs text-text-muted">
            No attachments added — this API links to files rather than hosting
            uploads, so paste a URL (e.g. a Drive/Figma link).
          </p>
        )}

        {attachments.map((draft) => (
          <div key={draft.key} className="flex items-center gap-2">
            <select
              value={draft.type}
              onChange={(e) =>
                updateAttachment(draft.key, {
                  type: e.target.value as AttachmentType,
                })
              }
              className="bg-neutral border border-outline-subtle rounded-md px-2 py-2 text-xs text-text-primary focus:outline-none focus:border-tertiary transition-colors duration-150 ease-in-out shrink-0"
            >
              {ATTACHMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={draft.content}
              onChange={(e) =>
                updateAttachment(draft.key, { content: e.target.value })
              }
              placeholder="https://..."
              className="flex-1 min-w-0 bg-neutral border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary transition-colors duration-150 ease-in-out"
            />
            <button
              type="button"
              onClick={() => removeAttachment(draft.key)}
              aria-label="Remove attachment"
              className="flex items-center justify-center size-8 rounded-md text-text-muted hover:text-danger hover:bg-danger-container transition-colors duration-150 ease-in-out cursor-pointer shrink-0"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className={clsx(
          "flex items-center justify-center gap-2 self-start text-sm font-medium px-4 py-2 rounded-md",
          "bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer",
          !canSubmit && "opacity-60 cursor-not-allowed",
        )}
      >
        {submitting && (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        )}
        {!submitting && <Send className="size-3.5" aria-hidden="true" />}
        {submitting
          ? "Submitting..."
          : isResubmission
            ? "Resubmit work"
            : "Submit work"}
      </button>
    </form>
  );
}
