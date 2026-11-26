import type { CreateBook } from "@validations/books.validation.js";
import type { Request, Response } from "express";
import { ApiResponse } from "@utils/ApiResponse.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { createBookService } from "./books.service.js";

export const postCreateBook = asyncHandler(
  async (req: Request, res: Response) => {
    const studentId = req.user!.id;
    const createBook: CreateBook = req.body;
    const book = await createBookService(studentId, createBook);
    new ApiResponse(StatusCodes.CREATED, book).send(res);
  },
);
