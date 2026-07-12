import { z } from "zod";

export const projectLinkCategorySchema = z.enum([
  "design",
  "development",
  "docs",
  "other",
]);

export const createProjectLinkSchema = z.object({
  label: z.string().min(1, "Label needs at least 1 character").max(100),
  url: z
    .string()
    .url("Must be a valid url")
    .refine((val) => val.startsWith("http://") || val.startsWith("https://"), {
      message: "URL must be start with http:// or https://",
    }),
  category: projectLinkCategorySchema.default("other"),
});

export type CreateProjectLinkSchema = z.infer<typeof createProjectLinkSchema>;
