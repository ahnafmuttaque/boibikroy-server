import { Router } from "express";
import {
  getAllFeedbacks,
  getSingleFeedback,
  postAddFeedbacks,
  postUpdateFeedbackStatus,
} from "./feedbacks.controller.js";
import { PostFeedbackSchema } from "@validations/feedbacks.validation.js";
import validateBodyWithSchema from "@middlewares/validateSchema.middleware.js";

const router = Router();

router.get("/feedbacks", getAllFeedbacks);

router.get("/feedbacks/:id", getSingleFeedback);

router.post(
  "/feedbacks",
  validateBodyWithSchema(PostFeedbackSchema),
  postAddFeedbacks,
);

router.post("/feedbacks/:id", postUpdateFeedbackStatus);

export default router;
