import type { Request, Response } from "express";
import { ApiResponse } from "@utils/ApiResponse.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { getEducationLevelsService } from "./education_levels.service.js";

export const getEducationLevels = asyncHandler(
  async (req: Request, res: Response) => {
    const educationLevels = await getEducationLevelsService();
    new ApiResponse(StatusCodes.OK, educationLevels).send(res);
  },
);
