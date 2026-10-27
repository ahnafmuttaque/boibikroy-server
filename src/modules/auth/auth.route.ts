import { Router } from "express";
import { postCreateAdmin, postLoginAdmin } from "./auth.controller.js";
import {
  AdminLoginSchema,
  AdminRegisterSchema,
} from "@/validations/admin.validation.js";
import validateBodyWithSchema from "@/middlewares/validateSchema.middleware.js";

const router = Router();

router.post(
  "/admin/register",
  validateBodyWithSchema(AdminRegisterSchema),
  postCreateAdmin,
);

router.post(
  "/admin/login",
  validateBodyWithSchema(AdminLoginSchema),
  postLoginAdmin,
);

export default router;
