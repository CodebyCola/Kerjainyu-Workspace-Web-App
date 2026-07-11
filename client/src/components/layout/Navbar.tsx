"use client";

import clsx from "clsx";
import { Bell, Menu, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/layout/SidebarContext";
import { ROUTES } from "@/routes/route";

const navItems = [
  { href: ROUTES.TASKBOARD, label: "Task Board" },
  { href: ROUTES.TEAM, label: "Team" },
  { href: ROUTES.CALENDAR, label: "Calendar" },
  { href: ROUTES.FILES, label: "Files" },
];

export default function Navbar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { toggle } = useSidebar();

  return (
    <header
      className={clsx("h-16 bg-surface border-b border-outline", className)}
    >
      <div className="flex items-center justify-between h-full gap-2 px-3 sm:px-4">
        <div className="flex items-center gap-1 min-w-0">
          {/*
            Hamburger trigger: only needed once the persistent sidebar
            (full or icon rail) disappears, i.e. below the `lg`
            breakpoint. Opens the same off-canvas drawer on both
            mobile and tablet.
          */}
          <button
            type="button"
            onClick={toggle}
            aria-label="Open menu"
            className={clsx(
              "lg:hidden flex items-center justify-center size-9 -ml-1 rounded-md shrink-0",
              "text-text-secondary hover:text-text-primary",
              "transition-colors duration-200 ease-in-out cursor-pointer",
            )}
          >
            <Menu className="size-5" />
          </button>

          <nav aria-label="Primary" className="h-full min-w-0">
            <ul className="flex items-center gap-3 sm:gap-5 h-full whitespace-nowrap">
              {navItems.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={clsx(
                        "relative px-2 sm:px-3 py-2 text-base sm:text-lg font-bold font-sans inline-block",
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
        </div>

        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
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
              "hidden sm:inline-flex text-text-secondary hover:text-text-primary",
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
