import type {
  AdminPatch,
  AdminRegister,
} from "@validations/admin.validation.js";
import {
  insertDBAdmin,
  getDBAdminByEmail,
  getDBAdminById,
  updateFullNameAndContactDBAdmin,
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
  const { id: _, ...rest } = desiredAdmin;
  return rest;
}

export async function patchAdminService(
  patchBody: AdminPatch,
  adminId: number,
) {
  const desiredAdmin = await getDBAdminById(adminId);
  if (!desiredAdmin) {
    throw new AppError(StatusCodes.BAD_REQUEST, "not found");
  }
  console.log(desiredAdmin.id, adminId);
  if (desiredAdmin.id !== adminId) {
    throw new AppError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
  }
  const updateResult = await updateFullNameAndContactDBAdmin(
    patchBody,
    adminId,
  );
  return updateResult!;
}
