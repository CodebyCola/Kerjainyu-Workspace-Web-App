"use client";

import clsx from "clsx";
import { Handshake } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/routes/route";

export function BrandMark({
  expanded,
  onNavigate,
}: {
  expanded: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={ROUTES.PROJECTS}
      onClick={onNavigate}
      className={clsx(
        "h-16 flex items-center border-b border-outline-subtle shrink-0",
        expanded ? "gap-2 px-3 py-2" : "justify-center px-2 py-2",
      )}
    >
      <div className="border border-outline-subtle rounded-b-full items-center justify-center flex shrink-0">
        <Handshake />
      </div>
      {expanded && (
        <div>
          <p className="text-text-primary font-bold font-sans text-lg">
            KerjainYu
          </p>
          <p className="text-text-secondary font-sans">Workspace</p>
        </div>
      )}
    </Link>
  );
}
