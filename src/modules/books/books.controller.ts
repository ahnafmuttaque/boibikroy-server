import type {
  CreateBook,
  GetBooksQuery,
} from "@validations/books.validation.js";
import type { Request, Response } from "express";
import { ApiResponse, PaginatedResponse } from "@utils/ApiResponse.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { createBookService, getBooksService } from "./books.service.js";

export const getBooks = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.query as any as GetBooksQuery;
  const { books, ...pagination } = await getBooksService(filters);
  new PaginatedResponse(StatusCodes.OK, books, pagination).send(res);
});

export const postCreateBook = asyncHandler(
  async (req: Request, res: Response) => {
    const studentId = req.user!.id;
    const createBook: CreateBook = req.body;
    const book = await createBookService(studentId, createBook);
    new ApiResponse(StatusCodes.CREATED, book).send(res);
  },
);
