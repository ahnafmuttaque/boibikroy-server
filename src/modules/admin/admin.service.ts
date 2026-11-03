import type { AdminRegister } from "@validations/admin.validation.js";
import {
  insertDBAdmin,
  getDBAdminByEmail,
  getDBAdminById,
} from "./admin.repository.js";
import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";

export async function createAdminService(registerCredentials: AdminRegister) {
  const { email, password } = registerCredentials;
  const isEmailUnique = await getDBAdminByEmail(email);
  if (!isEmailUnique) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email already exists");
  }
  registerCredentials.password = await bcrypt.hash(password, 12);
  const id = await insertDBAdmin(registerCredentials);
  const { password: p, ...res } = registerCredentials;
  return res;
}

export async function getAdminServiceWithId(id: number) {
  const desiredAdmin = await getDBAdminById(id);
  console.log(desiredAdmin);
  if (!desiredAdmin) {
    throw new AppError(StatusCodes.NOT_FOUND, "not found");
  }
  if (desiredAdmin.role === "admin") {
    throw new AppError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      ReasonPhrases.UNPROCESSABLE_ENTITY,
    );
  }
  return desiredAdmin;
}
