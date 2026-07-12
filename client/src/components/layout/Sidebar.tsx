"use client";

import clsx from "clsx";
import {
  Archive,
  CircleQuestionMark,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Handshake,
  UserRoundPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Container from "@/Components/layout/Container";
import { useSidebar } from "@/components/layout/SidebarContext";
import {
  InviteMemberModal,
  type ProjectOption,
} from "@/components/team/InviteMemberModal";
import { ROUTES } from "@/Routes/route";

// Demo data. In production this is the user's active project list
// (same source as app/projects/page.tsx), fetched once and passed
// down so the invite modal's project picker has something to show
// when there's no project already in context (see note above
// SecondaryNav below).
const userProjects: ProjectOption[] = [
  { id: 1, title: "Website Redesign Sprint" },
  { id: 2, title: "Mobile App Launch" },
];

const navItems = [
  { href: ROUTES.PROJECTS, label: "Projects", icon: FolderOpen },
  { href: ROUTES.MYTASK, label: "My Tasks", icon: ClipboardList },
  { href: ROUTES.RESOURCES, label: "Resources", icon: ExternalLink },
];

const secondaryItems = [
  { href: ROUTES.HELP_CENTER, label: "Help Center", icon: CircleQuestionMark },
  { href: ROUTES.ARCHIVE, label: "Archive", icon: Archive },
];

/**
 * Brand mark used by both the full sidebar and the icon-only rail.
 * `expanded` controls whether the wordmark renders next to the icon.
 */
function BrandMark({
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

/** Primary nav list. Shared between the rail (icon-only) and full sidebar. */
function PrimaryNav({
  expanded,
  pathname,
  onNavigate,
}: {
  expanded: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav
      aria-label="Main"
      className={clsx(
        "border-b border-outline-subtle",
        expanded ? "lg:min-h-115 md:min-h-110 sm:min-h-110 max-h-115" : "py-2",
      )}
    >
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

/** Secondary nav list (Help Center, Archive). Full-sidebar / drawer only. */
function SecondaryNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Secondary" className="mt-3 px-2">
      <ul className="flex flex-col gap-3">
        {secondaryItems.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-md text-lg",
                "text-text-secondary hover:text-text-primary",
                "transition-colors duration-200 ease-in-out",
              )}
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function InviteButton({
  compact,
  onClick,
}: {
  compact: boolean;
  onClick: () => void;
}) {
  return (
    <div className={clsx("mt-3", compact ? "px-2" : "px-4")}>
      <button
        type="button"
        onClick={onClick}
        aria-label="Invite Member"
        title={compact ? "Invite Member" : undefined}
        className={clsx(
          "group flex items-center justify-center gap-2 w-full h-10 rounded-md border border-outline",
          "bg-surface-container text-text-primary cursor-pointer",
          "transition-colors duration-200 ease-in-out",
          "hover:border-tertiary hover:text-tertiary-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2",
        )}
      >
        <UserRoundPlus className="size-4 shrink-0 transition-colors duration-200 ease-in-out text-secondary group-hover:text-primary" />
        {!compact && (
          <span className="text-sm transition-colors duration-200 ease-in-out font-medium font-sans text-secondary group-hover:text-primary">
            Invite Member
          </span>
        )}
      </button>
    </div>
  );
}

/** Full labeled sidebar body — reused by the desktop rail and the mobile/tablet drawer. */
function SidebarBody({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <div className="px-2">
        <BrandMark expanded onNavigate={onNavigate} />
        <Container>
          <PrimaryNav expanded pathname={pathname} onNavigate={onNavigate} />
        </Container>
      </div>

      <InviteButton compact={false} onClick={() => setInviteOpen(true)} />

      {/* This button for quick shortcut, so if the user is currently in a project and then the invite work to the current project. but if the user not choose the project yet, *the button add 1 project selector into the invite form* */}
      <SecondaryNav onNavigate={onNavigate} />

      {/*
        No project context here (sidebar is global, not project-scoped),
        so the modal shows the project picker — see comment above.
        TODO: once there's a "current project" concept (e.g. from the
        route or a global store), pass it as `currentProject` instead
        of `projects` to skip the picker, matching the Team page usage.
      */}
      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projects={userProjects}
      />
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    // Every variant below is independently `fixed`, so none of them
    // are CSS Grid/Flexbox items in RootLayout — they just pin
    // themselves to the left edge of the viewport. This avoids the
    // earlier bug where conditionally-hidden grid items broke
    // auto-placement for Navbar/main. RootLayout reserves matching
    // space with responsive left padding instead.
    <>
      {/*
        Desktop sidebar (lg+): always visible, full width, pinned to
        the left edge — matches the original design exactly.
      */}
      <aside
        className={clsx(
          "hidden lg:flex lg:flex-col",
          "fixed inset-y-0 left-0 z-30 w-60 overflow-y-auto",
          "bg-surface border-r border-outline",
        )}
      >
        <SidebarBody pathname={pathname} />
      </aside>

      {/*
        Tablet icon rail (md–lg): persistent, icon-only, so primary
        navigation stays reachable without opening the drawer. Hidden
        below md (mobile relies entirely on the drawer) and above lg
        (replaced by the full sidebar).
      */}
      <aside
        aria-label="Sidebar (collapsed)"
        className={clsx(
          "hidden md:flex lg:hidden flex-col",
          "fixed inset-y-0 left-0 z-30 w-16 overflow-y-auto",
          "bg-surface border-r border-outline",
        )}
      >
        <BrandMark expanded={false} />
        <PrimaryNav expanded={false} pathname={pathname} />
      </aside>

      {/*
        Mobile / tablet off-canvas drawer (< lg): hidden entirely until
        the hamburger in Navbar opens it. Renders the same full body as
        the desktop sidebar so nothing is lost when collapsed to a rail
        or hidden on small screens.
      */}
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
          onClick={close}
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
              onClick={close}
              aria-label="Close menu"
              className={clsx(
                "flex items-center justify-center size-9 rounded-md text-text-secondary",
                "hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer",
              )}
            >
              <X className="size-5" />
            </button>
          </div>
          <SidebarBody pathname={pathname} onNavigate={close} />
        </aside>
      </div>
    </>
  );
}
