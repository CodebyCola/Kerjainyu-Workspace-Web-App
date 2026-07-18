"use client";

import clsx from "clsx";
import Link from "next/link";
import { PROJECT_NAV_ITEMS } from "@/components/layout/sidebar/SidebarConstants";

/** Sub-navigation shown inside a project (Task Board, Team, Calendar, ...). */
export function ProjectNav({
  expanded,
  projectId,
  projectTitle,
  pathname,
  onNavigate,
}: {
  expanded: boolean;
  projectId: string;
  projectTitle: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  if (!expanded) {
    return null;
  }

  return (
    <div className="border-b border-outline-subtle py-3 px-2">
      <p className="px-3 pb-2 text-xs font-semibold text-text-muted truncate">
        {projectTitle}
      </p>
      <ul className="flex flex-col gap-1">
        {PROJECT_NAV_ITEMS.map(({ key, label, icon: Icon, route }) => {
          const href = route(projectId);
          const isActive = pathname === href;
          return (
            <li key={key}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "relative flex items-center gap-2 pl-6 pr-3 py-1.5 rounded-md text-sm overflow-hidden",
                  isActive
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    "absolute inset-0 bg-tertiary/10 rounded-md",
                    "origin-left transition-transform duration-300 ease-out",
                    isActive ? "scale-x-100" : "scale-x-0",
                  )}
                />
                <Icon className="relative z-10 shrink-0 size-4" />
                <span className="relative z-10">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
