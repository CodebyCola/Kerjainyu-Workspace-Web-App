export const ROUTES = {
  PROJECTS: "/projects",
  PROFILE: "/profile",
  MYTASK: "/my",
  HELP_CENTER: "/help-center",
  ARCHIVE: "/archive",

  // Project-scoped routes take a projectId now that pages like
  // Task Board / Team / Calendar / Files / Resources show data for
  // ONE project, not a global view. Kept as functions (not plain
  // strings) so every call site is forced to pass an id rather than
  // silently linking to a param-less path that 404s.
  PROJECT_TASKBOARD: (projectId: string | number) =>
    `/projects/${projectId}/taskboard`,
  PROJECT_TEAM: (projectId: string | number) => `/projects/${projectId}/team`,
  PROJECT_CALENDAR: (projectId: string | number) =>
    `/projects/${projectId}/calendar`,
  PROJECT_FILES: (projectId: string | number) => `/projects/${projectId}/files`,
  PROJECT_RESOURCES: (projectId: string | number) =>
    `/projects/${projectId}/resources`,
};
