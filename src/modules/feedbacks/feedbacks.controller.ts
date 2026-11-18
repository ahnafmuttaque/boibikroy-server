import type {
  CreateFeedback,
  GetFeedbacksQuery,
  UpdateFeedbackStatus,
} from "@validations/feedbacks.validation.js";
import { asyncHandler } from "@utils/asyncHanlder.js";
import {
  addFeedbackService,
  getAllFeedbacksService,
  getFeedByIdService,
  updateFeedbackStatusService,
} from "./feedbacks.service.js";
import { ApiResponse, PaginatedResponse } from "@utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import { getPositiveNumberFromString } from "@validations/number.validation.js";

export const getAllFeedbacks = asyncHandler(async (req, res) => {
  const filters: GetFeedbacksQuery = req.query;
  const { feedbacks, pagination } = await getAllFeedbacksService(filters);
  new PaginatedResponse(StatusCodes.OK, feedbacks, pagination).send(res);
});

export const getSingleFeedback = asyncHandler(async (req, res) => {
  const idStr = req.params.id as string;
  const feedbackId = getPositiveNumberFromString(idStr);
  const feedback = await getFeedByIdService(feedbackId);
  new ApiResponse(StatusCodes.OK, feedback).send(res);
});

export const postAddFeedbacks = asyncHandler(async (req, res) => {
  const feedBackBody: CreateFeedback = req.body;
  const feedback = await addFeedbackService(feedBackBody);
  new ApiResponse(StatusCodes.CREATED, feedback).send(res);
});

export const patchUpdateFeedbackStatus = asyncHandler(async (req, res) => {
  const idStr = req.params.id as string;
  const feedbackId = getPositiveNumberFromString(idStr);
  const statusBody: UpdateFeedbackStatus = req.body;
  const updatedFeedback = await updateFeedbackStatusService(
    feedbackId,
    statusBody,
  );
  new ApiResponse(StatusCodes.OK, updatedFeedback).send(res);
});
