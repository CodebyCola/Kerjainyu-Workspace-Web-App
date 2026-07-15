"use client";

import clsx from "clsx";
import { ExternalLink } from "lucide-react";

export interface ResourceRowProps {
  title: string;
  url: string;
  domain: string;
  addedBy: string;
  onOpen?: () => void;
  className?: string;
}

export function ResourceRow({
  title,
  url,
  domain,
  addedBy,
  onOpen,
  className,
}: ResourceRowProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onOpen}
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
          <ExternalLink className="size-4" />
        </span>

        <div className="min-w-0">
          <p className="text-sm text-text-primary truncate group-hover:text-tertiary transition-colors duration-150 ease-in-out">
            {title}
          </p>
          <p className="text-xs text-text-muted truncate">{domain}</p>
        </div>
      </div>

      <span className="text-xs text-text-muted shrink-0 hidden sm:inline">
        Added by {addedBy}
      </span>
    </a>
  );
}
