import type {
  AdminPatch,
  AdminRegister,
  GetAdminQuery,
} from "@validations/admin.validation.js";
import type { NextFunction, Request, Response } from "express";
import {
  createAdminService,
  deleteAdminService,
  getAdminServiceWithId,
  getAllAdminsService,
  patchAdminService,
  suspendAdminService,
} from "@modules/admin/admin.service.js";
import { ApiResponse } from "@utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHanlder.js";
import { getPositiveNumberFromString } from "@validations/number.validation.js";

export const postCreateAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const registerCredentials: AdminRegister = req.body;
    const returningAdmin = await createAdminService(registerCredentials);
    new ApiResponse(StatusCodes.CREATED, returningAdmin).send(res);
  },
);

export const getAdminById = asyncHandler(async (req, res, next) => {
  const idStr = req.params.id;
  const getAdminId = getPositiveNumberFromString(idStr);
  const masterAdminId = req.user!.id;
  const result = await getAdminServiceWithId(getAdminId, masterAdminId);
  new ApiResponse(StatusCodes.OK, result).send(res);
});

export const patchAdmin = asyncHandler(async (req, res, next) => {
  const adminId = req.user!.id;
  const patchBody: AdminPatch = req.body;
  const returningAdmin = await patchAdminService(patchBody, adminId);
  new ApiResponse(StatusCodes.OK, returningAdmin).send(res);
});

export const deleteAdmin = asyncHandler(async (req, res, next) => {
  const masterAdminId = req.user!.id;
  const deleteId = getPositiveNumberFromString(req.params.id);
  const masterAdminEmail = req.user!.email;
  await deleteAdminService(deleteId, masterAdminId, masterAdminEmail);
  new ApiResponse(StatusCodes.NO_CONTENT).send(res);
});

export const getAllAdmins = asyncHandler(async (req, res, next) => {
  const queries: GetAdminQuery = req.query;
  const admins = await getAllAdminsService(queries);
  new ApiResponse(StatusCodes.OK, admins).send(res);
});

export const postSuspendAdmin = asyncHandler(async (req, res, next) => {
  const idStr = req.params.id;
  const suspendId = getPositiveNumberFromString(idStr);
  const masterAdminId = req.user!.id;
  const suspendedAdmin = await suspendAdminService(suspendId, masterAdminId);
  new ApiResponse(StatusCodes.OK, suspendedAdmin).send(res);
});
