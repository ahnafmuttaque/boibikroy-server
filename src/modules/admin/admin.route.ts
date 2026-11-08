import { Router } from "express";
import {
  deleteAdmin,
  getAdminById,
  getAllAdmins,
  patchAdmin,
  postCreateAdmin,
  postSuspendAdmin,
} from "@modules/admin/admin.controller.js";
import {
  validateBodyWithSchema,
  validateQueryWithSchema,
} from "@middlewares/validateSchema.middleware.js";
import {
  AdminPatchSchema,
  AdminRegisterSchema,
  GetAdminQuerySchema,
} from "@validations/admin.validation.js";
import { validateRole } from "@middlewares/validateRole.middleware.js";
import { validateJWt } from "@middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/",
  validateQueryWithSchema(GetAdminQuerySchema),
  validateJWt,
  validateRole("admin"),
  getAllAdmins,
);
router.get("/:id", validateJWt, validateRole("admin"), getAdminById);

router.post(
  "/register",
  validateBodyWithSchema(AdminRegisterSchema),
  validateJWt,
  validateRole("admin"),
  postCreateAdmin,
);

router.post(
  "/:id/suspend",
  validateJWt,
  validateRole("admin"),
  postSuspendAdmin,
);

router.patch(
  "/me",
  validateBodyWithSchema(AdminPatchSchema),
  validateJWt,
  validateRole("admin", "moderator"),
  patchAdmin,
);

router.delete("/:id", validateJWt, validateRole("admin"), deleteAdmin);

export default router;
