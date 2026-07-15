export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  PROJECTS: "/projects",
  PROFILE: "/profile",
  MYTASK: "/mytask",
  HELP_CENTER: "/help-center",
  ARCHIVE: "/archive",

  PROJECT_TASKBOARD: (projectId: string | number) =>
    `/projects/${projectId}/taskboard`,
  PROJECT_TEAM: (projectId: string | number) => `/projects/${projectId}/team`,
  PROJECT_CALENDAR: (projectId: string | number) =>
    `/projects/${projectId}/calendar`,
  PROJECT_FILES: (projectId: string | number) => `/projects/${projectId}/files`,
  PROJECT_RESOURCES: (projectId: string | number) =>
    `/projects/${projectId}/resources`,
};
