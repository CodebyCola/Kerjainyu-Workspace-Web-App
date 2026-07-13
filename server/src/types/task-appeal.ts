import { AppealStatus } from "../database/types";

export type CreateTaskAppealData = {
  task_id: number;
  submission_id?: number | null;
  raised_by: number;
  reason: string;
};

export type UpdateTaskAppealData = Partial<{
  status: AppealStatus;
  resolved_by: number | null;
  resolution_note: string | null;
  resolved_at: Date | null;
}>;
