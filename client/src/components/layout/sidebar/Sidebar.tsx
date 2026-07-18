"use client";

import clsx from "clsx";
import { useParams, usePathname } from "next/navigation";
import { useSidebar } from "@/components/layout/SidebarContext";
import { SidebarBody } from "@/components/layout/sidebar/SidebarBody";
import { RailBody } from "@/components/layout/sidebar/RailBody";
import { MobileDrawer } from "@/components/layout/sidebar/MobileDrawer";

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const projectId =
    typeof params?.projectId === "string" ? params.projectId : undefined;
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* full sidebar: desktop (lg+) */}
      <aside
        className={clsx(
          "hidden lg:flex lg:flex-col",
          "fixed inset-y-0 left-0 z-30 w-60 overflow-y-auto",
          "bg-surface border-r border-outline",
        )}
      >
        <SidebarBody pathname={pathname} projectId={projectId} />
      </aside>

      {/* icon rail: tablet (md to lg) */}
      <aside
        aria-label="Sidebar (collapsed)"
        className={clsx(
          "hidden md:flex lg:hidden flex-col",
          "fixed inset-y-0 left-0 z-30 w-16 overflow-y-auto",
          "bg-surface border-r border-outline",
        )}
      >
        <RailBody pathname={pathname} projectId={projectId} />
      </aside>

      {/* hamburger menu: mobile (below md) */}
      <MobileDrawer
        isOpen={isOpen}
        pathname={pathname}
        projectId={projectId}
        onClose={close}
      />
    </>
  );
}
