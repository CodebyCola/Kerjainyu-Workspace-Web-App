// types/task-submission.ts
import { ReviewStatus } from "../database/types";

export type CreateTaskSubmissionData = {
  task_id: number;
  submitted_by: number;
  note?: string | null;
};

export type UpdateTaskSubmissionData = Partial<{
  review_status: ReviewStatus;
  review_note: string | null;
  reviewed_by: number | null;
  reviewed_at: Date | null;
}>;