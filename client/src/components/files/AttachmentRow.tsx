"use client";

import clsx from "clsx";
import {
  AlignLeft,
  Download,
  ExternalLink,
  FileText,
  Image,
  Link2,
} from "lucide-react";

export type AttachmentType = "text" | "image" | "file" | "link";

export interface AttachmentRowProps {
  type: AttachmentType;
  name?: string;
  preview?: string;
  submittedBy: string;
  submittedDate: string;
  onDownload?: () => void;
  onOpen?: () => void;
  className?: string;
}

const TYPE_ICON: Record<AttachmentType, typeof FileText> = {
  text: AlignLeft,
  image: Image,
  file: FileText,
  link: Link2,
};

export function AttachmentRow({
  type,
  name,
  preview,
  submittedBy,
  submittedDate,
  onDownload,
  onOpen,
  className,
}: AttachmentRowProps) {
  const Icon = TYPE_ICON[type];
  const isLink = type === "link";
  const isText = type === "text";

  return (
    <div
      className={clsx(
        "group flex items-center justify-between gap-3 py-2.5 px-1",
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="flex items-center justify-center size-8 rounded-md bg-surface-container text-text-muted shrink-0"
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>

        <div className="min-w-0">
          {isText ? (
            <p className="text-sm text-text-secondary truncate max-w-xl">
              {preview}
            </p>
          ) : (
            <p className="text-sm text-text-primary truncate">{name}</p>
          )}
          <p className="text-xs text-text-muted">{submittedDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-text-muted hidden sm:inline">
          {submittedBy}
        </span>
        <span className="flex items-center justify-center size-4 shrink-0">
          {!isText && (
            <button
              type="button"
              onClick={isLink ? onOpen : onDownload}
              aria-label={isLink ? `Open ${name}` : `Download ${name}`}
              className="text-text-muted hover:text-tertiary transition-colors duration-150 ease-in-out cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              {isLink ? (
                <ExternalLink className="size-4" />
              ) : (
                <Download className="size-4" />
              )}
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
