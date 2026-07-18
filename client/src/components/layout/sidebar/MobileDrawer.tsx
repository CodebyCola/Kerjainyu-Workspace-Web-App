"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { SidebarBody } from "@/components/layout/sidebar/SidebarBody";

/** Overlay + slide-in drawer used on small screens (below the `md` breakpoint). */
export function MobileDrawer({
  isOpen,
  pathname,
  projectId,
  onClose,
}: {
  isOpen: boolean;
  pathname: string;
  projectId?: string;
  onClose: () => void;
}) {
  return (
    <div
      aria-hidden={!isOpen}
      className={clsx(
        "fixed inset-0 z-40 lg:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={clsx(
          "absolute inset-0 bg-neutral/70 transition-opacity duration-200 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        aria-label="Sidebar"
        className={clsx(
          "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto",
          "bg-surface border-r border-outline",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-end px-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={clsx(
              "flex items-center justify-center size-9 rounded-md text-text-secondary",
              "hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer",
            )}
          >
            <X className="size-5" />
          </button>
        </div>
        <SidebarBody
          pathname={pathname}
          projectId={projectId}
          onNavigate={onClose}
        />
      </aside>
    </div>
  );
}
