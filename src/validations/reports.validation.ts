import * as z from "zod";

export const ReportTypeEnum = z.enum(["book", "student"]);

export const ReportStatusEnum = z.enum(["pending", "reviewed", "action_taken"]);

export const CreateReportSchema = z
  .object({
    type: z
      .enum(["book", "student"], "report can only be about book & student")
      .default("book"),
    book_id: z
      .number()
      .int("Book ID must be an integer")
      .positive("Book ID must be a positive integer")
      .optional(),
    student_id: z
      .number()
      .int("Student ID must be an integer")
      .positive("Student ID must be a positive integer")
      .optional(),
    reason: z
      .string("Reason is required")
      .trim()
      .min(20, "Reason must be at least 20 characters long"),
  })
  .strict()
  .superRefine((data, ctx) => {
    const effectiveType = data.type ?? "book";

    switch (effectiveType) {
      case "book":
        if (!data.book_id) {
          ctx.addIssue({
            code: "custom",
            message: "book_id is required when report type is 'book'",
            path: ["book_id"],
          });
        }
        if (data.student_id !== undefined) {
          ctx.addIssue({
            code: "custom",
            message:
              "student_id must not be provided when report type is 'book'",
            path: ["student_id"],
          });
        }
        break;

      case "student":
        if (!data.student_id) {
          ctx.addIssue({
            code: "custom",
            message: "student_id is required when report type is 'student'",
            path: ["student_id"],
          });
        }
        if (data.book_id !== undefined) {
          ctx.addIssue({
            code: "custom",
            message: "book_id must not be provided when report type is 'student'",
            path: ["book_id"],
          });
        }
        break;
    }
  });

export const GetReportsQuerySchema = z.object({
  search: z.string().trim().min(1).max(255).optional(),
  type: z.enum(["book", "student"]).optional(),
  status: z.enum(["pending", "reviewed", "action_taken"]).optional(),
  book_id: z.coerce.number().int().positive("Invalid book ID").optional(),
  student_id: z.coerce
    .number()
    .int()
    .positive("Invalid student ID")
    .optional(),
  reported_by: z.coerce
    .number()
    .int()
    .positive("Invalid reporter ID")
    .optional(),
  reviewed_by: z.coerce
    .number()
    .int()
    .positive("Invalid reviewer ID")
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

export const GetMyReportsQuerySchema = z.object({
  type: z.enum(["book", "student"]).optional(),
  status: z.enum(["pending", "reviewed", "action_taken"]).optional(),
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

export const UpdateReportStatusSchema = z
  .object({
    status: z.enum(["reviewed", "action_taken", "confirmed"], {
      message: "Status must be 'reviewed', 'action_taken', or 'confirmed'",
    }),
  })
  .strict();

export const ReportStatusParamSchema = z.enum(
  ["reviewed", "action_taken", "confirmed"],
  {
    message: "Status param must be 'reviewed', 'action_taken', or 'confirmed'",
  },
);

export type CreateReport = z.infer<typeof CreateReportSchema>;
export type GetReportsQuery = z.infer<typeof GetReportsQuerySchema>;
export type GetMyReportsQuery = z.infer<typeof GetMyReportsQuerySchema>;
export type UpdateReportStatus = z.infer<typeof UpdateReportStatusSchema>;
