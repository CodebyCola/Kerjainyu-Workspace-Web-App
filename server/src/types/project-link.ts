import { ProjectLinkCategory, ProjectRole } from "../database/types";

export type CreateProjectLinkData = {
  label: string;
  url: string;
  category: ProjectLinkCategory;
};

export type UpdateProjectLinkData = Partial<CreateProjectLinkData>;
