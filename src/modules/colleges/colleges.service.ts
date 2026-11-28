import type { GetCollegesQuery } from "@validations/colleges.validation.js";
import { getDBCollegeById, getDBColleges } from "./colleges.repository.js";
import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";

export async function getCollegesService(filters: GetCollegesQuery) {
  return await getDBColleges(filters);
}

export async function getCollegeByIdService(collegeId: number) {
  const result = await getDBCollegeById(collegeId);
  if (!result.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "College not found");
  }
  return result.rows[0]!;
}
