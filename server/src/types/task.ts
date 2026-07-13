import { TaskStatus } from "../database/types";

export type CreateTaskData = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: number;
  display_order: number;
  deadline: Date | null;
  assignee_id: number | null;
  is_claimable: boolean;
};

export type UpdateTaskData = Partial<CreateTaskData>;