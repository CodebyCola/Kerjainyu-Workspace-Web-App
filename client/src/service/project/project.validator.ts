import { z } from "zod";

/**
 * Mirrors `projectLinkCategorySchema` / `createProjectLinkSchema` in
 * server/src/schemas/project-link.schema.ts exactly — same fields,
 * same constraints (label 1-100 chars, url must start with http(s)://,
 * category defaults to "other"). `added_by` and `project_id` aren't
 * form fields; the server derives them from the session and the
 * project being created.
 */
export const projectLinkCategorySchema = z.enum([
  "design",
  "development",
  "docs",
  "other",
]);

export const createProjectLinkSchema = z.object({
  label: z
    .string()
    .min(1, "Give this link a label")
    .max(100, "Label must be 100 characters or fewer"),
  url: z
    .string()
    .url("Must be a valid URL")
    .refine((val) => val.startsWith("http://") || val.startsWith("https://"), {
      message: "URL must start with http:// or https://",
    }),
  category: projectLinkCategorySchema.default("other"),
});

export type ProjectLinkCategory = z.infer<typeof projectLinkCategorySchema>;
export type CreateProjectLinkInput = z.output<typeof createProjectLinkSchema>;

/**
 * Mirrors `createProjectSchema` in server/src/schemas/project.schema.ts
 * exactly — same fields, same constraints. `status` is not part of
 * this schema because the server always sets it to "ongoing" on
 * create; it's not a user input. The leader is also not a field here —
 * the server assigns the creator (req.user.userId) as leader
 * automatically via project_members.
 *
 * `links` mirrors the server's optional array of up to 20 links,
 * inserted in the same transaction as the project (see
 * ProjectService.createProject) — so a project can be created with
 * its starting resources already attached, rather than requiring a
 * separate link-by-link follow-up via POST /projects/:id/links.
 */
export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Title needs at least 3 characters")
    .max(100, "Title must be 100 characters or fewer"),
  deadline: z.coerce.date().optional(),
  allowFreeSwap: z.boolean().default(false),
  links: z.array(createProjectLinkSchema).max(20, "Up to 20 links").optional(),
});

export type CreateProjectFormValues = z.input<typeof createProjectSchema>;
export type CreateProjectInput = z.output<typeof createProjectSchema>;
