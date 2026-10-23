import { Router } from "express";
import { getAllFeedbacks } from "./feedbacks.controller.js";

const router = Router();

router.get("/feedbacks", getAllFeedbacks);
