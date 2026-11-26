import type {
  CreateReport,
  GetReportsQuery,
} from "@validations/reports.validation.js";
import {
  createDBBookReport,
  createDBStudentReport,
  existsDBBookById,
  existsDBStudentById,
  getDBReportsWithFilters,
} from "./reports.repository.js";
import { AppError } from "@utils/AppError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export async function getReportsService(filters: GetReportsQuery) {
  return await getDBReportsWithFilters(filters);
}

export const createReportService = async (
  reporterId: number,
  reportBody: CreateReport,
) => {
  const { type, book_id, student_id, reason } = reportBody;
  if (type === "book" && book_id) {
    const getBookRes = await existsDBBookById(book_id);
    if (!getBookRes.rows.length) {
      throw new AppError(StatusCodes.NOT_FOUND, "Book not found");
    }
    const reportedBook = getBookRes.rows[0]!;
    if (reportedBook.posted_by === reporterId) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "you can't report your own book",
      );
    }
    const createRes = await createDBBookReport(reporterId, book_id, reason);
    return createRes.rows[0]!;
  }
  if (type === "student" && student_id) {
    if (reporterId === student_id) {
      throw new AppError(StatusCodes.BAD_REQUEST, "you can't report yourself");
    }
    const existStudentRes = await existsDBStudentById(student_id);
    if (!existStudentRes.rows[0]!.student_exists) {
      throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
    }
    const createRes = await createDBStudentReport(reporterId, student_id, reason);
    return createRes.rows[0]!;
  }
  throw new AppError(
    StatusCodes.INTERNAL_SERVER_ERROR,
    ReasonPhrases.INTERNAL_SERVER_ERROR,
  );
};
