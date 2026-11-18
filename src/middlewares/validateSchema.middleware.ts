import type { NextFunction, Request, Response } from "express";
import type { _ZodType } from "zod";
import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";

const validateBodyWithSchema = (zodSchema: _ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await zodSchema.safeParseAsync(req.body);
    if (!result.success) {
      const error =
        result.error.issues[0]?.message || ReasonPhrases.BAD_REQUEST;
      return next(new AppError(StatusCodes.BAD_REQUEST, error));
    }
    req.body = result.data;
    next();
  };
};

export const validateQueryWithSchema = (zodSchema: _ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = zodSchema.safeParse(req.query);
    if (!result.success) {
      return next(
        new AppError(
          StatusCodes.BAD_REQUEST,
          result.error.issues[0]?.message || ReasonPhrases.BAD_REQUEST,
        ),
      );
    }
    Object.defineProperty(req, "query", {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    next();
  };
};
export { validateBodyWithSchema };
