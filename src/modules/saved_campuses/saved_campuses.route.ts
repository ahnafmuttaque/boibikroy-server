import { validateJWt } from "@middlewares/auth.middleware.js";
import { validateRole } from "@middlewares/validateRole.middleware.js";
import {
  validateBodyWithSchema,
  validateQueryWithSchema,
} from "@middlewares/validateSchema.middleware.js";
import {
  CreateSavedCampusSchema,
  DeleteCampusQuerySchema,
  UpdateSavedCampusSchema,
} from "@validations/saved_campuses.validation.js";
import { Router } from "express";
import {
  deleteCampusById,
  getAllCampuses,
  getAssociatedBooks,
  getCampusById,
  patchCampusById,
  postCreateSavedCampuses,
} from "./saved_campuese.controller.js";

const router = Router();

router.use(validateJWt, validateRole("student"));

router.post(
  "/",
  validateBodyWithSchema(CreateSavedCampusSchema),
  postCreateSavedCampuses,
);

router.get("/", getAllCampuses);

router.get("/:campus_id", getCampusById);

router.get("/:campus_id/books", getAssociatedBooks);

router.patch(
  "/:campus_id",
  validateBodyWithSchema(UpdateSavedCampusSchema),
  patchCampusById,
);

router.delete(
  "/:campus_id",
  validateQueryWithSchema(DeleteCampusQuerySchema),
  deleteCampusById,
);

export default router;
