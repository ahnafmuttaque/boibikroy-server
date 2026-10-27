import * as z from "zod";

export const PostFeedbackSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(5, "must be greater than 20 characters")
    .max(150, "must be less than 150 characters"),
  full_name: z.string().trim().min(5).max(100),
  contact_no: z.string().trim().min(14).max(15),
  email: z.email(),
  description: z.string().trim().min(15).max(500),
});

export type PostFeedback = z.infer<typeof PostFeedbackSchema>;
