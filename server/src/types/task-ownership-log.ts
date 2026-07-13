import { OwnershipChangeReason } from "../database/types";

export type CreateTaskOwnershipLogData = {
  task_id: number;
  from_user_id: number | null;
  to_user_id: number;
  reason: OwnershipChangeReason;
};

export type UpdateTaskOwnershipLogData = Partial<{
  task_id: number;
  from_user_id: number | null;
  to_user_id: number;
  reason: OwnershipChangeReason;
}>;
