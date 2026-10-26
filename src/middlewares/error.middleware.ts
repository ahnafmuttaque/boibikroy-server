import type {NextFunction, Request, Response} from "express";
import {ZodError} from "zod";
import {StatusCodes} from "http-status-codes";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ReasonPhrases} from "http-status-codes/build/es/index.js";

function isZodError(err: unknown): err is ZodError {
   return err instanceof ZodError;
}

export default function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let error: Record<string, any> = {error: ReasonPhrases.INTERNAL_SERVER_ERROR};
    console.log(err);


    if(isZodError(err)) {
        statusCode = StatusCodes.BAD_REQUEST;
        error.error = err.issues;
    }

    new ApiResponse(statusCode, error).send(res);
}