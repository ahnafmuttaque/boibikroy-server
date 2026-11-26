import { Router } from "express";
import { postCreateBook } from "./books.controller.js";
import { validateJWt } from "@middlewares/auth.middleware.js";
import { validateRole } from "@middlewares/validateRole.middleware.js";
import { validateBodyWithSchema } from "@middlewares/validateSchema.middleware.js";
import { CreateBookSchema } from "@validations/books.validation.js";

const router = Router();

router.use(validateJWt);

router.post(
  "/",
  validateRole("student"),
  validateBodyWithSchema(CreateBookSchema),
  postCreateBook,
);

export default router;
