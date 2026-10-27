import { StatusCodes } from "http-status-codes";
import { getAdminByEmail } from "./auth.repository.js";
import bcrypt from "bcryptjs";
import { AppError } from "@/utils/AppError.js";
import type { AdminLogin } from "@/validations/admin.validation.js";

export async function adminLoginService(credentials: AdminLogin) {
  const { email, password } = credentials;

  const requestedAdmin = await getAdminByEmail(email);
  if (!requestedAdmin) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const isValidPassword = bcrypt.compare(
    password,
    requestedAdmin.password_hash,
  );
  if (!isValidPassword) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }
  const { password_hash, id, suspended_by, suspended_at, ...rest } =
    requestedAdmin;

  return rest;
}
