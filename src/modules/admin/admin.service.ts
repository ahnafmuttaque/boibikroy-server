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

export async function getAllAdminsService(filters: GetAdminQuery) {
  // fetching the admins with the filters but not the master admin
  const queryResult = await getAllDBAdmins(filters);
  return queryResult.rows;
}

export async function createAdminService(registerCredentials: AdminRegister) {
  const { email, password } = registerCredentials;
  const queryResult = await getDBAdminByEmail(email);
  // check whether the admin with email already exists
  if (queryResult.rows.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email already exists");
  }
  // hash the password
  registerCredentials.password = await bcrypt.hash(password, 12);
  await insertDBAdmin(registerCredentials);
  const { password: p, ...res } = registerCredentials;
  return res;
}

export async function getAdminServiceWithId(getAdminId: number, masterAdminId: number) {
  const queryResult = await getDBAdminById(getAdminId);
  if (queryResult.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
  }
  // check whether it's the master admin himself
  const desiredAdmin  = queryResult.rows[0]!;
  if (desiredAdmin.id === masterAdminId || desiredAdmin.role === "admin") {
    throw new AppError(StatusCodes.CONFLICT, ReasonPhrases.CONFLICT);
  }
  // returning the desired admin
  const { id: _, ...rest } = queryResult.rows[0]!;
  return rest;
}

export async function patchAdminService(
  patchBody: AdminPatch,
  adminId: number,
) {
  // check whether the admin exists
  const queryResult = await getDBAdminById(adminId);
  if (!queryResult.rows.length) {
    // throw error cause the admin doesn't exist
    throw new AppError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
  }
  // admin exists then updating the admin
  const updateResult = await updateFullNameAndContactDBAdmin(
    patchBody,
    adminId,
  );
  // check whether the request was successful
  if (!updateResult.rows.length) {
    throw new AppError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      ReasonPhrases.UNPROCESSABLE_ENTITY,
    );
  }
  // return updated admin infos
  return updateResult.rows[0]!;
}

export async function deleteAdminService(
  deleteId: number,
  masterAdminId: number,
  masterAdminEmail: string,
) {
  // check for the admin
  const queryResult = await getDBAdminById(deleteId);
  if (!queryResult.rows.length) {
    // throw error if the admin doesn't exist
    throw new AppError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
  }
  // the admin exists
  const desiredAdmin = queryResult.rows[0]!;
  // check if the admin is master admin
  // if master admin throw error
  if (
    desiredAdmin.id === masterAdminId ||
    desiredAdmin.email === masterAdminEmail ||
    desiredAdmin.role === "admin"
  ) {
    throw new AppError(StatusCodes.CONFLICT, ReasonPhrases.CONFLICT);
  }
  // deleting the admin cause it's not the master admin
  await deleteDBAdminById(deleteId);
}

export async function suspendAdminService(
  suspendId: number,
  masterAdminId: number,
) {
  // check whether the suspend admin exists or not
  const queryResult = await getDBAdminForSuspension(suspendId);
  if (!queryResult.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
  }
  // got the suspend admin
  const desiredAdmin = queryResult.rows[0]!;
  // checking whether the suspended admin is the master admin himself
  if (
    desiredAdmin.role === "admin" ||
    desiredAdmin.suspended_by ||
    desiredAdmin.id === masterAdminId
  ) {
    // throwing error cause the suspended admin is the master admin
    throw new AppError(StatusCodes.CONFLICT, ReasonPhrases.CONFLICT);
  }
  // now suspend the admin
  const suspendResult = await suspendDBAdmin(suspendId, masterAdminId);
  // checking if suspension is done
  if (!suspendResult.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
  }
  // returning the suspended admin
  return suspendResult.rows[0]!;
}
