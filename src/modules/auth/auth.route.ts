import { Router } from "express";
import {  postLoginAdmin } from "@modules/auth/auth.controller.js";
import {
  AdminLoginSchema,
  AdminRegisterSchema,
} from "@validations/admin.validation.js";
import validateBodyWithSchema from "@middlewares/validateSchema.middleware.js";

const router = Router();

router.post(
  "/admin/register",
  validateBodyWithSchema(AdminRegisterSchema),
);

router.post(
  "/admin/login",
  validateBodyWithSchema(AdminLoginSchema),
  postLoginAdmin,
);

export default router;
