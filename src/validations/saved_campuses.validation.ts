import * as z from "zod";

export const MAX_SAVED_CAMPUSES = 10;

export const CreateSavedCampusSchema = z.object({
  college_id: z
    .number({ message: "College ID is required" })
    .int("College ID must be an integer")
    .positive("College ID must be a positive integer"),
  meeting_place: z
    .string()
    .trim()
    .min(2, "Meeting place must be at least 2 characters")
    .max(300, "Meeting place must be at most 300 characters")
    .optional(),
});

export const UpdateSavedCampusSchema = z
  .object({
    meeting_place: z
      .string()
      .trim()
      .min(2, "Meeting place must be at least 2 characters")
      .max(300, "Meeting place must be at most 300 characters")
      .optional(),
    college_id: z
      .number()
      .int("College ID must be an integer")
      .positive("College ID must be a positive integer")
      .optional(),
  })
  .refine(
    (data) => data.meeting_place !== undefined || data.college_id !== undefined,
    {
      message: "At least one field must be provided to update",
    },
  );

export const DeleteCampusQuerySchema = z.object({
  altCampusId: z.coerce
    .number()
    .int("College ID must be an integer")
    .positive("College ID must be a positive integer")
    .optional(),
});

export type CreateSavedCampus = z.infer<typeof CreateSavedCampusSchema>;
export type UpdateSavedCampus = z.infer<typeof UpdateSavedCampusSchema>;
export type DeleteCampusQuery = z.infer<typeof DeleteCampusQuerySchema>;
