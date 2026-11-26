import db from "@config/db.config.js";
import type { Book } from "@typedefs/books.type.js";
import type { CreateBook } from "@validations/books.validation.js";

export const existsDBEduLevelById = async (eduLevelId: number) => {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM education_levels
        WHERE id = $1
  ) AS edu_level_exists;
`;
  return db.query<{ edu_level_exists: boolean }>(query, [eduLevelId]);
};

export const insertDBBook = async (studentId: number, createBook: CreateBook) => {
  const {
    image_key,
    title,
    author,
    edu_level_id,
    book_type,
    publication,
    paper_code,
    condition,
    original_price,
    selling_price,
    is_negotiable,
    publication_year,
    status,
    description,
    meeting_campus_id,
    contact_no,
  } = createBook;

  // contact_no falls back to the student's own contact no
  const query = `
    INSERT INTO books
      (image_key, title, author, posted_by, edu_level_id, book_type,
      publication, paper_code, condition, original_price, selling_price,
      is_negotiable, publication_year, status, description, meeting_campus_id, contact_no)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
      COALESCE($17, (SELECT contact_no FROM students WHERE id = $4)))
    RETURNING *;
`;

  return db.query<Book>(query, [
    image_key,
    title,
    author,
    studentId,
    edu_level_id,
    book_type,
    publication,
    paper_code,
    condition,
    original_price,
    selling_price,
    is_negotiable,
    publication_year,
    status,
    description ?? null,
    meeting_campus_id,
    contact_no ?? null,
  ]);
};
