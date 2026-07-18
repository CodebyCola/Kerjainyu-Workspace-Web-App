import { z } from "zod";

const attachmentSchema = z.object({
  type: z.enum(["text", "image", "file", "link"]),
  content: z.string().min(1, "Content cannot be empty"),
});

export const createTaskSubmissionSchema = z
  .object({
    note: z.string().trim().max(1000).optional(),
    attachments: z.array(attachmentSchema).max(10).default([]),
  })
  .refine((data) => !!data.note || data.attachments.length > 0, {
    message: "Add a comment or at least one attachment before submitting",
    path: ["note"],
  });

export const reviewSubmissionSchema = z
  .object({
    review_status: z.enum(["approved", "revision_requested", "rejected"]),
    review_note: z.string().max(1000).optional(),
  })
  .refine(
    (data) => data.review_status !== "revision_requested" || !!data.review_note,
    {
      message: "review_note is required when requesting a revision",
      path: ["review_note"],
    },
  );

export type CreateTaskSubmissionInput = z.infer<
  typeof createTaskSubmissionSchema
>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
