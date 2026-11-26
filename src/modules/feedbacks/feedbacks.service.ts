import type {
  CreateFeedback,
  GetFeedbacksQuery,
  UpdateFeedbackStatus,
} from "@validations/feedbacks.validation.js";
import {
  createDBFeedback,
  getDBFeedbackById,
  getDBFeedbacks,
  updateDBFeedbackStatus,
} from "./feedbacks.repository.js";
import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";

export const addFeedbackService = async (createFeedback: CreateFeedback) => {
  const createResult = await createDBFeedback(createFeedback);
  return createResult.rows[0]!;
};

export const getAllFeedbacksService = async (filters: GetFeedbacksQuery) => {
  return await getDBFeedbacks(filters);
};

export const getFeedByIdService = async (feedbackId: number) => {
  const result = await getDBFeedbackById(feedbackId);
  if (!result.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "feedback not found");
  }
  return result.rows[0]!;
};

export const updateFeedbackStatusService = async (
  feedbackId: number,
  adminId: number,
  statusBody: UpdateFeedbackStatus,
) => {
  const getFdRes = await getDBFeedbackById(feedbackId);
  if (!getFdRes.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "feedback not found");
  }
  const feedback = getFdRes.rows[0]!;
  if (feedback.status !== "pending") {
    throw new AppError(
      StatusCodes.CONFLICT,
      "feedback status is already updated",
    );
  }
  const updateRes = await updateDBFeedbackStatus(
    feedbackId,
    adminId,
    statusBody,
  );
  // another admin updated it between the check & the update
  if (!updateRes.rows.length) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "feedback status is already updated",
    );
  }
  return updateRes.rows[0]!;
};
