import * as z from "zod";
import { EMAIL_REGEX } from "./admin.validation.js";

const BD_PHONE_REGEX = /^\+880[0-9]{10}$/;

export const StudentLoginSchema = z.object({
  email: z.string().trim().regex(EMAIL_REGEX, "Invalid email address").max(254),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(40, "Password must be at most 40 characters"),
});

export const StudentUpdatePasswordSchema = z
  .object({
    old_password: z
      .string()
      .trim()
      .min(6, "Old password must be at least 6 characters")
      .max(40, "Old password must be at most 40 characters"),
    new_password: z
      .string()
      .trim()
      .min(6, "New password must be at least 6 characters")
      .max(40, "New password must be at most 40 characters"),
    confirm_password: z
      .string()
      .trim()
      .min(6, "Confirm password must be at least 6 characters")
      .max(40, "Confirm password must be at most 40 characters"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New password and confirm password do not match",
    path: ["confirm_password"],
  });

export const StudentRegisterSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(255, "Full name must be at most 255 characters"),
  contact_no: z
    .string()
    .trim()
    .regex(
      BD_PHONE_REGEX,
      "Invalid Bangladeshi phone number (e.g. +8801XXXXXXXXX)",
    ),
  email: z.string().trim().regex(EMAIL_REGEX, "Invalid email address").max(254),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(40, "Password must be at most 40 characters"),
  college_id: z.number().int().positive("Invalid college ID"),
  edu_level_id: z.number().int().positive("Invalid education level ID"),
  upazila_id: z.number().int().positive("Invalid upazila ID"),
  address: z
    .string()
    .trim()
    .max(500, "Address must be at most 500 characters")
    .optional(),
});

export type StudentLogin = z.infer<typeof StudentLoginSchema>;
export type StudentRegister = z.infer<typeof StudentRegisterSchema>;
export type StudentUpdatePassword = z.infer<typeof StudentUpdatePasswordSchema>;
