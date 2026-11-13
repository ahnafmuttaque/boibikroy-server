import type { GetStudentsQuery } from "@validations/student.validation.js";
import {
  deleteDBStudentById,
  getDBStatusStudent,
  getDBStudentById,
  getDBStudentWithFilters,
  suspendDBStudentById,
} from "@modules/students/student.repository.js";
import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";

export async function deleteStudentByIdService(studentId: number) {
  const deleteResult = await deleteDBStudentById(studentId);
  if (deleteResult.rowCount === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
}

export async function getStudentsService(filters: GetStudentsQuery) {
  return await getDBStudentWithFilters(filters);
}

export async function getStudentByIdService(studentId: number) {
  const result = await getDBStudentById(studentId);
  if (!result.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
  return result.rows[0]!;
}

export async function getStudentSelfService(studentId: number) {
  const result = await getDBStudentById(studentId);
  if (!result.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
  const desiredStudent = result.rows[0]!;
  if (desiredStudent.status === "suspended") {
    throw new AppError(StatusCodes.FORBIDDEN, "Student is suspended");
  }
  return desiredStudent;
}

export async function suspendStudentById(
  studentId: number,
  adminId: number,
  reason?: string,
) {
  const getResult = await getDBStatusStudent(studentId);
  if (!getResult.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
  const { status } = getResult.rows[0]!;
  if (status === "suspended") {
    throw new AppError(StatusCodes.CONFLICT, "student is suspended already");
  }
  const suspendResult = await suspendDBStudentById(studentId, adminId, reason);
  if (!suspendResult.rowCount) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
}
