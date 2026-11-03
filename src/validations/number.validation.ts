import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";
import z from "zod";

const N = z.coerce.number<number>();

export function getPositiveNumberFromString(str: string) {
  const result = N.safeParse(str);
  if (!result.success) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "invalid path parameter format",
    );
  }
  return result.data;
}
