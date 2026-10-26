import type { RequestHandler } from "express";
import { withAuthAdmin } from "../../utils/asyncAuth.js";
import { asyncHandler } from "../../utils/asyncHanlder.js";
import type { PostFeedback } from "../../validations/feedbacks.validation.js";
import * as feedBackService from "./feedbacks.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";

export const getAllFeedbacks: RequestHandler = withAuthAdmin(
  async (req, res) => {},
);

export const getSingleFeedback: RequestHandler = withAuthAdmin(
  async (req, res) => {},
);

export const postAddFeedbacks: RequestHandler = asyncHandler(
  async (req, res) => {
    const feedBackBody: PostFeedback = req.body;
    const feedback = await feedBackService.addFeedback(feedBackBody);
    new ApiResponse(StatusCodes.CREATED, feedback).send(res);
  },
);

export const postUpdateFeedbackStatus: RequestHandler = withAuthAdmin(
  async (req, res) => {},
);
