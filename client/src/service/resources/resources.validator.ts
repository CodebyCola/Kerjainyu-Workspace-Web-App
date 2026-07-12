import { z } from "zod";

/**
 * Matches `project_links` from the DBML schema: `label`, `url`,
 * `added_by` (server-assigned from the session, not user input).
 */
export const createResourceLinkSchema = z.object({
  label: z
    .string()
    .min(1, "Give this link a short label")
    .max(60, "Label must be 60 characters or fewer"),
  url: z.string().url("Enter a valid URL, e.g. https://docs.google.com/..."),
});

export type CreateResourceLinkInput = z.infer<typeof createResourceLinkSchema>;
