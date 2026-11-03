import type { AdminRegister } from "@validations/admin.validation.js";
import type { NextFunction, Request, Response } from "express";
import { createAdmin } from "./admin.service.js";
import { ApiResponse } from "@utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHanlder.js";

export const postCreateAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const registerCredentials: AdminRegister = req.body;
    const returningAdmin = await createAdmin(registerCredentials);
    new ApiResponse(StatusCodes.CREATED, returningAdmin).send(res);
  },
);
