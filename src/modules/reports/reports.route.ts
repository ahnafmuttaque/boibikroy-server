import { Router } from "express";
import {
  getMyReports,
  getReports,
  postReports,
} from "./reports.controller.js";
import { validateJWt } from "@middlewares/auth.middleware.js";
import { validateRole } from "@middlewares/validateRole.middleware.js";
import {
  validateBodyWithSchema,
  validateQueryWithSchema,
} from "@middlewares/validateSchema.middleware.js";
import {
  CreateReportSchema,
  GetMyReportsQuerySchema,
  GetReportsQuerySchema,
} from "@validations/reports.validation.js";

const router = Router();

router.use(validateJWt);

router.get(
  "/",
  validateRole("admin", "moderator"),
  validateQueryWithSchema(GetReportsQuerySchema),
  getReports,
);

router.get(
  "/me",
  validateRole("student"),
  validateQueryWithSchema(GetMyReportsQuerySchema),
  getMyReports,
);

router.post(
  "/",
  validateRole("student"),
  validateBodyWithSchema(CreateReportSchema),
  postReports,
);

export default router;
