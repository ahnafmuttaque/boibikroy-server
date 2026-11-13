import { validateJWt } from "@middlewares/auth.middleware.js";
import { validateRole } from "@middlewares/validateRole.middleware.js";
import { Router } from "express";
import {
  postDeleteStudents,
  getStudents,
  getStudentById,
  postSuspendStudent,
  getStudentSelf,
  patchStudentSelf,
} from "./student.controller.js";
import {
  validateBodyWithSchema,
  validateQueryWithSchema,
} from "@middlewares/validateSchema.middleware.js";
import { GetStudentsQuerySchema } from "@validations/student.validation.js";

const router = Router();

router.use(validateJWt);

router.get(
  "/",
  validateRole("admin", "moderator"),
  validateQueryWithSchema(GetStudentsQuerySchema),
  getStudents,
);

router.get("/me", validateRole("student"), getStudentSelf);
router.patch("/me", validateRole("student"), patchStudentSelf);

router.get("/:id", validateRole("admin", "moderator"), getStudentById);

router.delete("/:id", validateRole("admin"), postDeleteStudents);

router.post(
  "/:id/suspend",
  validateRole("admin", "moderator"),
  postSuspendStudent,
);

export default router;
