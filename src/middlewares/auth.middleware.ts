import type { NextFunction, Request, Response } from "express";
import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import envConfig from "@config/env.config.js";

export function validateJWt(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  try {
    const payload = jwt.verify(token, envConfig.JWT_SECRET) as any;
    (req as any).user = payload;
    next();
  } catch (err) {
    return next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid token"));
  }
}
