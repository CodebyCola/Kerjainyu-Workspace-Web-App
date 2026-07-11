import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(3, "Title needs at least 3 characters").max(100),
  deadline: z.coerce.date().optional(),
  allow_free_swap: z.boolean().default(false),
});

export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Title needs at least 3 characters")
    .max(100)
    .optional(),
  deadline: z.coerce.date().nullable().optional(),
  allow_free_swap: z.boolean().optional(),
  status: z.enum(["ongoing", "completed"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
