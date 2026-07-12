"use client";

import clsx from "clsx";
import {
  ExternalLink,
  FileText,
  GitBranch,
  Link2,
  MoreHorizontal,
  NotebookText,
  PenTool,
  Table,
} from "lucide-react";

export interface ResourceLinkRowProps {
  label: string;
  url: string;
  addedBy: string;
  addedByInitials: string;
  onOpen?: () => void;
  onMenuClick?: () => void;
  className?: string;
}

/**
 * Lightweight platform detection from the URL's hostname — this is a
 * display nicety only, not a data model concern. `project_links` has no
 * `platform` column in the schema (just `label` + `url`), so nothing
 * here is persisted; it's purely derived at render time from whatever
 * URL the leader pasted in. Unrecognized domains fall back to a plain
 * link icon rather than guessing.
 *
 * lucide-react has no brand/logo icons (no Figma, GitHub, etc. glyphs)
 * — it's a generic outline icon set. These are the closest semantic
 * matches (a pen/tool for design tools, a branch icon for code hosts)
 * rather than actual brand marks. If real brand logos are wanted later,
 * that needs a separate package like `simple-icons` or `react-icons/si`.
 */
function detectPlatformIcon(url: string): typeof Link2 {
  try {
    const hostname = new URL(url).hostname;

    if (hostname.includes("figma.com")) return PenTool;
    if (hostname.includes("github.com")) return GitBranch;
    if (hostname.includes("docs.google.com")) return FileText;
    if (hostname.includes("sheets.google.com")) return Table;
    if (hostname.includes("drive.google.com")) return FileText;
    if (hostname.includes("notion.so") || hostname.includes("notion.site"))
      return NotebookText;

    return Link2;
  } catch {
    // Malformed URL (shouldn't happen if it passed the create-link
    // form's validation, but this render path shouldn't crash either way).
    return Link2;
  }
}

export function ResourceLinkRow({
  label,
  url,
  addedBy,
  addedByInitials,
  onOpen,
  onMenuClick,
  className,
}: ResourceLinkRowProps) {
  const Icon = detectPlatformIcon(url);

  return (
    <div
      className={clsx(
        "group flex items-center justify-between gap-3 py-3 px-1",
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
          <p className="text-sm font-medium text-text-primary truncate">
            {label}
          </p>
          <p className="text-xs text-text-muted truncate max-w-md">{url}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:flex items-center gap-2">
          <span
            className="flex items-center justify-center size-5 rounded-full bg-surface-container text-text-secondary text-[9px] font-semibold shrink-0"
            aria-hidden="true"
          >
            {addedByInitials}
          </span>
          <span className="text-xs text-text-muted whitespace-nowrap">
            Added by {addedBy}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Open ${label}`}
            className="text-text-muted hover:text-tertiary transition-colors duration-150 ease-in-out cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ExternalLink className="size-4" />
          </button>
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={`More options for ${label}`}
            className="text-text-muted hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
