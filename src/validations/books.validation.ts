import * as z from "zod";
import {
  BOOK_CONDITIONS,
  BOOK_STATUSES,
  BOOK_TYPES,
} from "@typedefs/books.type.js";

const BD_PHONE_REGEX = /^\+880[0-9]{10}$/;

// field rules shared by create & patch
const bookFields = {
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
  book_type: z.enum(
    BOOK_TYPES,
    "Book type must be 'class_book', 'easy_book' or 'suggestion_and_question_bank'",
  ),
  publication: z
    .string({ message: "Publication is required" })
    .trim()
    .min(2, "Publication must be at least 2 characters")
    .max(200, "Publication must be at most 200 characters"),
  paper_code: z
    .number({ message: "Paper code is required" })
    .int("Paper code must be an integer")
    .positive("Paper code must be a positive integer"),
  condition: z.enum(
    BOOK_CONDITIONS,
    "Condition must be 'like_new', 'normal' or 'written_on'",
  ),
  original_price: z
    .number({ message: "Original price is required" })
    .int("Original price must be an integer")
    .positive("Original price must be a positive integer"),
  selling_price: z
    .number({ message: "Selling price is required" })
    .int("Selling price must be an integer")
    .positive("Selling price must be a positive integer"),
  is_negotiable: z.boolean("is_negotiable must be true or false"),
  publication_year: z
    .number({ message: "Publication year is required" })
    .int("Publication year must be an integer")
    .positive("Publication year must be a positive integer")
    .refine(
      (year) => year <= new Date().getFullYear(),
      "Publication year can't be in the future",
    ),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters"),
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
    ),
};

export const CreateBookSchema = z
  .object({
    image_key: bookFields.image_key,
    title: bookFields.title,
    author: bookFields.author,
    edu_level_id: bookFields.edu_level_id,
    book_type: bookFields.book_type.default("class_book"),
    publication: bookFields.publication,
    paper_code: bookFields.paper_code,
    condition: bookFields.condition.default("normal"),
    original_price: bookFields.original_price,
    selling_price: bookFields.selling_price,
    is_negotiable: bookFields.is_negotiable.default(true),
    publication_year: bookFields.publication_year,
    status: z
      .enum(["active", "draft"], "Status can only be 'active' or 'draft'")
      .default("active"),
    description: bookFields.description.optional(),
    meeting_campus_id: bookFields.meeting_campus_id,
    contact_no: bookFields.contact_no.optional(),
  })
  .refine((data) => data.selling_price <= data.original_price, {
    message: "Selling price can't be greater than original price",
    path: ["selling_price"],
  });

// students can't set a book to draft or restricted
export const PATCHABLE_BOOK_STATUSES = [
  "active",
  "sold_out",
  "archived",
] as const;

export const PatchBookSchema = z
  .object({
    image_key: bookFields.image_key.optional(),
    title: bookFields.title.optional(),
    author: bookFields.author.optional(),
    edu_level_id: bookFields.edu_level_id.optional(),
    book_type: bookFields.book_type.optional(),
    publication: bookFields.publication.optional(),
    paper_code: bookFields.paper_code.optional(),
    condition: bookFields.condition.optional(),
    original_price: bookFields.original_price.optional(),
    selling_price: bookFields.selling_price.optional(),
    is_negotiable: bookFields.is_negotiable.optional(),
    publication_year: bookFields.publication_year.optional(),
    status: z
      .enum(
        PATCHABLE_BOOK_STATUSES,
        "Status can only be 'active', 'sold_out' or 'archived'",
      )
      .optional(),
    description: bookFields.description.nullable().optional(),
    meeting_campus_id: bookFields.meeting_campus_id.optional(),
    contact_no: bookFields.contact_no.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided to update",
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

export const AdminBookStatusParamSchema = z.enum(["restricted", "draft"], {
  message: "Status param must be 'restricted' or 'draft'",
});

export const RestrictBookSchema = z.object({
  restricted_reason: z
    .string({ message: "Restricted reason is required" })
    .trim()
    .min(10, "Restricted reason must be at least 10 characters")
    .max(500, "Restricted reason must be at most 500 characters"),
});

export type CreateBook = z.infer<typeof CreateBookSchema>;
export type AdminBookStatusParam = z.infer<typeof AdminBookStatusParamSchema>;
export type RestrictBook = z.infer<typeof RestrictBookSchema>;
export type PatchBook = z.infer<typeof PatchBookSchema>;
export type GetMyBooksQuery = z.infer<typeof GetMyBooksQuerySchema>;
export type GetBooksQuery = z.infer<typeof GetBooksQuerySchema>;
