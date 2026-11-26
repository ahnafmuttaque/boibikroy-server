import {
  ReportStatusParamSchema,
  type GetMyReportsQuery,
  type GetReportsQuery,
} from "@validations/reports.validation.js";
import { AppError } from "@utils/AppError.js";
import type { Request, Response } from "express";
import { ApiResponse, PaginatedResponse } from "@utils/ApiResponse.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import {
  createReportService,
  getMyReportsService,
  getReportByIdService,
  getReportsService,
  updateReportStatusService,
} from "./reports.service.js";
import { getPositiveNumber } from "@validations/number.validation.js";

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.query as any as GetReportsQuery;
  const { reports, ...pagination } = await getReportsService(filters);
  new PaginatedResponse(StatusCodes.OK, reports, pagination).send(res);
});

export const getMyReports = asyncHandler(
  async (req: Request, res: Response) => {
    const reporterId = req.user!.id;
    const filters = req.query as any as GetMyReportsQuery;
    const { reports, ...pagination } = await getMyReportsService(
      reporterId,
      filters,
    );
    new PaginatedResponse(StatusCodes.OK, reports, pagination).send(res);
  },
);

export const getReportById = asyncHandler(
  async (req: Request, res: Response) => {
    const idStr = req.params.id;
    const reportId = getPositiveNumber(idStr);
    const report = await getReportByIdService(reportId);
    new ApiResponse(StatusCodes.OK, report).send(res);
  },
);

export const postReportStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const idStr = req.params.id;
    const reportId = getPositiveNumber(idStr);
    const statusResult = ReportStatusParamSchema.safeParse(req.params.status);
    if (!statusResult.success) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        statusResult.error.issues[0]!.message,
      );
    }
    const adminId = req.user!.id;
    await updateReportStatusService(reportId, adminId, statusResult.data);
    new ApiResponse(StatusCodes.OK, {
      message: "Report status updated successfully",
    }).send(res);
  },
);

export const postReports = asyncHandler(async (req, res) => {
  const reporterId = req.user!.id;
  const reportBody = req.body;
  const createdReport = await createReportService(reporterId, reportBody);
  new ApiResponse(StatusCodes.CREATED, createdReport).send(res);
});
