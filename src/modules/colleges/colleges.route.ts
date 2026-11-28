import { Router } from "express";
import { getCollegeById, getColleges } from "./colleges.controller.js";
import { validateQueryWithSchema } from "@middlewares/validateSchema.middleware.js";
import { GetCollegesQuerySchema } from "@validations/colleges.validation.js";

const router = Router();

// public: anyone, logged in or not
router.get("/", validateQueryWithSchema(GetCollegesQuerySchema), getColleges);

router.get("/:id", getCollegeById);

export default router;
