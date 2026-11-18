import * as z from "zod";

export const BD_PHONE_REGEX = /^\+880[0-9]{10}$/;
export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const FeedbackStatusEnum = z.enum([
  "pending",
  "reviewed",
  "mark-as-improvement",
]);

export const CreateFeedbackSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(300, "Subject must be at most 300 characters"),
  full_name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  contact_no: z
    .string()
    .trim()
    .regex(
      BD_PHONE_REGEX,
      "Invalid Bangladeshi phone number (e.g. +8801XXXXXXXXX)",
    ),
  email: z
    .string()
    .trim()
    .max(254, "Email must be at most 254 characters")
    .regex(EMAIL_REGEX, "Invalid email address"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be at most 5000 characters"),
});

/**
 * Validation schema for querying feedbacks (GET /feedbacks?subject={}&status={}&limit={}&page={})
 */
export const GetFeedbacksQuerySchema = z.object({
  subject: z.string().trim().min(1).max(300).optional(),
  status: z
    .enum([
      "pending",
      "reviewed",
      "mark-as-improvement",
      "mark-as-improvements",
    ])
    .optional(),
  limit: z.coerce
    .number()
    .int()
    .positive("Limit must be a positive integer")
    .max(100, "Limit cannot exceed 100")
    .optional(),
  page: z.coerce
    .number()
    .int()
    .positive("Page must be a positive integer")
    .optional(),
});

export const UpdateFeedbackStatusSchema = z.object({
  status: z.enum(
    ["reviewed", "mark-as-improvement"],
    {
      message:
        "Invalid feedback status. Must be 'reviewed' or 'mark-as-improvement'",
    }),
});


// Inferred TypeScript types
export type CreateFeedback = z.infer<typeof CreateFeedbackSchema>;
export type GetFeedbacksQuery = z.infer<typeof GetFeedbacksQuerySchema>;
export type UpdateFeedbackStatus = z.infer<typeof UpdateFeedbackStatusSchema>;
