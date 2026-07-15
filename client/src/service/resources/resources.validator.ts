import type { z } from "zod";
import {
  createProjectLinkSchema,
  projectLinkCategorySchema,
} from "@/service/project/project.validator";

export const createResourceLinkSchema = createProjectLinkSchema;
export const resourceCategorySchema = projectLinkCategorySchema;

export type CreateResourceLinkInput = z.output<typeof createResourceLinkSchema>;
export type ResourceCategory = z.infer<typeof resourceCategorySchema>;
