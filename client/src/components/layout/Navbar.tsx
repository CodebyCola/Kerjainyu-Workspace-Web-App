"use client";

import clsx from "clsx";
import { Bell, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/routes/route";

const navItems = [
  { href: ROUTES.TASKBOARD, label: "Task Board" },
  { href: ROUTES.TEAM, label: "Team" },
  { href: ROUTES.CALENDAR, label: "Calendar" },
  { href: ROUTES.FILES, label: "Files" },
];

export default function Navbar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <header
      className={clsx("h-16 bg-surface border-b border-outline", className)}
    >
      <div className="flex items-center justify-between h-full px-4">
        <nav aria-label="Primary" className="h-full">
          <ul className="flex items-center gap-5 h-full">
            {navItems.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={clsx(
                      "relative px-3 py-2 text-lg font-bold font-sans inline-block",
                      isActive
                        ? "text-text-primary"
                        : "text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {label}
                    <span
                      aria-hidden="true"
                      className={clsx(
                        "absolute left-0 -bottom-px h-0.5 w-full bg-tertiary",
                        "origin-center transition-transform duration-300 ease-out",
                        isActive ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-6">
          <button
            type="button"
            aria-label="Notifications"
            className={clsx(
              "text-text-secondary hover:text-text-primary",
              "transition-colors duration-200 ease-in-out cursor-pointer",
            )}
          >
            <Bell className="size-5" />
          </button>

          <button
            type="button"
            aria-label="Settings"
            className={clsx(
              "text-text-secondary hover:text-text-primary",
              "transition-colors duration-200 ease-in-out cursor-pointer",
            )}
          >
            <Settings className="size-5" />
          </button>

          <Link href={ROUTES.PROFILE} aria-label="Profile">
            <Image
              src="/avatar-placeholder.png"
              alt="Profile"
              width={32}
              height={32}
              className="size-8 rounded-full object-cover border border-outline-subtle"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
