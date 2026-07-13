// schemas/swap-request.schema.ts
import { z } from "zod";

export const createSwapRequestSchema = z.object({
  task_id: z.number(), // the task you're offering
  target_task_id: z.number().optional(), // optional: task you want in exchange
  requested_to: z.number(), // the other member involved
});

export const resolveSwapRequestSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export type CreateSwapRequestInput = z.infer<typeof createSwapRequestSchema>;
export type ResolveSwapRequestInput = z.infer<typeof resolveSwapRequestSchema>;
