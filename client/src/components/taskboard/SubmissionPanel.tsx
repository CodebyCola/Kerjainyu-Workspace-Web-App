"use client";

import clsx from "clsx";
import { format } from "date-fns";
import {
  ChevronDown,
  Circle,
  History,
  Loader2,
  MessageSquare,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useId, useState } from "react";
import { AttachmentRow } from "@/components/files/AttachmentRow";
import {
  getSubmissionHistory,
  type ReviewStatus,
  reviewSubmission,
  type TaskSubmission,
} from "@/service/task/submission/task-submission.service";
import { displayNameForAttachment } from "@/utils/Attachment";
import { getErrorMessage } from "@/utils/Errors";

export interface SubmissionPanelProps {
  projectId: number | string;
  taskId: number | string;
  submission: TaskSubmission;
  canReview: boolean;
  onReviewed: (submission: TaskSubmission) => void;
}

const REVIEW_STYLE: Record<
  ReviewStatus,
  { label: string; badgeBg: string; badgeText: string }
> = {
  pending: {
    label: "Awaiting review",
    badgeBg: "bg-surface-container",
    badgeText: "text-text-secondary",
  },
  approved: {
    label: "Approved",
    badgeBg: "bg-tertiary/15",
    badgeText: "text-tertiary",
  },
  revision_requested: {
    label: "Revision requested",
    badgeBg: "bg-danger-container",
    badgeText: "text-danger",
  },
  rejected: {
    label: "Rejected",
    badgeBg: "bg-danger-container",
    badgeText: "text-danger",
  },
};

type ReviewAction = "approve" | "revision" | "reject";

