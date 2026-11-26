import { Router } from "express";
import {
  getAdminBooks,
  getBooks,
  getMyBooks,
  postCreateBook,
} from "./books.controller.js";
import { validateJWt } from "@middlewares/auth.middleware.js";
import { validateRole } from "@middlewares/validateRole.middleware.js";
import {
  validateBodyWithSchema,
  validateQueryWithSchema,
} from "@middlewares/validateSchema.middleware.js";
import {
  CreateBookSchema,
  GetBooksQuerySchema,
  GetMyBooksQuerySchema,
} from "@validations/books.validation.js";

const router = Router();

// public: anyone, logged in or not
router.get("/", validateQueryWithSchema(GetBooksQuerySchema), getBooks);

router.get(
  "/admin",
  validateJWt,
  validateRole("admin", "moderator"),
  validateQueryWithSchema(GetBooksQuerySchema),
  getAdminBooks,
);

router.get(
  "/me",
  validateJWt,
  validateRole("student"),
  validateQueryWithSchema(GetMyBooksQuerySchema),
  getMyBooks,
);

router.post(
  "/",
  validateJWt,
  validateRole("student"),
  validateBodyWithSchema(CreateBookSchema),
  postCreateBook,
);

export default router;
