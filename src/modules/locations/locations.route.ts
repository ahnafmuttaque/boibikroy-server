import { Router } from "express";
import {
  getDistricts,
  getDivisions,
  getUpazilas,
} from "./locations.controller.js";
import { validateQueryWithSchema } from "@middlewares/validateSchema.middleware.js";
import {
  GetDistrictsQuerySchema,
  GetUpazilasQuerySchema,
} from "@validations/locations.validation.js";

const router = Router();

// public: anyone, logged in or not
router.get("/divisions", getDivisions);

router.get(
  "/districts",
  validateQueryWithSchema(GetDistrictsQuerySchema),
  getDistricts,
);

router.get(
  "/upazilas",
  validateQueryWithSchema(GetUpazilasQuerySchema),
  getUpazilas,
);

export default router;
