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

const router = Router();

router.use(validateJWt);

router.get("/", validateRole("admin", "moderator"), getStudents);

router.get("/:id", validateRole("admin", "moderator"), getStudentById);

router.post(
  "/:id/suspend",
  validateRole("admin", "moderator"),
  postSuspendStudent,
);

router.get("/me", validateRole("student"), getStudentSelf);

router.patch("/me", validateRole("student"), patchStudentSelf);

router.delete("/:id", validateRole("admin"), postDeleteStudents);

export default router;
