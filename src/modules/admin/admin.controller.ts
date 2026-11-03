import type { AdminRegister } from "@validations/admin.validation.js";
import type { NextFunction, Request, Response } from "express";
import {
  createAdminService,
  getAdminServiceWithId,
} from "@modules/admin/admin.service.js";
import { ApiResponse } from "@utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHanlder.js";
import { getPositiveNumberFromString } from "@validations/number.validation.js";
import { AppError } from "@utils/AppError.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";

export const postCreateAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const registerCredentials: AdminRegister = req.body;
    const returningAdmin = await createAdminService(registerCredentials);
    new ApiResponse(StatusCodes.CREATED, returningAdmin).send(res);
  },
);

export const getAdminById = asyncHandler(async (req, res, next) => {
  const idStr = req.params.id as string;
  const id = getPositiveNumberFromString(idStr);
  if (req.user?.role !== "admin") {
    return next(new AppError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN));
  }
  const result = await getAdminServiceWithId(id);
  new ApiResponse(StatusCodes.OK, result).send(res);
});

export const patchAdmin = asyncHandler(async (req, res, next) => {});
