import type { GetStudentsQuery } from "@validations/student.validation.js";
import {
  getDBStudentById,
  getDBStudentWithFilters,
} from "@modules/students/student.repository.js";
import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";

export async function getStudentsService(filters: GetStudentsQuery) {
  const queryResult = await getDBStudentWithFilters(filters);
  return queryResult;
}

export async function getStudentByIdService(studentId: number) {
  const result = await getDBStudentById(studentId);
  if (!result.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
  return result.rows[0]!;
}
