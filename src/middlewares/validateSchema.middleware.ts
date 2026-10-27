import type { NextFunction, Request, Response } from "express";
import type { _ZodType } from "zod";
import { AppError } from "@/utils/AppError.js";
import { StatusCodes } from "http-status-codes";

const validateBodyWithSchema = (zodSchema: _ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await zodSchema.safeParseAsync(req.body);
    if (!result.success) {
      const error = result.error.issues[0]?.message || "Invalid data";
      return next(new AppError(StatusCodes.BAD_REQUEST, error));
    }
    next();
  };
};

export default validateBodyWithSchema;
