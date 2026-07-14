import { z } from "zod";

export const createTaskAppealSchema = z.object({
  submission_id: z.number().optional(), // omit if appealing while still ongoing
  reason: z
    .string()
    .min(10, "Please explain your appeal in more detail")
    .max(1000),
});

export const resolveAppealSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
  resolution_note: z.string().max(1000).optional(),
});

export type CreateTaskAppealInput = z.infer<typeof createTaskAppealSchema>;
export type ResolveAppealInput = z.infer<typeof resolveAppealSchema>;
