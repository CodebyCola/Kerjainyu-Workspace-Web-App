import { z } from "zod";


export const projectSettingsSchema = z.object({
  title: z
    .string()
    .min(3, "Title needs at least 3 characters")
    .max(100, "Title must be 100 characters or fewer"),
  deadline: z
    .string()
    .optional()
    .transform((val) => (val ? val : null)),
  allowFreeSwap: z.boolean(),
});

export type ProjectSettingsFormValues = z.input<typeof projectSettingsSchema>;
export type ProjectSettingsInput = z.output<typeof projectSettingsSchema>;
