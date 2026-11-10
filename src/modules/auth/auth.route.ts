import { Router } from "express";
import {
  postLoginAdmin,
  postLoginStudents,
  postLogout,
  postRegisterStudents,
} from "@modules/auth/auth.controller.js";
import { AdminLoginSchema } from "@validations/admin.validation.js";
import { validateBodyWithSchema } from "@middlewares/validateSchema.middleware.js";
import {
  StudentLoginSchema,
  StudentRegisterSchema,
} from "@validations/student.validation.js";

const router = Router();

router.post(
  "/admin/login",
  validateBodyWithSchema(AdminLoginSchema),
  postLoginAdmin,
);

router.post(
  "/student/register",
  validateBodyWithSchema(StudentRegisterSchema),
  postRegisterStudents,
);

router.post(
  "/student/login",
  validateBodyWithSchema(StudentLoginSchema),
  postLoginStudents,
);

router.post("/logout", postLogout);

export default router;