export function SubmissionPanel({
  projectId,
  taskId,
  submission,
  canReview,
  onReviewed,
}: SubmissionPanelProps) {
  const reviewNoteId = useId();

  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<TaskSubmission[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const style = REVIEW_STYLE[submission.review_status];

  function startReview(action: ReviewAction) {
    setReviewAction(action);
    setReviewNote("");
    setReviewError(null);
  }

  async function confirmReview() {
    if (!reviewAction) return;
    if (reviewAction === "revision" && !reviewNote.trim()) {
      setReviewError("A note is required when requesting a revision.");
      return;
    }

    setReviewing(true);
    setReviewError(null);
    try {
      const statusByAction: Record<
        ReviewAction,
        Exclude<ReviewStatus, "pending">
      > = {
        approve: "approved",
        revision: "revision_requested",
        reject: "rejected",
      };
      const updated = await reviewSubmission(projectId, taskId, submission.id, {
        review_status: statusByAction[reviewAction],
        review_note: reviewNote.trim() || undefined,
      });
      setReviewAction(null);
      onReviewed(updated);
    } catch (err) {
      setReviewError(getErrorMessage(err));
    } finally {
      setReviewing(false);
    }
  }

  async function toggleHistory() {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (next && history === null) {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const data = await getSubmissionHistory(projectId, taskId);
        setHistory(data);
      } catch (err) {
        setHistoryError(getErrorMessage(err));
      } finally {
        setHistoryLoading(false);
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 bg-surface border border-outline-subtle rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">
          Submitted work
        </span>
        <span
          className={clsx(
            "text-xs font-medium px-2 py-0.5 rounded-md",
            style.badgeBg,
            style.badgeText,
          )}
        >
          {style.label}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <span>{submission.submitted_by_username}</span>
        <span aria-hidden="true">·</span>
        <span>
          {format(new Date(submission.submitted_at), "MMM d, yyyy 'at' h:mm a")}
        </span>
      </div>

      {submission.note && (
        <p className="text-sm text-text-primary whitespace-pre-wrap">
          {submission.note}
        </p>
      )}

      {submission.attachments && submission.attachments.length > 0 && (
        <div className="divide-y divide-outline-subtle -mx-1">
          {submission.attachments.map((att) => (
            <AttachmentRow
              key={att.id}
              type={att.type}
              name={displayNameForAttachment(att)}
              preview={att.type === "text" ? att.content : undefined}
              submittedBy={submission.submitted_by_username}
              submittedDate={format(new Date(att.created_at), "MMM d")}
              onOpen={() =>
                window.open(att.content, "_blank", "noopener,noreferrer")
              }
              onDownload={() =>
                window.open(att.content, "_blank", "noopener,noreferrer")
              }
            />
          ))}
        </div>
      )}

      {submission.review_status !== "pending" && submission.review_note && (
        <div className="flex flex-col gap-1 bg-surface-container rounded-md p-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <MessageSquare className="size-3.5" aria-hidden="true" />
            Reviewer note
          </span>
          <p className="text-sm text-text-primary whitespace-pre-wrap">
            {submission.review_note}
          </p>
          {submission.reviewed_by_username && (
            <span className="text-xs text-text-muted mt-1">
              — {submission.reviewed_by_username}
              {submission.reviewed_at &&
                `, ${format(new Date(submission.reviewed_at), "MMM d, yyyy")}`}
            </span>
          )}
        </div>
      )}

      {canReview && submission.review_status === "pending" && (
        <div className="flex flex-col gap-3 pt-1 border-t border-outline-subtle">
          {!reviewAction ? (
            <div className="flex flex-wrap items-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => startReview("approve")}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer"
              >
                <ThumbsUp className="size-3.5" aria-hidden="true" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => startReview("revision")}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-outline-subtle text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Request revision
              </button>
              <button
                type="button"
                onClick={() => startReview("reject")}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-outline-subtle text-danger hover:bg-danger-container transition-colors duration-150 ease-in-out cursor-pointer"
              >
                <ThumbsDown className="size-3.5" aria-hidden="true" />
                Reject
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-3">
              <label
                htmlFor={reviewNoteId}
                className="text-xs font-medium text-text-secondary"
              >
                Note{" "}
                {reviewAction === "revision" ? (
                  <span className="text-text-muted">(required)</span>
                ) : (
                  <span className="text-text-muted">(optional)</span>
                )}
              </label>
              <textarea
                id={reviewNoteId}
                rows={2}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={
                  reviewAction === "revision"
                    ? "What needs to change before this can be approved?"
                    : "Add a note for the assignee..."
                }
                className="bg-neutral border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary transition-colors duration-150 ease-in-out resize-none"
              />
              {reviewError && (
                <p role="alert" className="text-xs text-danger">
                  {reviewError}
                </p>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction(null)}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-outline-subtle text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={confirmReview}
                  className={clsx(
                    "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md",
                    reviewAction === "reject"
                      ? "bg-danger text-neutral"
                      : "bg-tertiary text-on-tertiary",
                    "hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer",
                    reviewing && "opacity-60 cursor-wait",
                  )}
                >
                  {reviewing && <Loader2 className="size-3.5 animate-spin" />}
                  {reviewing
                    ? "Saving..."
                    : reviewAction === "approve"
                      ? "Confirm approval"
                      : reviewAction === "reject"
                        ? "Confirm rejection"
                        : "Send back for revision"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pt-1 border-t border-outline-subtle">
        <button
          type="button"
          onClick={toggleHistory}
          className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer pt-3"
        >
          <History className="size-3.5" aria-hidden="true" />
          Submission history
          <ChevronDown
            className={clsx(
              "size-3.5 transition-transform duration-150 ease-in-out",
              historyOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>

        {historyOpen && (
          <div className="flex flex-col gap-2 mt-3">
            {historyLoading && (
              <p className="text-xs text-text-muted">Loading history...</p>
            )}
            {historyError && (
              <p className="text-xs text-danger">{historyError}</p>
            )}
            {history && history.length === 0 && (
              <p className="text-xs text-text-muted">No earlier submissions.</p>
            )}
            {history?.map((entry) => {
              const entryStyle = REVIEW_STYLE[entry.review_status];
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-2.5 text-xs py-2 border-b border-outline-subtle last:border-b-0"
                >
                  <Circle
                    className="size-2 mt-1 shrink-0 fill-current text-text-muted"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-text-primary font-medium">
                        {entry.submitted_by_username}
                      </span>
                      <span className="text-text-muted">
                        {format(new Date(entry.submitted_at), "MMM d, yyyy")}
                      </span>
                      <span
                        className={clsx(
                          "px-1.5 py-0.5 rounded",
                          entryStyle.badgeBg,
                          entryStyle.badgeText,
                        )}
                      >
                        {entryStyle.label}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-text-secondary truncate max-w-md">
                        {entry.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
