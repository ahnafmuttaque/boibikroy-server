import { Router } from "express";
import {
  getAllFeedbacks,
  getSingleFeedback,
  postAddFeedbacks,
  patchUpdateFeedbackStatus,
} from "@modules/feedbacks/feedbacks.controller.js";
import {
  CreateFeedbackSchema,
  GetFeedbacksQuerySchema,
  UpdateFeedbackStatusSchema,
} from "@validations/feedbacks.validation.js";
import {
  validateBodyWithSchema,
  validateQueryWithSchema,
} from "@middlewares/validateSchema.middleware.js";
import { validateJWt } from "@middlewares/auth.middleware.js";
import { validateRole } from "@middlewares/validateRole.middleware.js";

const router = Router();

router.post(
  "/",
  validateBodyWithSchema(CreateFeedbackSchema),
  postAddFeedbacks,
);

router.use(validateJWt, validateRole("admin", "moderator"));

router.get(
  "/",
  validateQueryWithSchema(GetFeedbacksQuerySchema),
  getAllFeedbacks,
);

router.get("/:id", getSingleFeedback);

router.patch(
  "/:id",
  validateBodyWithSchema(UpdateFeedbackStatusSchema),
  patchUpdateFeedbackStatus,
);

export default router;
