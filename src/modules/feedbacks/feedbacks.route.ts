import { Router } from "express";
import {
  getAllFeedbacks,
  getSingleFeedback,
  postAddFeedbacks,
  postUpdateFeedbackStatus,
} from "./feedbacks.controller.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import { FeedBack } from "../../validations/feedbacks.validation.js";

const router = Router();

router.get("/feedbacks", getAllFeedbacks);

router.get("/feedbacks/:id", getSingleFeedback);

router.post("/feedbacks", validationMiddleware(FeedBack), postAddFeedbacks);

router.post("/feedbacks/:id", postUpdateFeedbackStatus);

export default router;
