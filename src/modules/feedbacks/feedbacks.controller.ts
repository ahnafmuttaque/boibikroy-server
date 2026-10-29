import type { RequestHandler } from "express";
import { withAuth } from "@/utils/asyncAuth.js";
import type { PostFeedback } from "@validations/feedbacks.validation.js";

import * as feedBackService from "./feedbacks.service.js";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@/utils/asyncHanlder.js";
import { ApiResponse } from "@/utils/ApiResponse.js";

export const getAllFeedbacks: RequestHandler = withAuth(async (req, res) => {});

export const getSingleFeedback: RequestHandler = withAuth(
  async (req, res) => {},
);

export const postAddFeedbacks: RequestHandler = asyncHandler(
  async (req, res) => {
    const feedBackBody: PostFeedback = req.body;
    const feedback = await feedBackService.addFeedback(feedBackBody);
    new ApiResponse(StatusCodes.CREATED, feedback).send(res);
  },
);

export const postUpdateFeedbackStatus: RequestHandler = withAuth(
  async (req, res) => {},
);
