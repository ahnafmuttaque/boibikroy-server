import { Router } from "express";
import { postCreateAdmin } from "@modules/admin/admin.controller.js";
import validateBodyWithSchema from "@middlewares/validateSchema.middleware.js";
import { AdminRegisterSchema } from "@validations/admin.validation.js";
import { validateRole } from "@middlewares/validateRole.middleware.js";
import { validateJWt } from "@middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  validateBodyWithSchema(AdminRegisterSchema),
  validateJWt,
  validateRole("admin"),
  postCreateAdmin,
);

export default router;
