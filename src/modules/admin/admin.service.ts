import type { AdminRegister } from "@validations/admin.validation.js";
import { createDBAdmin, getAdminByEmail } from "./admin.repository.js";
import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";

export async function createAdmin(registerCredentials: AdminRegister) {
  const { email, password } = registerCredentials;
  const isEmailUnique = await getAdminByEmail(email);
  if (!isEmailUnique) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email already exists");
  }
  registerCredentials.password = await bcrypt.hash(password, 12);
  const id = await createDBAdmin(registerCredentials);
  const { password: p, ...res } = registerCredentials;
  return res;
}
