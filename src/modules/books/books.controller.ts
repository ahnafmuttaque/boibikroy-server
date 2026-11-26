import {
  AdminBookStatusParamSchema,
  RestrictBookSchema,
} from "@validations/books.validation.js";
import { AppError } from "@utils/AppError.js";
import type {
  CreateBook,
  GetBooksQuery,
  GetMyBooksQuery,
  PatchBook,
} from "@validations/books.validation.js";
import type { Request, Response } from "express";
import { ApiResponse, PaginatedResponse } from "@utils/ApiResponse.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { getPositiveNumber } from "@validations/number.validation.js";
import {
  createBookService,
  deleteBookService,
  getAdminBooksService,
  getBookByIdService,
  getBooksService,
  getMyBooksService,
  patchBookService,
  updateBookStatusByAdminService,
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

export const patchBookById = asyncHandler(
  async (req: Request, res: Response) => {
    const idStr = req.params.id;
    const bookId = getPositiveNumber(idStr);
    const studentId = req.user!.id;
    const patchBody: PatchBook = req.body;
    const book = await patchBookService(bookId, studentId, patchBody);
    new ApiResponse(StatusCodes.OK, book).send(res);
  },
);

export const deleteBookById = asyncHandler(
  async (req: Request, res: Response) => {
    const idStr = req.params.id;
    const bookId = getPositiveNumber(idStr);
    const studentId = req.user!.id;
    await deleteBookService(bookId, studentId);
    new ApiResponse(StatusCodes.NO_CONTENT).send(res);
  },
);

export const postBookStatusByAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const idStr = req.params.id;
    const bookId = getPositiveNumber(idStr);
    const statusResult = AdminBookStatusParamSchema.safeParse(
      req.params.status,
    );
    if (!statusResult.success) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        statusResult.error.issues[0]!.message,
      );
    }
    const status = statusResult.data;
    const adminId = req.user!.id;

    // a reason is required only when restricting
    let reason: string | undefined;
    if (status === "restricted") {
      const bodyResult = RestrictBookSchema.safeParse(req.body ?? {});
      if (!bodyResult.success) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          bodyResult.error.issues[0]!.message,
        );
      }
      reason = bodyResult.data.restricted_reason;
    }

    await updateBookStatusByAdminService(bookId, adminId, status, reason);
    new ApiResponse(StatusCodes.OK, {
      message:
        status === "restricted"
          ? "Book restricted successfully"
          : "Book moved to draft successfully",
    }).send(res);
  },
);

export const postCreateBook = asyncHandler(
  async (req: Request, res: Response) => {
    const studentId = req.user!.id;
    const createBook: CreateBook = req.body;
    const book = await createBookService(studentId, createBook);
    new ApiResponse(StatusCodes.CREATED, book).send(res);
  },
);
