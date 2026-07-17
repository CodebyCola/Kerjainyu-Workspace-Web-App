import { z } from "zod";

export const createProjectMemberSchema = z.object({
  username: z.string().min(1, "Username is required"),
  role: z.enum(["leader", "member"]).default("member"),
});

export type CreateProjectMemberSchema = z.infer<
  typeof createProjectMemberSchema
>;
