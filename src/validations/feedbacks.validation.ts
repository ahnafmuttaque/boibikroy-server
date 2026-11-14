import * as z from "zod";

<<<<<<< HEAD
export const PostFeedbackSchema = z.object({
=======
export const BD_PHONE_REGEX = /^\+880[0-9]{10}$/;
export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const FeedbackStatusEnum = z.enum([
  "pending",
  "reviewed",
  "mark-as-improvement",
]);

export const UpdateFeedbackStatusEnum = z.enum(
  ["reviewed", "mark-as-improvement"],
  {
    message:
      "Invalid feedback status. Must be 'reviewed' or 'mark-as-improvement'",
  },
);

/**
 * Validation schema for creating a new feedback (POST /feedbacks)
 * Corresponds to sqls/feedback.create.sql
 */
export const CreateFeedbackSchema = z.object({
>>>>>>> 193d6a1 (add feedback validation schema for feedback apis)
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

<<<<<<< HEAD
export type PostFeedback = z.infer<typeof PostFeedbackSchema>;
=======
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

/**
 * Validation schema for feedback ID path parameter (GET /feedbacks/:id)
 */
export const FeedbackIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Invalid feedback ID format"),
});

/**
 * Validation schema for updating feedback status
 * Handles request body { status: "reviewed" | "mark-as-improvement" }
 */
export const UpdateFeedbackStatusSchema = z.object({
  status: UpdateFeedbackStatusEnum,
});

/**
 * Validation schema for route parameters in POST /feedbacks/:id/:status
 */
export const UpdateFeedbackRouteParamsSchema = z.object({
  id: z.coerce.number().int().positive("Invalid feedback ID format"),
  status: UpdateFeedbackStatusEnum,
});

// Inferred TypeScript types
export type CreateFeedback = z.infer<typeof CreateFeedbackSchema>;
export type PostFeedback = CreateFeedback;
export type GetFeedbacksQuery = z.infer<typeof GetFeedbacksQuerySchema>;
export type FeedbackIdParam = z.infer<typeof FeedbackIdParamSchema>;
export type UpdateFeedbackStatus = z.infer<typeof UpdateFeedbackStatusSchema>;
export type UpdateFeedbackRouteParams = z.infer<
  typeof UpdateFeedbackRouteParamsSchema
>;
>>>>>>> 193d6a1 (add feedback validation schema for feedback apis)
