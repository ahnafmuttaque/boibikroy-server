import { Router } from "express";
import {
  postLoginAdmin,
  postLoginStudents,
  postLogout,
  postRegisterStudents,
  postUpdateAdminPassword,
  postUpdateStudentPassword,
} from "@modules/auth/auth.controller.js";
import {
  AdminLoginSchema,
  AdminUpdatePasswordSchema,
} from "@validations/admin.validation.js";
import { validateBodyWithSchema } from "@middlewares/validateSchema.middleware.js";
import {
  StudentLoginSchema,
  StudentRegisterSchema,
  StudentUpdatePasswordSchema,
} from "@validations/student.validation.js";
import { validateJWt } from "@middlewares/auth.middleware.js";
import { validateRole } from "@middlewares/validateRole.middleware.js";

const router = Router();

router.post(
  "/admin/login",
  validateBodyWithSchema(AdminLoginSchema),
  postLoginAdmin,
);

router.post(
  "/admin/me/update-password",
  validateJWt,
  validateRole("admin", "moderator"),
  validateBodyWithSchema(AdminUpdatePasswordSchema),
  postUpdateAdminPassword,
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

router.post(
  "/student/me/update-password",
  validateJWt,
  validateRole("student"),
  validateBodyWithSchema(StudentUpdatePasswordSchema),
  postUpdateStudentPassword,
);

router.post("/logout", postLogout);

export default router;
