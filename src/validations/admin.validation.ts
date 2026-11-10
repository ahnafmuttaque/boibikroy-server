import * as z from "zod";

export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const BD_PHONE_REGEX = /^\+880[0-9]{10}$/;

export const AdminLoginSchema = z.object({
  email: z.string().trim().regex(EMAIL_REGEX, "Invalid email address").max(254),
  password: z.string().trim().min(6).max(40),
});

export const AdminRegisterSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().regex(EMAIL_REGEX, "Invalid email address").max(254),
  password: z.string().trim().min(6).max(40),
  contact_no: z
    .string()
    .trim()
    .regex(
      BD_PHONE_REGEX,
      "Invalid Bangladeshi phone number (e.g. +8801XXXXXXXXX)",
    ),
});

export const AdminPatchSchema = z
  .object({
    full_name: z.string().trim().min(2).max(100).optional(),
    contact_no: z
      .string()
      .trim()
      .regex(BD_PHONE_REGEX, "Invalid phone number")
      .optional(),
  })
  .refine((data) => data.full_name || data.contact_no, {
    message: "At least one field must be provided to update",
  });

export const GetAdminQuerySchema = z.object({
  status: z.optional(z.literal(["active", "suspend"])),
  email: z.optional(
    z.string().trim().regex(EMAIL_REGEX, "Invalid email address").max(254),
  ),
  full_name: z.optional(z.string().trim().min(2).max(100)),
});

export type AdminPatch = z.infer<typeof AdminPatchSchema>;
export type AdminLogin = z.infer<typeof AdminLoginSchema>;
export type AdminRegister = z.infer<typeof AdminRegisterSchema>;
export type GetAdminQuery = z.infer<typeof GetAdminQuerySchema>;
