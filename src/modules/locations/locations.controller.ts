import type {
  GetDistrictsQuery,
  GetUpazilasQuery,
} from "@validations/locations.validation.js";
import type { Request, Response } from "express";
import { ApiResponse } from "@utils/ApiResponse.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import {
  getDistrictsService,
  getDivisionsService,
  getUpazilasService,
} from "./locations.service.js";

export const getDivisions = asyncHandler(
  async (req: Request, res: Response) => {
    const divisions = await getDivisionsService();
    new ApiResponse(StatusCodes.OK, divisions).send(res);
  },
);

export const getDistricts = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = req.query as any as GetDistrictsQuery;
    const districts = await getDistrictsService(filters);
    new ApiResponse(StatusCodes.OK, districts).send(res);
  },
);

export const getUpazilas = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.query as any as GetUpazilasQuery;
  const upazilas = await getUpazilasService(filters);
  new ApiResponse(StatusCodes.OK, upazilas).send(res);
});
