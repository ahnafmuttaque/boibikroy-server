import type { GetCollegesQuery } from "@validations/colleges.validation.js";
import type { Request, Response } from "express";
import { ApiResponse, PaginatedResponse } from "@utils/ApiResponse.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { getPositiveNumber } from "@validations/number.validation.js";
import {
  getCollegeByIdService,
  getCollegesService,
} from "./colleges.service.js";

export const getColleges = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.query as any as GetCollegesQuery;
  const { colleges, ...pagination } = await getCollegesService(filters);
  new PaginatedResponse(StatusCodes.OK, colleges, pagination).send(res);
});

export const getCollegeById = asyncHandler(
  async (req: Request, res: Response) => {
    const idStr = req.params.id;
    const collegeId = getPositiveNumber(idStr);
    const college = await getCollegeByIdService(collegeId);
    new ApiResponse(StatusCodes.OK, college).send(res);
  },
);
