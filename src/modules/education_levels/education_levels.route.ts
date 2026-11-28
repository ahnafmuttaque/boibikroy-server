import { Router } from "express";
import { getEducationLevels } from "./education_levels.controller.js";

const router = Router();

// public: anyone, logged in or not
router.get("/", getEducationLevels);

export default router;
