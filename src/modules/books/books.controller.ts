import type {
  CreateBook,
  GetBooksQuery,
  GetMyBooksQuery,
} from "@validations/books.validation.js";
import type { Request, Response } from "express";
import { ApiResponse, PaginatedResponse } from "@utils/ApiResponse.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { getPositiveNumber } from "@validations/number.validation.js";
import {
  createBookService,
  getAdminBooksService,
  getBookByIdService,
  getBooksService,
  getMyBooksService,
} from "./books.service.js";

export const getBooks = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.query as any as GetBooksQuery;
  const { books, ...pagination } = await getBooksService(filters);
  new PaginatedResponse(StatusCodes.OK, books, pagination).send(res);
});

export const getAdminBooks = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = req.query as any as GetBooksQuery;
    const { books, ...pagination } = await getAdminBooksService(filters);
    new PaginatedResponse(StatusCodes.OK, books, pagination).send(res);
  },
);

export const getMyBooks = asyncHandler(async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const filters = req.query as any as GetMyBooksQuery;
  const { books, ...pagination } = await getMyBooksService(studentId, filters);
  new PaginatedResponse(StatusCodes.OK, books, pagination).send(res);
});

export const getBookById = asyncHandler(async (req: Request, res: Response) => {
  const idStr = req.params.id;
  const bookId = getPositiveNumber(idStr);
  const book = await getBookByIdService(bookId, req.user!);
  new ApiResponse(StatusCodes.OK, book).send(res);
});

export const postCreateBook = asyncHandler(
  async (req: Request, res: Response) => {
    const studentId = req.user!.id;
    const createBook: CreateBook = req.body;
    const book = await createBookService(studentId, createBook);
    new ApiResponse(StatusCodes.CREATED, book).send(res);
  },
);
