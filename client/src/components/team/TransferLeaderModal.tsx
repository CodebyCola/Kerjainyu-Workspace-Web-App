"use client";

import clsx from "clsx";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ProjectMember } from "@/service/team/team.service";

export interface TransferLeaderModalProps {
  open: boolean;
  onClose: () => void;
  candidates: ProjectMember[];
  onConfirm: (newLeaderId: number) => Promise<void>;
}

export function TransferLeaderModal({
  open,
  onClose,
  candidates,
  onConfirm,
}: TransferLeaderModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;

    if (open && !dialogEl.open) {
      dialogEl.showModal();
      setSelectedId(candidates[0]?.id);
      setError(null);
    } else if (!open && dialogEl.open) {
      dialogEl.close();
    }
  }, [open]);

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleConfirm() {
    if (!selectedId) {
      setError("Choose a member first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className={clsx(
        "backdrop:bg-neutral/70 bg-transparent p-0 m-auto",
        "w-full max-w-sm",
      )}
    >
      <div className="bg-surface border border-outline-subtle rounded-lg p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="size-4.5 text-tertiary"
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold text-text-primary">
              Transfer leadership
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="text-text-muted hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {candidates.length === 0 ? (
          <p className="text-sm text-text-secondary">
            There's no one else in this project to hand leadership to yet.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="transfer-leader-select"
              className="text-xs font-medium text-text-secondary"
            >
              New leader
            </label>
            <select
              id="transfer-leader-select"
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="bg-neutral border border-outline-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-tertiary transition-colors duration-150 ease-in-out"
            >
              {candidates.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.username}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-text-muted">
              You'll become a regular member once this goes through.
            </p>
          </div>
        )}

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 text-sm font-medium py-2.5 rounded-md border border-outline-subtle text-text-secondary hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || candidates.length === 0}
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Transferring..." : "Transfer"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
