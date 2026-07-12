import { z } from "zod";

/**
 * Mirrors `createProjectSchema` in server/src/schemas/project.schema.ts
 * exactly — same three fields, same constraints. `status` is not part
 * of this schema because the server always sets it to "ongoing" on
 * create; it's not a user input. The leader is also not a field here —
 * the server assigns the creator (req.user.userId) as leader
 * automatically via project_members.
 */
export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Title needs at least 3 characters")
    .max(100, "Title must be 100 characters or fewer"),
  deadline: z.coerce.date().optional(),
  allow_free_swap: z.boolean().default(false),
});

export type CreateProjectFormValues = z.input<typeof createProjectSchema>;
export type CreateProjectInput = z.output<typeof createProjectSchema>;
