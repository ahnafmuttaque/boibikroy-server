import type { NextFunction, Request, Response } from "express";
import type { AdminLogin } from "@/validations/admin.validation.js";
import { adminLoginService } from "./auth.service.js";
import { asyncHandler } from "@/utils/asyncHanlder.js";
import { ApiResponse } from "@/utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";

export const postLoginAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const credentials: AdminLogin = req.body;
    const clientRes = await adminLoginService(credentials);
    new ApiResponse(StatusCodes.OK, clientRes).send(res);
  },
);

export const postCreateAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminCredentials = req.body;
  },
);
