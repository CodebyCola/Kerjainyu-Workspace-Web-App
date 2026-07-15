import { z } from "zod";

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
