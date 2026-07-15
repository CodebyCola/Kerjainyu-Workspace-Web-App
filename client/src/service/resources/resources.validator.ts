import type { z } from "zod";
import {
  createProjectLinkSchema,
  projectLinkCategorySchema,
} from "@/service/project/project.validator";

/**
 * Resources (a.k.a. "project links") share the exact same shape as
 * the links embedded in project creation — both ultimately hit
 * createProjectLinkSchema on the server (server/src/schemas/project-link.schema.ts).
 * Re-exported from project.validator.ts rather than redefined here,
 * so there's one schema to keep in sync with the server, not two.
 */
export const createResourceLinkSchema = createProjectLinkSchema;
export const resourceCategorySchema = projectLinkCategorySchema;

export type CreateResourceLinkInput = z.output<typeof createResourceLinkSchema>;
export type ResourceCategory = z.infer<typeof resourceCategorySchema>;
