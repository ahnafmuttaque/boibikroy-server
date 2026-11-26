import * as z from "zod";
import {
  BOOK_CONDITIONS,
  BOOK_STATUSES,
  BOOK_TYPES,
} from "@typedefs/books.type.js";

const BD_PHONE_REGEX = /^\+880[0-9]{10}$/;

export const CreateBookSchema = z
  .object({
    image_key: z
      .string({ message: "Image key is required" })
      .trim()
      .min(1, "Image key is required")
      .max(500, "Image key must be at most 500 characters"),
    title: z
      .string({ message: "Title is required" })
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(200, "Title must be at most 200 characters"),
    author: z
      .string({ message: "Author is required" })
      .trim()
      .min(2, "Author must be at least 2 characters")
      .max(200, "Author must be at most 200 characters"),
    edu_level_id: z
      .number({ message: "Education level ID is required" })
      .int("Education level ID must be an integer")
      .positive("Education level ID must be a positive integer"),
    book_type: z
      .enum(
        BOOK_TYPES,
        "Book type must be 'class_book', 'easy_book' or 'suggestion_and_question_bank'",
      )
      .default("class_book"),
    publication: z
      .string({ message: "Publication is required" })
      .trim()
      .min(2, "Publication must be at least 2 characters")
      .max(200, "Publication must be at most 200 characters"),
    paper_code: z
      .number({ message: "Paper code is required" })
      .int("Paper code must be an integer")
      .positive("Paper code must be a positive integer"),
    condition: z
      .enum(
        BOOK_CONDITIONS,
        "Condition must be 'like_new', 'normal' or 'written_on'",
      )
      .default("normal"),
    original_price: z
      .number({ message: "Original price is required" })
      .int("Original price must be an integer")
      .positive("Original price must be a positive integer"),
    selling_price: z
      .number({ message: "Selling price is required" })
      .int("Selling price must be an integer")
      .positive("Selling price must be a positive integer"),
    is_negotiable: z
      .boolean("is_negotiable must be true or false")
      .default(true),
    publication_year: z
      .number({ message: "Publication year is required" })
      .int("Publication year must be an integer")
      .positive("Publication year must be a positive integer")
      .refine(
        (year) => year <= new Date().getFullYear(),
        "Publication year can't be in the future",
      ),
    status: z
      .enum(["active", "draft"], "Status can only be 'active' or 'draft'")
      .default("active"),
    description: z
      .string()
      .trim()
      .max(1000, "Description must be at most 1000 characters")
      .optional(),
    meeting_campus_id: z
      .number({ message: "Meeting campus ID is required" })
      .int("Meeting campus ID must be an integer")
      .positive("Meeting campus ID must be a positive integer"),
    contact_no: z
      .string()
      .trim()
      .regex(
        BD_PHONE_REGEX,
        "Invalid Bangladeshi phone number (e.g. +8801XXXXXXXXX)",
      )
      .optional(),
  })
  .refine((data) => data.selling_price <= data.original_price, {
    message: "Selling price can't be greater than original price",
    path: ["selling_price"],
  });

export const GetBooksQuerySchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    author: z.string().trim().min(1).max(200).optional(),
    level: z.string().trim().min(1).max(100).optional(),
    department: z.string().trim().min(1).max(100).optional(),
    year: z
      .enum(
        ["1st", "2nd", "3rd", "4th"],
        "Year must be '1st', '2nd', '3rd' or '4th'",
      )
      .optional(),
    type: z
      .enum(
        BOOK_TYPES,
        "Type must be 'class_book', 'easy_book' or 'suggestion_and_question_bank'",
      )
      .optional(),
    publication: z.string().trim().min(1).max(200).optional(),
    papercode: z.coerce
      .number()
      .int()
      .positive("Paper code must be a positive integer")
      .optional(),
    condition: z
      .enum(
        BOOK_CONDITIONS,
        "Condition must be 'like_new', 'normal' or 'written_on'",
      )
      .optional(),
    price_min: z.coerce
      .number()
      .int()
      .positive("Minimum price must be a positive integer")
      .optional(),
    price_max: z.coerce
      .number()
      .int()
      .positive("Maximum price must be a positive integer")
      .optional(),
    isNegotiable: z
      .enum(["true", "false"], "isNegotiable must be 'true' or 'false'")
      .transform((value) => value === "true")
      .optional(),
    college: z.coerce
      .number()
      .int()
      .positive("Invalid college ID")
      .optional(),
    sortBy: z
      .enum(
        ["original_price", "selling_price"],
        "sortBy must be 'original_price' or 'selling_price'",
      )
      .optional(),
    sortOrder: z
      .enum(["asc", "desc"], "sortOrder must be 'asc' or 'desc'")
      .optional(),
    limit: z.coerce
      .number()
      .int()
      .positive("Limit must be a positive integer")
      .max(100, "Limit cannot exceed 100")
      .optional(),
    page: z.coerce
      .number()
      .int()
      .positive("Page must be a positive integer")
      .optional(),
  })
  .refine(
    (data) =>
      data.price_min === undefined ||
      data.price_max === undefined ||
      data.price_min <= data.price_max,
    {
      message: "Minimum price can't be greater than maximum price",
      path: ["price_min"],
    },
  );

export const GetMyBooksQuerySchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  status: z
    .enum(
      BOOK_STATUSES,
      "Status must be 'active', 'draft', 'sold_out', 'archived' or 'restricted'",
    )
    .optional(),
  type: z
    .enum(
      BOOK_TYPES,
      "Type must be 'class_book', 'easy_book' or 'suggestion_and_question_bank'",
    )
    .optional(),
  limit: z.coerce
    .number()
    .int()
    .positive("Limit must be a positive integer")
    .max(100, "Limit cannot exceed 100")
    .optional(),
  page: z.coerce
    .number()
    .int()
    .positive("Page must be a positive integer")
    .optional(),
});

export type CreateBook = z.infer<typeof CreateBookSchema>;
export type GetMyBooksQuery = z.infer<typeof GetMyBooksQuerySchema>;
export type GetBooksQuery = z.infer<typeof GetBooksQuerySchema>;
