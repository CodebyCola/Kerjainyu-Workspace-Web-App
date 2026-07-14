// types/swap-request.ts
import { SwapRequestStatus } from "../database/types";

export type CreateSwapRequestData = {
  task_id: number;
  target_task_id?: number | null;
  status?: SwapRequestStatus;
  resolved_by?: number | null;
  requested_by: number;
  requested_to: number;
};

export type UpdateSwapRequestData = Partial<{
  status: SwapRequestStatus;
  resolved_by: number | null;
  resolved_at: Date | null;
}>;
