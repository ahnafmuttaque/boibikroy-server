import db from "@config/db.config.js";
import type { Book, BookStatus } from "@typedefs/books.type.js";
import type {
  CreateBook,
  GetBooksQuery,
  GetMyBooksQuery,
} from "@validations/books.validation.js";

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

export async function getDBBookById(bookId: number) {
  const query = `
    SELECT
      b.id, b.image_key, b.title, b.author, b.posted_by,
      s.full_name AS seller_name, s.status AS seller_status,
      b.edu_level_id, CONCAT(e.name, ' ', e.department, ' ', e.year, ' year') AS level,
      b.book_type AS type, b.publication, b.paper_code, b.condition,
      b.original_price, b.selling_price, b.is_negotiable, b.publication_year,
      b.status, b.description,
      b.meeting_campus_id, sc.meeting_place, sc.college_id, c.name AS college_name,
      b.contact_no,
      b.restricted_by, a.full_name AS restricted_admin_name,
      b.restricted_reason, b.restricted_at,
      b.created_at
    FROM books AS b
        INNER JOIN students AS s ON b.posted_by = s.id
        LEFT JOIN education_levels AS e ON b.edu_level_id = e.id
        LEFT JOIN saved_campuses AS sc ON b.meeting_campus_id = sc.id
        LEFT JOIN colleges AS c ON sc.college_id = c.id
        LEFT JOIN admins AS a ON b.restricted_by = a.id
    WHERE b.id = $1;
   `;

  type Query = Omit<Book, "book_type"> & {
    type: Book["book_type"];
    seller_name: string;
    seller_status: string;
    level: string;
    meeting_place: string;
    college_id: number;
    college_name: string;
    restricted_admin_name: string | null;
  };

  return db.query<Query>(query, [bookId]);
}

export async function getDBBooksByStudent(
  studentId: number,
  filters: GetMyBooksQuery,
) {
  const { title, status, type, limit, page } = filters;
  // b for books
  // e for education_levels
  const values: Array<any> = [studentId];
  const fields: Array<any> = [`b.posted_by=$${values.length}`];

  if (title) {
    values.push(`%${title}%`);
    fields.push(`b.title ILIKE $${values.length}`);
  }

  if (status) {
    values.push(status);
    fields.push(`b.status=$${values.length}`);
  }

  if (type) {
    values.push(type);
    fields.push(`b.book_type=$${values.length}`);
  }

  const whereClause = `WHERE ${fields.join(" AND ")}`;

  const pageSize = limit ?? 10;
  const pageNumber = Math.max(1, page ?? 1);
  const offset = (pageNumber - 1) * pageSize;

  const query = `
  SELECT
    b.id, b.title,
    CONCAT(e.name, ' ', e.department, ' ', e.year, ' year') AS level,
    b.book_type AS type, b.selling_price, b.status, b.created_at,
    COUNT(*) OVER() AS total_count
  FROM books AS b
      LEFT JOIN education_levels AS e ON b.edu_level_id = e.id
      ${whereClause}
      ORDER BY b.created_at DESC, b.id DESC LIMIT ${pageSize} OFFSET ${offset}
    `;
  type Query = Pick<
    Book,
    "id" | "title" | "selling_price" | "status" | "created_at"
  > & {
    level: string;
    type: Book["book_type"];
    total_count: number;
  };

  const result = await db.query<Query>(query, values);
  const total =
    result.rows.length > 0 ? Number(result.rows[0]?.total_count) : 0;
  const books = result.rows.map(({ total_count, ...book }) => book);
  const totalPages = Math.ceil(total / pageSize);
  return {
    books,
    limit: pageSize,
    page: pageNumber,
    total,
    totalPages,
  };
}

export async function getDBBooksWithFilters(
  filters: GetBooksQuery,
  visibleStatuses: BookStatus[],
  hideSuspendedSellers: boolean,
) {
  const {
    title,
    author,
    level,
    department,
    year,
    type,
    publication,
    papercode,
    condition,
    price_min,
    price_max,
    isNegotiable,
    college,
    sortBy,
    sortOrder,
    limit,
    page,
  } = filters;
  // b for books
  // s for students (seller)
  // e for education_levels
  // sc for saved_campuses (meeting campus)
  const values: Array<any> = [visibleStatuses];
  const fields: Array<any> = [`b.status = ANY($${values.length})`];

  if (hideSuspendedSellers) {
    fields.push(`s.status <> 'suspended'`);
  }

  if (title) {
    values.push(`%${title}%`);
    fields.push(`b.title ILIKE $${values.length}`);
  }

  if (author) {
    values.push(`%${author}%`);
    fields.push(`b.author ILIKE $${values.length}`);
  }

  if (publication) {
    values.push(`%${publication}%`);
    fields.push(`b.publication ILIKE $${values.length}`);
  }

  if (level) {
    values.push(level);
    fields.push(`e.name ILIKE $${values.length}`);
  }

  if (department) {
    values.push(department);
    fields.push(`e.department ILIKE $${values.length}`);
  }

  if (year) {
    values.push(year);
    fields.push(`e.year=$${values.length}`);
  }

  if (type) {
    values.push(type);
    fields.push(`b.book_type=$${values.length}`);
  }

  if (papercode) {
    values.push(papercode);
    fields.push(`b.paper_code=$${values.length}`);
  }

  if (condition) {
    values.push(condition);
    fields.push(`b.condition=$${values.length}`);
  }

  if (price_min) {
    values.push(price_min);
    fields.push(`b.selling_price >= $${values.length}`);
  }

  if (price_max) {
    values.push(price_max);
    fields.push(`b.selling_price <= $${values.length}`);
  }

  if (isNegotiable !== undefined) {
    values.push(isNegotiable);
    fields.push(`b.is_negotiable=$${values.length}`);
  }

  if (college) {
    values.push(college);
    fields.push(`sc.college_id=$${values.length}`);
  }

  const whereClause = `WHERE ${fields.join(" AND ")}`;

  // sortBy & sortOrder are whitelisted by zod enums, so they are safe to inline
  const orderByClause = sortBy
    ? `ORDER BY b.${sortBy} ${sortOrder === "desc" ? "DESC" : "ASC"}, b.created_at DESC, b.id DESC`
    : `ORDER BY b.created_at DESC, b.id DESC`;

  const pageSize = limit ?? 10;
  const pageNumber = Math.max(1, page ?? 1);
  const offset = (pageNumber - 1) * pageSize;

  const query = `
  SELECT
    b.id, b.title,
    CONCAT(e.name, ' ', e.department, ' ', e.year, ' year') AS level,
    b.book_type AS type, b.selling_price,
    COUNT(*) OVER() AS total_count
  FROM books AS b
      INNER JOIN students AS s ON b.posted_by = s.id
      LEFT JOIN education_levels AS e ON b.edu_level_id = e.id
      LEFT JOIN saved_campuses AS sc ON b.meeting_campus_id = sc.id
      ${whereClause}
      ${orderByClause} LIMIT ${pageSize} OFFSET ${offset}
    `;
  type Query = Pick<Book, "id" | "title" | "selling_price"> & {
    level: string;
    type: Book["book_type"];
    total_count: number;
  };

  const result = await db.query<Query>(query, values);
  const total =
    result.rows.length > 0 ? Number(result.rows[0]?.total_count) : 0;
  const books = result.rows.map(({ total_count, ...book }) => book);
  const totalPages = Math.ceil(total / pageSize);
  return {
    books,
    limit: pageSize,
    page: pageNumber,
    total,
    totalPages,
  };
}
