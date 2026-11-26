export const BOOK_TYPES = [
  "class_book",
  "easy_book",
  "suggestion_and_question_bank",
] as const;
export type BookType = (typeof BOOK_TYPES)[number];

export const BOOK_CONDITIONS = ["like_new", "normal", "written_on"] as const;
export type BookCondition = (typeof BOOK_CONDITIONS)[number];

export const BOOK_STATUSES = [
  "active",
  "draft",
  "sold_out",
  "archived",
  "restricted",
] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export type Book = {
  id: number;
  image_key: string;
  title: string;
  author: string;
  posted_by: number;
  edu_level_id: number;
  book_type: BookType;
  publication: string;
  paper_code: number;
  condition: BookCondition;
  original_price: number;
  selling_price: number;
  is_negotiable: boolean;
  publication_year: number;
  status: BookStatus;
  description: string | null;
  meeting_campus_id: number;
  contact_no: string;
  restricted_by: number | null;
  restricted_reason: string | null;
  restricted_at: string | null;
  created_at: string;
};
