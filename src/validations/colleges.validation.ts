import * as z from "zod";

export const GetCollegesQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, "Search must be at least 1 character")
    .max(300, "Search must be at most 300 characters")
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

export type GetCollegesQuery = z.infer<typeof GetCollegesQuerySchema>;
