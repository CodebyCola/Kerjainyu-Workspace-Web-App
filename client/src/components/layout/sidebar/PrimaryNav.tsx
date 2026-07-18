"use client";

import clsx from "clsx";
import Link from "next/link";
import { navItems } from "@/components/layout/sidebar/SidebarConstants";

/** Primary nav list. Shared between the rail (icon-only) and full sidebar. */
export function PrimaryNav({
  expanded,
  pathname,
  onNavigate,
}: {
  expanded: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Main" className="border-b border-outline-subtle py-2">
      <ul className={clsx("flex flex-col gap-3", !expanded && "items-center")}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href} className={expanded ? undefined : "w-full"}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                aria-label={expanded ? undefined : label}
                title={expanded ? undefined : label}
                className={clsx(
                  "relative flex items-center rounded-md text-lg overflow-hidden",
                  expanded
                    ? "gap-2 px-3 py-2"
                    : "mx-auto justify-center size-11",
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
                <Icon className="relative z-10 shrink-0" />
                {expanded && <span className="relative z-10">{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
