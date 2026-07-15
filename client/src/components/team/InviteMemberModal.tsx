"use client";

import clsx from "clsx";
import { Check, Copy, Link2, Loader2, UserRoundPlus, X } from "lucide-react";
import { useEffect, useState } from "react";

type InviteMode = "username" | "link";

/** Mirrors the `project_role` enum (server/src/database/types.ts). */
export type ProjectRole = "leader" | "member";

const ROLE_OPTIONS: { value: ProjectRole; label: string }[] = [
  { value: "member", label: "Member" },
  { value: "leader", label: "Leader" },
];

/** Minimal shape needed for the project selector — not the full Projects row. */
export interface ProjectOption {
  id: number;
  title: string;
}

export interface InviteByUsernameValues {
  username: string;
  role: ProjectRole;
  projectId: number;
}

export interface InviteByLinkValues {
  role: ProjectRole;
  projectId: number;
  /** undefined/"never" = link doesn't expire. */
  expiresIn: "1h" | "24h" | "7d" | "never";
}

export interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;

  currentProject?: ProjectOption;
  projects?: ProjectOption[];

  onInviteByUsername?: (
    values: InviteByUsernameValues,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  onGenerateLink?: (
    values: Omit<InviteByLinkValues, "projectId"> & { projectId: number },
  ) => Promise<{ ok: true; url: string } | { ok: false; error: string }>;
}

export function InviteMemberModal({
  open,
  onClose,
  currentProject,
  projects = [],
  onInviteByUsername,
  onGenerateLink,
}: InviteMemberModalProps) {
  const [mode, setMode] = useState<InviteMode>("username");
  const [projectId, setProjectId] = useState<number | undefined>(
    currentProject?.id,
  );
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<ProjectRole>("member");
  const [expiresIn, setExpiresIn] =
    useState<InviteByLinkValues["expiresIn"]>("7d");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset transient state whenever the modal is (re)opened.
  useEffect(() => {
    if (!open) return;
    setMode("username");
    setProjectId(currentProject?.id);
    setUsername("");
    setRole("member");
    setExpiresIn("7d");
    setError(null);
    setSentTo(null);
    setGeneratedUrl(null);
    setCopied(false);
  }, [open, currentProject?.id]);

  if (!open) return null;

  const needsProjectPicker = !currentProject;
  const projectLabel = currentProject?.title;

  async function handleSubmitUsername() {
    setError(null);
    if (!projectId) {
      setError("Choose a project first.");
      return;
    }
    if (!username.trim()) {
      setError("Enter a username.");
      return;
    }
    if (!onInviteByUsername) {
      // No backend endpoint wired up yet — keep the form usable as a stub.
      setSentTo(username.trim());
      return;
    }
    setSubmitting(true);
    const result = await onInviteByUsername({
      username: username.trim(),
      role,
      projectId,
    });
    setSubmitting(false);
    if (result.ok) {
      setSentTo(username.trim());
      setUsername("");
    } else {
      setError(result.error);
    }
  }

  async function handleGenerateLink() {
    setError(null);
    if (!projectId) {
      setError("Choose a project first.");
      return;
    }
    if (!onGenerateLink) {
      setGeneratedUrl(
        `https://kerjainyu.app/invite/PLACEHOLDER-TOKEN?project=${projectId}`,
      );
      return;
    }
    setSubmitting(true);
    const result = await onGenerateLink({ role, expiresIn, projectId });
    setSubmitting(false);
    if (result.ok) {
      setGeneratedUrl(result.url);
    } else {
      setError(result.error);
    }
  }

  function handleCopy() {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
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
            <UserRoundPlus
              className="size-4.5 text-tertiary"
              aria-hidden="true"
            />
            <h2
              id="invite-modal-title"
              className="text-base font-semibold text-text-primary"
            >
              Invite member
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
          {/* Project selector — only shown when opened without project context. */}
          {needsProjectPicker ? (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="invite-project"
                className="text-xs font-medium text-text-secondary"
              >
                Project
              </label>
              <select
                id="invite-project"
                value={projectId ?? ""}
                onChange={(e) =>
                  setProjectId(Number(e.target.value) || undefined)
                }
                className="bg-surface-container border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-tertiary"
              >
                <option value="" disabled>
                  Select a project…
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-secondary">
                Project
              </span>
              <div className="bg-surface-container border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary">
                {projectLabel}
              </div>
            </div>
          )}

          {/* Mode switcher */}
          <div className="flex items-center gap-1 bg-surface-container border border-outline-subtle rounded-md p-1">
            <button
              type="button"
              onClick={() => setMode("username")}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-colors duration-150 ease-in-out cursor-pointer",
                mode === "username"
                  ? "bg-tertiary text-on-tertiary"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              <UserRoundPlus className="size-3.5" aria-hidden="true" />
              By username
            </button>
            <button
              type="button"
              onClick={() => setMode("link")}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-colors duration-150 ease-in-out cursor-pointer",
                mode === "link"
                  ? "bg-tertiary text-on-tertiary"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              <Link2 className="size-3.5" aria-hidden="true" />
              Invite link
            </button>
          </div>

          {mode === "username" ? (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="invite-username"
                className="text-xs font-medium text-text-secondary"
              >
                Username
              </label>
              <input
                id="invite-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. julian.d"
                className="bg-surface-container border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary"
              />
              <p className="text-[11px] text-text-muted">
                They'll get a notification and show up as{" "}
                <span className="font-medium">Invited</span> in Team until they
                accept.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="invite-expiry"
                className="text-xs font-medium text-text-secondary"
              >
                Link expires
              </label>
              <select
                id="invite-expiry"
                value={expiresIn}
                onChange={(e) =>
                  setExpiresIn(
                    e.target.value as InviteByLinkValues["expiresIn"],
                  )
                }
                className="bg-surface-container border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-tertiary"
              >
                <option value="1h">In 1 hour</option>
                <option value="24h">In 24 hours</option>
                <option value="7d">In 7 days</option>
                <option value="never">Never</option>
              </select>
              <p className="text-[11px] text-text-muted">
                Anyone with this link can join as{" "}
                <span className="font-medium">
                  {ROLE_OPTIONS.find((r) => r.value === role)?.label}
                </span>
                .
              </p>
            </div>
          )}

          {error && <p className="text-xs text-danger">{error}</p>}

          {sentTo && (
            <div className="flex items-center gap-2 text-xs text-success bg-success-container rounded-md px-3 py-2">
              <Check className="size-3.5 shrink-0" aria-hidden="true" />
              Invite sent to <span className="font-medium">{sentTo}</span>.
            </div>
          )}

          {generatedUrl && (
            <div className="flex items-center gap-2 bg-surface-container border border-outline-subtle rounded-md px-3 py-2">
              <span className="flex-1 text-xs text-text-primary truncate">
                {generatedUrl}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy invite link"
                className="flex items-center justify-center size-7 rounded text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer shrink-0"
              >
                {copied ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          )}
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
            onClick={
              mode === "username" ? handleSubmitUsername : handleGenerateLink
            }
            className={clsx(
              "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-opacity duration-150 ease-in-out",
              submitting
                ? "opacity-70 cursor-wait"
                : "hover:opacity-90 cursor-pointer",
              "bg-tertiary text-on-tertiary",
            )}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "username" ? "Send invite" : "Generate link"}
          </button>
        </div>
      </div>
    </div>
  );
}
