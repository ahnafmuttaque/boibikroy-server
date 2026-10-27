import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ReasonPhrases } from "http-status-codes/build/es/index.js";
import { ApiResponse } from "@/utils/ApiResponse.js";
import { AppError } from "@/utils/AppError.js";

function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export default function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let errorObj: Record<string, any> = {
    error: ReasonPhrases.INTERNAL_SERVER_ERROR,
  };

  if (isAppError(err)) {
    statusCode = err.statusCode;
    errorObj.error = err.message;
  }

  console.log(err);
  new ApiResponse(statusCode, errorObj).send(res);
}
