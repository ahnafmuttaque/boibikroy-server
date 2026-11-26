import type { GetReportsQuery } from "@validations/reports.validation.js";
import type { Request, Response } from "express";
import { ApiResponse, PaginatedResponse } from "@utils/ApiResponse.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { createReportService, getReportsService } from "./reports.service.js";

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.query as any as GetReportsQuery;
  const { reports, ...pagination } = await getReportsService(filters);
  new PaginatedResponse(StatusCodes.OK, reports, pagination).send(res);
});

export const postReports = asyncHandler(async (req, res) => {
  const reporterId = req.user!.id;
  const reportBody = req.body;
  const createdReport = await createReportService(reporterId, reportBody);
  new ApiResponse(StatusCodes.CREATED, createdReport).send(res);
});
