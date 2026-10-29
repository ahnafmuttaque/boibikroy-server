import type { NextFunction, Request, Response } from "express";
import type { AdminLogin } from "@/validations/admin.validation.js";
import { adminLoginService } from "./auth.service.js";
import { asyncHandler } from "@/utils/asyncHanlder.js";
import { ApiResponse } from "@/utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import { createJWT } from "@/utils/createJWT.js";
import { cookieConfig } from "@/config/cookie.config.js";

export const postLoginAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const credentials: AdminLogin = req.body;
    const clientRes = await adminLoginService(credentials);
    const jwtPayload = {
      id: clientRes.id,
      email: clientRes.email,
      role: clientRes.role,
    };
    const token = createJWT(jwtPayload);
    res.cookie("token", token, cookieConfig);
    const { id, password_hash, ...rest } = clientRes;
    new ApiResponse(StatusCodes.OK, rest).send(res);
  },
);

export const postCreateAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminCredentials = req.body;
  },
);
