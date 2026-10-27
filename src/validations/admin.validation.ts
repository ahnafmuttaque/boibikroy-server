import * as z from "zod";

export const AdminLoginSchema = z.object({
  email: z.string().trim().min(10).max(300),
  password: z.string().trim().min(6).max(40),
});

export const AdminRegisterSchema = AdminLoginSchema.extend({
  contact_no: z.string().min(14).max(14),
});

export type AdminLogin = z.infer<typeof AdminLoginSchema>;
export type AdminRegister = z.infer<typeof AdminRegisterSchema>;
