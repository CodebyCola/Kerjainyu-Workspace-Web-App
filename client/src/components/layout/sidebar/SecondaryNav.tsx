"use client";

import clsx from "clsx";
import Link from "next/link";
import { secondaryItems } from "@/components/layout/sidebar/SidebarConstants";

/** Secondary nav list (Help Center, Archive). `compact` renders icon-only for the rail. */
export function SecondaryNav({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Secondary" className="mt-3 px-2">
      <ul className={clsx("flex flex-col gap-3", compact && "items-center")}>
        {secondaryItems.map(({ href, label, icon: Icon }) => (
          <li key={label} className={compact ? "w-full" : undefined}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-label={compact ? label : undefined}
              title={compact ? label : undefined}
              className={clsx(
                "flex items-center rounded-md text-lg",
                compact ? "mx-auto justify-center size-11" : "gap-2 px-3 py-2",
                "text-text-secondary hover:text-text-primary",
                "transition-colors duration-200 ease-in-out",
              )}
            >
              <Icon className="size-5 shrink-0" />
              {!compact && <span>{label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
