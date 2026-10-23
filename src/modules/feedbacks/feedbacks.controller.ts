import type { RequestHandler } from "express";
import { withAuthAdmin } from "../../utils/asyncAuth.js";
import { asyncHandler } from "../../utils/asyncHanlder.js";

export const getAllFeedbacks: RequestHandler = withAuthAdmin(
  async (req, res) => {},
);

export const getSingleFeedback: RequestHandler = withAuthAdmin(
  async (req, res) => {},
);

export const postAddFeedbacks: RequestHandler = asyncHandler(
  async (req, res) => {},
);

export const postUpdateFeedbackStatus: RequestHandler = withAuthAdmin(
  async (req, res) => {},
);
