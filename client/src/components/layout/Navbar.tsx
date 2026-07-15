"use client";

import clsx from "clsx";
import { Bell, Menu, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { useSidebar } from "@/components/layout/SidebarContext";
import { ROUTES } from "@/routes/route";

function pageTitleFor(pathname: string): string {
  if (pathname === ROUTES.PROJECTS) return "Projects";
  if (pathname === ROUTES.MYTASK) return "My Tasks";
  if (pathname === ROUTES.HELP_CENTER) return "Help Center";
  if (pathname === ROUTES.ARCHIVE) return "Archive";
  if (pathname === ROUTES.PROFILE) return "Profile";

  if (pathname.includes("/taskboard")) return "Task Board";
  if (pathname.includes("/team")) return "Team";
  if (pathname.includes("/calendar")) return "Calendar";
  if (pathname.includes("/resources")) return "Resources";
  if (pathname.includes("/files")) return "Files";

  return "KerjainYu";
}

export default function Navbar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { toggle } = useSidebar();
  const title = pageTitleFor(pathname);

  return (
    <header
      className={clsx("h-16 bg-surface border-b border-outline", className)}
    >
      <div className="flex items-center justify-between h-full gap-2 px-3 sm:px-4">
        <div className="flex items-center gap-2 min-w-0">
          {/* Hamburger */}
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
          
          <h1 className="text-base sm:text-lg font-bold font-sans text-text-primary truncate">
            {title}
          </h1>
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

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
