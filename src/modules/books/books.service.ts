import type {
  CreateBook,
  GetBooksQuery,
} from "@validations/books.validation.js";
import {
  existsDBEduLevelById,
  getDBBooksWithFilters,
  insertDBBook,
} from "./books.repository.js";
import { getDBStatusStudent } from "@modules/students/student.repository.js";
import { getDBCampusById } from "@modules/saved_campuses/saved_campuses.repository.js";
import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";

export async function getBooksService(filters: GetBooksQuery) {
  // everyone (logged in or not) can only see active books of non-suspended students
  return await getDBBooksWithFilters(filters, ["active"], true);
}

export const createBookService = async (
  studentId: number,
  createBook: CreateBook,
) => {
  const statusRes = await getDBStatusStudent(studentId);
  if (!statusRes.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
  if (statusRes.rows[0]!.status === "suspended") {
    throw new AppError(StatusCodes.FORBIDDEN, "Student is suspended");
  }

  const eduLevelRes = await existsDBEduLevelById(createBook.edu_level_id);
  if (!eduLevelRes.rows[0]!.edu_level_exists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid education level id");
  }

  // meeting campus must be one of the student's own saved campuses
  const campusRes = await getDBCampusById(
    studentId,
    createBook.meeting_campus_id,
  );
  if (!campusRes.rows.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid meeting campus id");
  }

  const insertedRes = await insertDBBook(studentId, createBook);
  return insertedRes.rows[0]!;
};
