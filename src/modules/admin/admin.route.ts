import { Router } from "express";
import {
  getAdminById,
  patchAdmin,
  postCreateAdmin,
} from "@modules/admin/admin.controller.js";
import validateBodyWithSchema from "@middlewares/validateSchema.middleware.js";
import {AdminPatchSchema, AdminRegisterSchema} from "@validations/admin.validation.js";
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

router.get("/:id", validateJWt, validateRole("admin"), getAdminById);

router.patch("/", validateBodyWithSchema(AdminPatchSchema), validateJWt, validateRole("admin", "moderator"), patchAdmin);

export default router;
