import { ProjectStatus } from "../database/types";

export type CreateProjectData = {
  title: string;
  status?: ProjectStatus;
  allow_free_swap?: boolean;
  deadline?: Date | null;
};

export type UpdateProjectData = Partial<{
  title: string;
  status: ProjectStatus;
  allow_free_swap: boolean;
  deadline: Date | null;
  is_archived: boolean;
  is_archived_at: Date | null;
}>;
