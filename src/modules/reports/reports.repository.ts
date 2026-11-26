import db from "@config/db.config.js";
import type { Report, ReportWithDetails } from "@typedefs/reports.type.js";
import type {
  GetMyReportsQuery,
  GetReportsQuery,
} from "@validations/reports.validation.js";

export const existsDBBookById = async (bookId: number) => {
  const query = `
    SELECT id, posted_by FROM books
      WHERE id = $1
`;

  return db.query<{ id: number; posted_by: number }>(query, [bookId]);
};

export const createDBBookReport = async (
  reporterId: number,
  bookId: number,
  reason: string,
) => {
  const query = `
    INSERT INTO reports
      (type, book_id, reported_by, reason, reviewed_by, reviewed_at)
    VALUES
      ('book', $1, $2, $3, NULL, NULL)
    RETURNING *;
`;
  return db.query<Report>(query, [bookId, reporterId, reason]);
};

export const existsDBStudentById = async (studentId: number) => {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM students
        WHERE id = $1
  ) AS student_exists;
`;
  return db.query<{ student_exists: boolean }>(query, [studentId]);
};

export const createDBStudentReport = async (
  reporterId: number,
  studentId: number,
  reason: string,
) => {
  const query = `
    INSERT INTO reports
      (type, student_id, reported_by, reason, reviewed_by, reviewed_at)
    VALUES
      ('student', $1, $2, $3, NULL, NULL)
    RETURNING *;
`;
  return db.query<Report>(query, [studentId, reporterId, reason]);
};

export async function getDBReportsWithFilters(filters: GetReportsQuery) {
  const {
    search,
    type,
    status,
    book_id,
    student_id,
    reported_by,
    reviewed_by,
    limit,
    page,
  } = filters;
  // r for reports
  // rs for reporter students
  // s for reported students
  // b for books
  // a for admins
  const searchValues: Array<any> = [];
  const searchFields: Array<any> = [];
  if (search) {
    const dbSearchAttributes = [
      "r.reason",
      "rs.full_name",
      "rs.email",
      "s.full_name",
      "s.email",
      "b.title",
    ];
    searchValues.push(`%${search}%`);
    dbSearchAttributes.forEach((field) => {
      searchFields.push(`${field} ILIKE $${searchValues.length}`);
    });
  }

  const values: Array<any> = [...searchValues];
  const fields: Array<any> = [];

  if (type) {
    values.push(type);
    fields.push(`r.type=$${values.length}`);
  }

  if (status) {
    values.push(status);
    fields.push(`r.status=$${values.length}`);
  }

  if (book_id) {
    values.push(book_id);
    fields.push(`r.book_id=$${values.length}`);
  }

  if (student_id) {
    values.push(student_id);
    fields.push(`r.student_id=$${values.length}`);
  }

  if (reported_by) {
    values.push(reported_by);
    fields.push(`r.reported_by=$${values.length}`);
  }

  if (reviewed_by) {
    values.push(reviewed_by);
    fields.push(`r.reviewed_by=$${values.length}`);
  }

  const conditions: string[] = [];
  if (search && searchFields.length) {
    conditions.push(`( ${searchFields.join(" OR ")} )`);
  }
  if (fields.length) {
    conditions.push(...fields);
  }
  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const pageSize = limit ?? 10;
  const pageNumber = Math.max(1, page ?? 1);
  const offset = (pageNumber - 1) * pageSize;

  const query = `
  SELECT
    r.id, r.type, r.book_id, r.student_id, r.reported_by, r.reason,
    r.status, r.reviewed_by, r.reviewed_at, r.created_at,
    rs.full_name AS reporter_name, rs.email AS reporter_email,
    s.full_name AS reported_student_name, s.email AS reported_student_email,
    b.title AS reported_book_title,
    a.full_name AS reviewer_name,
    COUNT(*) OVER() AS total_count
  FROM reports AS r
      LEFT JOIN students AS rs ON r.reported_by = rs.id
      LEFT JOIN students AS s ON r.student_id = s.id
      LEFT JOIN books AS b ON r.book_id = b.id
      LEFT JOIN admins AS a ON r.reviewed_by = a.id
      ${whereClause}
      ORDER BY r.created_at DESC LIMIT ${pageSize} OFFSET ${offset}
    `;
  type Query = ReportWithDetails & {
    total_count: number;
  };

  const result = await db.query<Query>(query, values);
  const total =
    result.rows.length > 0 ? Number(result.rows[0]?.total_count) : 0;
  const reports = result.rows.map(({ total_count, ...report }) => report);
  const totalPages = Math.ceil(total / pageSize);
  return {
    reports,
    limit: pageSize,
    page: pageNumber,
    total,
    totalPages,
  };
}

export async function getDBReportById(reportId: number) {
  const query = `
    SELECT
      r.id, r.type, r.book_id, r.student_id, r.reported_by, r.reason,
      r.status, r.reviewed_by, r.reviewed_at, r.created_at,
      rs.full_name AS reporter_name, rs.email AS reporter_email,
      s.full_name AS reported_student_name, s.email AS reported_student_email,
      b.title AS reported_book_title,
      a.full_name AS reviewer_name
    FROM reports AS r
        LEFT JOIN students AS rs ON r.reported_by = rs.id
        LEFT JOIN students AS s ON r.student_id = s.id
        LEFT JOIN books AS b ON r.book_id = b.id
        LEFT JOIN admins AS a ON r.reviewed_by = a.id
    WHERE r.id = $1;
   `;

  return db.query<ReportWithDetails>(query, [reportId]);
}

export async function getDBReportsByReporter(
  reporterId: number,
  filters: GetMyReportsQuery,
) {
  const { type, status, limit, page } = filters;
  // r for reports
  // s for reported students
  // b for books
  const values: Array<any> = [reporterId];
  const fields: Array<any> = [`r.reported_by=$${values.length}`];

  if (type) {
    values.push(type);
    fields.push(`r.type=$${values.length}`);
  }

  if (status) {
    values.push(status);
    fields.push(`r.status=$${values.length}`);
  }

  const whereClause = `WHERE ${fields.join(" AND ")}`;

  const pageSize = limit ?? 10;
  const pageNumber = Math.max(1, page ?? 1);
  const offset = (pageNumber - 1) * pageSize;

  const query = `
  SELECT
    r.id, r.type, r.book_id, r.student_id, r.reason,
    r.status, r.reviewed_at, r.created_at,
    s.full_name AS reported_student_name,
    b.title AS reported_book_title,
    COUNT(*) OVER() AS total_count
  FROM reports AS r
      LEFT JOIN students AS s ON r.student_id = s.id
      LEFT JOIN books AS b ON r.book_id = b.id
      ${whereClause}
      ORDER BY r.created_at DESC LIMIT ${pageSize} OFFSET ${offset}
    `;
  type Query = Pick<
    ReportWithDetails,
    | "id"
    | "type"
    | "book_id"
    | "student_id"
    | "reason"
    | "status"
    | "reviewed_at"
    | "created_at"
    | "reported_student_name"
    | "reported_book_title"
  > & {
    total_count: number;
  };

  const result = await db.query<Query>(query, values);
  const total =
    result.rows.length > 0 ? Number(result.rows[0]?.total_count) : 0;
  const reports = result.rows.map(({ total_count, ...report }) => report);
  const totalPages = Math.ceil(total / pageSize);
  return {
    reports,
    limit: pageSize,
    page: pageNumber,
    total,
    totalPages,
  };
}
