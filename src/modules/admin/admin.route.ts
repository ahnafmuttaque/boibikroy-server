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

router.use(validateJWt);

router.get(
  "/",
  validateRole("admin"),
  validateQueryWithSchema(GetAdminQuerySchema),
  getAllAdmins,
);
router.get("/:id", validateRole("admin"), getAdminById);

router.post(
  "/register",
  validateRole("admin"),
  validateBodyWithSchema(AdminRegisterSchema),
  postCreateAdmin,
);

router.post("/:id/suspend", validateRole("admin"), postSuspendAdmin);

router.patch(
  "/me",
  validateRole("admin", "moderator"),
  validateBodyWithSchema(AdminPatchSchema),
  patchAdmin,
);

router.delete("/:id", validateRole("admin"), deleteAdmin);

export default router;
