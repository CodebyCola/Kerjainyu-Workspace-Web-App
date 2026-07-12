"use client";

import clsx from "clsx";
import {
  Archive,
  Calendar,
  CircleQuestionMark,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Handshake,
  LayoutGrid,
  Paperclip,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import Container from "@/components/layout/Container";
import { useSidebar } from "@/components/layout/SidebarContext";
import {
  InviteMemberModal,
  type ProjectOption,
} from "@/components/team/InviteMemberModal";
import { ROUTES } from "@/routes/route";

// Demo data. In production this is the user's active project list
// (same source as app/projects/page.tsx), fetched once and passed
// down so the invite modal's project picker has something to show
// when there's no project already in context, and so this sidebar
// can resolve a title for whichever projectId is in the URL.
const userProjects: ProjectOption[] = [
  { id: 1, title: "Website Redesign Sprint" },
  { id: 2, title: "Mobile App Launch" },
];

// Always-visible, account-level destinations — not tied to any
// single project.
const navItems = [
  { href: ROUTES.PROJECTS, label: "Projects", icon: FolderOpen },
  { href: ROUTES.MYTASK, label: "My Tasks", icon: ClipboardList },
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

const PROJECT_NAV_ITEMS = [
  {
    key: "taskboard",
    label: "Task Board",
    icon: LayoutGrid,
    route: ROUTES.PROJECT_TASKBOARD,
  },
  { key: "team", label: "Team", icon: Users, route: ROUTES.PROJECT_TEAM },
  {
    key: "calendar",
    label: "Calendar",
    icon: Calendar,
    route: ROUTES.PROJECT_CALENDAR,
  },
  {
    key: "files",
    label: "Files",
    icon: Paperclip,
    route: ROUTES.PROJECT_FILES,
  },
  {
    key: "resources",
    label: "Resources",
    icon: ExternalLink,
    route: ROUTES.PROJECT_RESOURCES,
  },
] as const;

// Demo lookup — same one duplicated across the project-scoped pages
// (taskboard/team/calendar/files/resources) until there's a shared
// project store/query cache. Keeping it here too lets the sidebar
// show a title without prop-drilling it down from whichever page is
// active.
const PROJECT_TITLES: Record<string, string> = {
  "1": "Website Redesign Sprint",
  "2": "Mobile App Launch",
};

/**
 * Only rendered when the current route is inside /projects/[projectId]/...
 * — this is what replaces Navbar's old top-row nav (Task Board, Team,
 * Calendar, Files). Nesting it under the Projects item makes the
 * "these four pages belong to one project" relationship visible in
 * the UI, instead of living in an unrelated second nav list.
 */
function ProjectNav({
  expanded,
  projectId,
  pathname,
  onNavigate,
}: {
  expanded: boolean;
  projectId: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const projectTitle = PROJECT_TITLES[projectId] ?? "Project";

  if (!expanded) {
    // Icon rail is too narrow for a nested section without its own
    // scroll region — project pages stay reachable via the full
    // sidebar or drawer instead. The rail's Invite/Help Center/Archive
    // group has its own compact rendering, see RailBody below.
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

/** Secondary nav list (Help Center, Archive). `compact` renders icon-only for the rail. */
function SecondaryNav({
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
  projectId,
  onNavigate,
}: {
  pathname: string;
  projectId?: string;
  onNavigate?: () => void;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);

  const currentProject = projectId
    ? { id: Number(projectId), title: PROJECT_TITLES[projectId] ?? "Project" }
    : undefined;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-2">
        <BrandMark expanded onNavigate={onNavigate} />
        <Container>
          <PrimaryNav expanded pathname={pathname} onNavigate={onNavigate} />
        </Container>
      </div>

      {projectId && (
        <ProjectNav
          expanded
          projectId={projectId}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      )}

      {/*
        Pushes everything below (Invite + Help Center/Archive) down to
        the bottom of the sidebar, matching the reference layout —
        those items stay pinned to the bottom edge regardless of how
        few nav items are above them, instead of trailing right after
        the nav.
      */}
      <div className="flex-1" />

      <InviteButton compact={false} onClick={() => setInviteOpen(true)} />

      {/* Quick shortcut: if the user is currently inside a project, the
          invite goes straight to that project (modal skips the picker).
          Otherwise the modal shows the project selector so they pick one
          first. */}
      <SecondaryNav onNavigate={onNavigate} />

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        currentProject={currentProject}
        projects={userProjects}
      />
    </div>
  );
}

/**
 * Icon-only rail body (md–lg breakpoint). Mirrors SidebarBody's
 * structure — same bottom-pinned Invite/Help Center/Archive group —
 * but every piece renders compact since there's no room for labels.
 * ProjectNav is intentionally omitted here (see its own comment):
 * project pages stay reachable via the full sidebar or drawer.
 */
function RailBody({
  pathname,
  projectId,
}: {
  pathname: string;
  projectId?: string;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);

  const currentProject = projectId
    ? { id: Number(projectId), title: PROJECT_TITLES[projectId] ?? "Project" }
    : undefined;

  return (
    <div className="flex flex-col h-full min-h-0">
      <BrandMark expanded={false} />
      <PrimaryNav expanded={false} pathname={pathname} />

      <div className="flex-1" />

      <InviteButton compact onClick={() => setInviteOpen(true)} />
      <SecondaryNav compact />

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        currentProject={currentProject}
        projects={userProjects}
      />
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const projectId =
    typeof params?.projectId === "string" ? params.projectId : undefined;
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
        <SidebarBody pathname={pathname} projectId={projectId} />
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
        <RailBody pathname={pathname} projectId={projectId} />
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
          <SidebarBody
            pathname={pathname}
            projectId={projectId}
            onNavigate={close}
          />
        </aside>
      </div>
    </>
  );
}
