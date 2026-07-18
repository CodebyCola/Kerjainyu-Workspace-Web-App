import {
  Archive,
  Calendar,
  CircleQuestionMark,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  LayoutGrid,
  Paperclip,
  Users,
  Settings,
} from "lucide-react";
import { ROUTES } from "@/routes/route";

export const navItems = [
  { href: ROUTES.PROJECTS, label: "Projects", icon: FolderOpen },
  { href: ROUTES.MYTASK, label: "My Tasks", icon: ClipboardList },
];

export const secondaryItems = [
  { href: ROUTES.HELP_CENTER, label: "Help Center", icon: CircleQuestionMark },
  { href: ROUTES.ARCHIVE, label: "Archive", icon: Archive },
];

export const PROJECT_NAV_ITEMS = [
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
  {
    key:"settings",
    label:"Settings",
    icon: Settings,
    route: ROUTES.PROJECT_SETTINGS,
  },
] as const;
