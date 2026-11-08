import type {
  AdminPatch,
  AdminRegister,
  GetAdminQuery,
} from "@validations/admin.validation.js";
import {
  insertDBAdmin,
  getDBAdminByEmail,
  getDBAdminById,
  updateFullNameAndContactDBAdmin,
  deleteDBAdminById,
  getAllDBAdmins,
  getDBAdminForSuspension,
  suspendDBAdmin,
} from "./admin.repository.js";
import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";

export async function createAdminService(registerCredentials: AdminRegister) {
  const { email, password } = registerCredentials;
  const queryResult = await getDBAdminByEmail(email);
  if (queryResult.rows.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email already exists");
  }
  registerCredentials.password = await bcrypt.hash(password, 12);
  await insertDBAdmin(registerCredentials);
  const { password: p, ...res } = registerCredentials;
  return res;
}

export async function getAdminServiceWithId(id: number) {
  const queryResult = await getDBAdminById(id);
  if (queryResult.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
  }
  // returning the desired admin
  const { id: _, ...rest } = queryResult.rows[0]!;
  return rest;
}

export async function patchAdminService(
  patchBody: AdminPatch,
  adminId: number,
) {
  const queryResult = await getDBAdminById(adminId);
  if (queryResult.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
  }
  const updateResult = await updateFullNameAndContactDBAdmin(
    patchBody,
    adminId,
  );
  if (!updateResult.rows.length) {
    throw new AppError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      ReasonPhrases.UNPROCESSABLE_ENTITY,
    );
  }
  return updateResult.rows[0]!;
}

export async function deleteAdminService(
  deleteId: number,
  masterAdminId: number,
  masterAdminEmail: string,
) {
  const queryResult = await getDBAdminById(deleteId);
  if (!queryResult.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
  }
  const desiredAdmin = queryResult.rows[0]!;
  if (
    desiredAdmin.id === masterAdminId ||
    desiredAdmin.email === masterAdminEmail ||
    desiredAdmin.role === "admin"
  ) {
    throw new AppError(StatusCodes.CONFLICT, ReasonPhrases.CONFLICT);
  }
  await deleteDBAdminById(deleteId);
}

export async function getAllAdminsService(filters: GetAdminQuery) {
  const queryResult = await getAllDBAdmins(filters);
  return queryResult.rows;
}

export async function suspendAdminService(
  suspendId: number,
  masterAdminId: number,
) {
  const queryResult = await getDBAdminForSuspension(suspendId);
  if (!queryResult.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
  }
  const desiredAdmin = queryResult.rows[0]!;
  if (
    desiredAdmin.role === "admin" ||
    desiredAdmin.suspended_by ||
    desiredAdmin.id === masterAdminId
  ) {
    throw new AppError(StatusCodes.CONFLICT, ReasonPhrases.CONFLICT);
  }

  const suspendedAdmin = await suspendDBAdmin(suspendId, masterAdminId);
  return suspendedAdmin;
}
