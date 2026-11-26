import type {
  CreateBook,
  GetBooksQuery,
  GetMyBooksQuery,
  PatchBook,
} from "@validations/books.validation.js";
import {
  existsDBEduLevelById,
  getDBBookById,
  getDBBooksByStudent,
  getDBBooksWithFilters,
  getDBShortBookById,
  insertDBBook,
  patchDBBookById,
} from "./books.repository.js";
import { getDBStatusStudent } from "@modules/students/student.repository.js";
import { getDBCampusById } from "@modules/saved_campuses/saved_campuses.repository.js";
import { AppError } from "@utils/AppError.js";
import { BOOK_STATUSES, type BookStatus } from "@typedefs/books.type.js";
import { StatusCodes } from "http-status-codes";

const activeStudentCheck = async (studentId: number) => {
  const statusRes = await getDBStatusStudent(studentId);
  if (!statusRes.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
  if (statusRes.rows[0]!.status === "suspended") {
    throw new AppError(StatusCodes.FORBIDDEN, "Student is suspended");
  }
};

const eduLevelCheck = async (eduLevelId: number) => {
  const eduLevelRes = await existsDBEduLevelById(eduLevelId);
  if (!eduLevelRes.rows[0]!.edu_level_exists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid education level id");
  }
};

// meeting campus must be one of the student's own saved campuses
const meetingCampusCheck = async (studentId: number, campusId: number) => {
  const campusRes = await getDBCampusById(studentId, campusId);
  if (!campusRes.rows.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid meeting campus id");
  }
};

// which status a book must currently be in to move to the new status
const STATUS_TRANSITIONS: Record<
  NonNullable<PatchBook["status"]>,
  { from: BookStatus[]; message: string }
> = {
  active: {
    from: ["draft", "archived"],
    message: "only draft & archived books can be active",
  },
  sold_out: {
    from: ["active"],
    message: "only active books can be sold_out",
  },
  archived: {
    from: ["sold_out", "draft"],
    message: "only sold_out & draft books can be archived",
  },
};

export async function getBooksService(filters: GetBooksQuery) {
  // everyone (logged in or not) can only see active books of non-suspended students
  return await getDBBooksWithFilters(filters, ["active"], true);
}

export async function getAdminBooksService(filters: GetBooksQuery) {
  // admins see every book except drafts, including suspended students' books
  const visibleStatuses = BOOK_STATUSES.filter((status) => status !== "draft");
  return await getDBBooksWithFilters(filters, visibleStatuses, false);
}

export async function getMyBooksService(
  studentId: number,
  filters: GetMyBooksQuery,
) {
  await activeStudentCheck(studentId);
  // students see all of their own books, drafts & restricted included
  return await getDBBooksByStudent(studentId, filters);
}

export async function getBookByIdService(
  bookId: number,
  user: { id: number; role: "admin" | "moderator" | "student" },
) {
  const result = await getDBBookById(bookId);
  if (!result.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Book not found");
  }
  const { seller_status, restricted_by, restricted_admin_name, ...book } =
    result.rows[0]!;

  if (user.role === "admin" || user.role === "moderator") {
    // admins see every book except drafts
    if (book.status === "draft") {
      throw new AppError(StatusCodes.NOT_FOUND, "Book not found");
    }
    return { ...book, restricted_by, restricted_admin_name };
  }

  // students see their own books in any status,
  // and other students' books only when they are active & the seller isn't suspended
  const isOwner = book.posted_by === user.id;
  if (!isOwner && (book.status !== "active" || seller_status === "suspended")) {
    throw new AppError(StatusCodes.NOT_FOUND, "Book not found");
  }
  return book;
}

export const createBookService = async (
  studentId: number,
  createBook: CreateBook,
) => {
  await activeStudentCheck(studentId);
  await eduLevelCheck(createBook.edu_level_id);
  await meetingCampusCheck(studentId, createBook.meeting_campus_id);

  const insertedRes = await insertDBBook(studentId, createBook);
  return insertedRes.rows[0]!;
};

export async function patchBookService(
  bookId: number,
  studentId: number,
  patchBody: PatchBook,
) {
  await activeStudentCheck(studentId);

  const bookRes = await getDBShortBookById(bookId);
  // other students' books are reported as not found
  if (!bookRes.rows.length || bookRes.rows[0]!.posted_by !== studentId) {
    throw new AppError(StatusCodes.NOT_FOUND, "Book not found");
  }
  const book = bookRes.rows[0]!;

  if (book.status === "restricted") {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "restricted books can't be updated",
    );
  }

  if (patchBody.status) {
    const transition = STATUS_TRANSITIONS[patchBody.status];
    if (!transition.from.includes(book.status)) {
      throw new AppError(StatusCodes.CONFLICT, transition.message);
    }
  }

  // compare against the stored price when only one of them is sent
  const originalPrice = patchBody.original_price ?? book.original_price;
  const sellingPrice = patchBody.selling_price ?? book.selling_price;
  if (sellingPrice > originalPrice) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Selling price can't be greater than original price",
    );
  }

  if (patchBody.edu_level_id !== undefined) {
    await eduLevelCheck(patchBody.edu_level_id);
  }
  if (patchBody.meeting_campus_id !== undefined) {
    await meetingCampusCheck(studentId, patchBody.meeting_campus_id);
  }

  const patchResult = await patchDBBookById(
    bookId,
    studentId,
    book.status,
    patchBody,
  );
  if (!patchResult.rowCount) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "book was changed meanwhile, please try again",
    );
  }
  return patchResult.rows[0]!;
}
