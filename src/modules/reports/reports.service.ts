import type {
  CreateReport,
  GetMyReportsQuery,
  GetReportsQuery,
  ReportStatusParam,
} from "@validations/reports.validation.js";
import {
  createDBBookReport,
  createDBStudentReport,
  existsDBBookById,
  existsDBStudentById,
  getDBReportById,
  getDBReportsByReporter,
  getDBReportsWithFilters,
  getDBStatusReport,
  updateDBReportStatus,
} from "./reports.repository.js";
import { AppError } from "@utils/AppError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export async function getReportsService(filters: GetReportsQuery) {
  return await getDBReportsWithFilters(filters);
}

export async function getMyReportsService(
  reporterId: number,
  filters: GetMyReportsQuery,
) {
  return await getDBReportsByReporter(reporterId, filters);
}

export async function getReportByIdService(reportId: number) {
  const result = await getDBReportById(reportId);
  if (!result.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Report not found");
  }
  return result.rows[0]!;
}

export async function updateReportStatusService(
  reportId: number,
  adminId: number,
  status: ReportStatusParam,
) {
  const getResult = await getDBStatusReport(reportId);
  if (!getResult.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Report not found");
  }
  if (getResult.rows[0]!.status !== "pending") {
    throw new AppError(
      StatusCodes.CONFLICT,
      "only pending reports can be updated",
    );
  }
  const updateResult = await updateDBReportStatus(reportId, adminId, status);
  if (!updateResult.rowCount) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "only pending reports can be updated",
    );
  }
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
    const createRes = await createDBStudentReport(
      reporterId,
      student_id,
      reason,
    );
    return createRes.rows[0]!;
  }
  throw new AppError(
    StatusCodes.INTERNAL_SERVER_ERROR,
    ReasonPhrases.INTERNAL_SERVER_ERROR,
  );
};
