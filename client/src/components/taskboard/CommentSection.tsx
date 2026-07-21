"use client";

import clsx from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import { Loader2, Lock, MessageSquare, Send, Trash2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
    addComment,
    deleteComment,
    getComments,
    type TaskComment,
} from "@/service/comment/comment.service";
import { getInitials } from "@/utils/Avatar";
import { getErrorMessage } from "@/utils/Errors";

export interface CommentSectionProps {
    projectId: number | string;
    taskId: number | string;
    canComment: boolean;
    currentUserId?: number;
    isLeader: boolean;
}

type LoadStatus = "loading" | "error" | "ready";

export function CommentSection({
    projectId,
    taskId,
    canComment,
    currentUserId,
    isLeader,
}: CommentSectionProps) {
    const composerId = useId();

    const [comments, setComments] = useState<TaskComment[]>([]);
    const [status, setStatus] = useState<LoadStatus>("loading");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [draft, setDraft] = useState("");
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        setStatus("loading");
        setErrorMessage(null);

        getComments(projectId, taskId)
            .then((data) => {
                if (cancelled) return;
                setComments(data);
                setStatus("ready");
            })
            .catch((err) => {
                if (cancelled) return;
                setErrorMessage(getErrorMessage(err));
                setStatus("error");
            });

        return () => {
            cancelled = true;
        };
    }, [projectId, taskId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = draft.trim();
        if (!trimmed) return;

        setPosting(true);
        setPostError(null);
        try {
            const created = await addComment(projectId, taskId, trimmed);
            setComments((prev) => [...prev, created]);
            setDraft("");
        } catch (err) {
            setPostError(getErrorMessage(err));
        } finally {
            setPosting(false);
        }
    }

    async function handleDelete(comment: TaskComment) {
        if (!window.confirm("Delete this comment?")) return;

        setDeletingId(comment.id);
        try {
            await deleteComment(projectId, taskId, comment.id);
            setComments((prev) => prev.filter((c) => c.id !== comment.id));
        } catch (err) {
            setPostError(getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="flex flex-col gap-4 bg-surface border border-outline-subtle rounded-lg p-4">
            <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-text-muted" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-text-primary">
                    Comments {comments.length > 0 && `(${comments.length})`}
                </h2>
            </div>

            {status === "loading" && (
                <p className="text-xs text-text-muted">Loading comments...</p>
            )}

            {status === "error" && (
                <p className="text-xs text-danger">
                    {errorMessage ?? "Could not load comments."}
                </p>
            )}

            {status === "ready" && comments.length === 0 && (
                <p className="text-xs text-text-muted">No comments yet.</p>
            )}

            {status === "ready" && comments.length > 0 && (
                <div className="flex flex-col gap-3">
                    {comments.map((comment) => {
                        const canDelete = comment.user_id === currentUserId || isLeader;
                        return (
                            <div key={comment.id} className="flex items-start gap-2.5">
                                <span
                                    className="flex items-center justify-center size-7 rounded-full bg-tertiary text-on-tertiary text-[10px] font-semibold shrink-0 mt-0.5"
                                    aria-hidden="true"
                                >
                                    {getInitials(comment.username)}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-text-primary">
                                            {comment.username}
                                        </span>
                                        <span className="text-[11px] text-text-muted">
                                            {formatDistanceToNowStrict(new Date(comment.created_at), {
                                                addSuffix: true,
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-primary whitespace-pre-wrap break-words">
                                        {comment.comment}
                                    </p>
                                </div>
                                {canDelete && (
                                    <button
                                        type="button"
                                        disabled={deletingId === comment.id}
                                        onClick={() => handleDelete(comment)}
                                        aria-label="Delete comment"
                                        className={clsx(
                                            "flex items-center justify-center size-6 rounded-md shrink-0",
                                            "text-text-muted hover:text-danger hover:bg-danger-container",
                                            "transition-colors duration-150 ease-in-out cursor-pointer",
                                            deletingId === comment.id && "opacity-60 cursor-wait",
                                        )}
                                    >
                                        {deletingId === comment.id ? (
                                            <Loader2
                                                className="size-3.5 animate-spin"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Trash2 className="size-3.5" aria-hidden="true" />
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {canComment ? (
                <form
                    onSubmit={handleSubmit}
                    className="flex items-start gap-2 pt-3 border-t border-outline-subtle"
                >
                    <label htmlFor={composerId} className="sr-only">
                        Write a comment
                    </label>
                    <textarea
                        id={composerId}
                        rows={2}
                        maxLength={1000}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-neutral border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary transition-colors duration-150 ease-in-out resize-none"
                    />
                    <button
                        type="submit"
                        disabled={!draft.trim() || posting}
                        aria-label="Post comment"
                        className={clsx(
                            "flex items-center justify-center size-9 rounded-md shrink-0",
                            "bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer",
                            (!draft.trim() || posting) && "opacity-60 cursor-not-allowed",
                        )}
                    >
                        {posting ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <Send className="size-4" aria-hidden="true" />
                        )}
                    </button>
                </form>
            ) : (
                <div className="flex items-center gap-2 pt-3 border-t border-outline-subtle text-xs text-text-muted">
                    <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                    Only the project leader and this task's assignee can comment here.
                </div>
            )}

            {postError && (
                <p role="alert" className="text-xs text-danger">
                    {postError}
                </p>
            )}
        </div>
    );
}