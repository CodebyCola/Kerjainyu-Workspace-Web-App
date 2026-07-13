import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title needs at least 3 characters").max(100),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.number().int().min(1),
  displayOrder: z.number().int().optional(),
  project_id: z.number().int().positive(),
  deadline: z.coerce.date().nullable().optional(),
  assignee_id: z.number().int().nullable().optional(),
  isClaimeable: z.boolean().default(false),
});
