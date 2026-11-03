import { AppError } from "@utils/AppError.js";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

type Role = "admin" | "moderator" | "student";

export function validateRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const candidateRole = (req as any).user.role;
    if (!roles.includes(candidateRole)) {
      return next(new AppError(StatusCodes.UNAUTHORIZED, "permission denied"));
    }
    next();
  };
}
