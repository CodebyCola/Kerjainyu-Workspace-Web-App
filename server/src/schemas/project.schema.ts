import { z } from "zod";
import { createProjectLinkSchema, CreateProjectLinkSchema } from "./project-link.schema";


export const createProjectSchema = z.object({
  title: z.string().min(3, "Title needs at least 3 characters").max(100),
  deadline: z.coerce.date().optional(),
  allowFreeSwap: z.boolean().default(false),
  links: z.array(createProjectLinkSchema).max(20).optional()
});

export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Title needs at least 3 characters")
    .max(100)
    .optional(),
  deadline: z.coerce.date().nullable().optional(),
  allowFreeSwap: z.boolean().optional(),
  status: z.enum(["ongoing", "completed"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
