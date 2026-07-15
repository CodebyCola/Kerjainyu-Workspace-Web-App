import { z } from "zod";

/** Matches TaskStatus in server/src/database/types.ts exactly. */
export const taskStatusSchema = z.enum([
  "unclaimed",
  "todo",
  "ongoing",
  "submitted",
  "in_revision",
  "approved",
  "rejected",
]);

export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Title needs at least 3 characters")
    .max(100, "Title must be 100 characters or fewer"),
  description: z.string().optional(),
  status: taskStatusSchema.default("unclaimed"),
  priority: z.number().int().min(1).nullable().optional(),
  displayOrder: z.number().int().optional(),
  deadline: z.coerce.date().nullable().optional(),
  assignee_id: z.number().int().nullable().optional(),
  isClaimable: z.boolean().default(false),
});

export type CreateTaskFormValues = z.input<typeof createTaskSchema>;
export type CreateTaskInput = z.output<typeof createTaskSchema>;
