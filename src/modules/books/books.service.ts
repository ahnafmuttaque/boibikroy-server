import type {
  CreateBook,
  GetBooksQuery,
  GetMyBooksQuery,
} from "@validations/books.validation.js";
import {
  existsDBEduLevelById,
  getDBBooksByStudent,
  getDBBooksWithFilters,
  insertDBBook,
} from "./books.repository.js";
import { getDBStatusStudent } from "@modules/students/student.repository.js";
import { getDBCampusById } from "@modules/saved_campuses/saved_campuses.repository.js";
import { AppError } from "@utils/AppError.js";
import { BOOK_STATUSES } from "@typedefs/books.type.js";
import { StatusCodes } from "http-status-codes";

export async function getBooksService(filters: GetBooksQuery) {
  // everyone (logged in or not) can only see active books of non-suspended students
  return await getDBBooksWithFilters(filters, ["active"], true);
}

export async function getAdminBooksService(filters: GetBooksQuery) {
  // admins see every book except drafts, including suspended students' books
  const visibleStatuses = BOOK_STATUSES.filter((status) => status !== "draft");
  return await getDBBooksWithFilters(filters, visibleStatuses, false);
}

export async function getMyBooksService(
  studentId: number,
  filters: GetMyBooksQuery,
) {
  const statusRes = await getDBStatusStudent(studentId);
  if (!statusRes.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
  if (statusRes.rows[0]!.status === "suspended") {
    throw new AppError(StatusCodes.FORBIDDEN, "Student is suspended");
  }
  // students see all of their own books, drafts & restricted included
  return await getDBBooksByStudent(studentId, filters);
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
