import * as z from "zod";

export const GetDistrictsQuerySchema = z.object({
  division_id: z.coerce
    .number()
    .int()
    .positive("Invalid division ID")
    .optional(),
});

export const GetUpazilasQuerySchema = z.object({
  district_id: z.coerce
    .number()
    .int()
    .positive("Invalid district ID")
    .optional(),
});

export type GetDistrictsQuery = z.infer<typeof GetDistrictsQuerySchema>;
export type GetUpazilasQuery = z.infer<typeof GetUpazilasQuerySchema>;
