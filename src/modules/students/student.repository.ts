import db from "@config/db.config.js";
import type { Student } from "@typedefs/student.type.js";
import type { GetStudentsQuery } from "@validations/student.validation.js";

export async function getDBStudentWithFilters(filters: GetStudentsQuery) {
  const {
    search,
    status,
    upazila_id,
    college_id,
    district_id,
    edu_level_id,
    limit,
    page,
  } = filters;
  // c for colleges
  // s for students
  // u for upazilas
  // dd for districts
  // dv for divisions
  const searchValues: Array<any> = [];
  const searchFields: Array<any> = [];
  if (search) {
    const dbSearchAttributes = [
      "s.full_name",
      "s.contact_no",
      "s.email",
      "c.name",
      "u.name_en",
      "u.bn_name",
      "dd.name_en",
      "dd.bn_name",
      "dv.name_en",
      "dv.bn_name",
    ];
    searchValues.push(`%${search}%`);
    dbSearchAttributes.forEach((field) => {
      searchFields.push(`${field} ILIKE $${searchValues.length}`);
    });
  }

  const values: Array<any> = [...searchValues];
  const fields: Array<any> = [];

  if (status) {
    values.push(status);
    fields.push(`s.status=$${values.length}`);
  }

  if (upazila_id) {
    values.push(upazila_id);
    fields.push(`s.upazila_id=$${values.length}`);
  }

  if (college_id) {
    values.push(college_id);
    fields.push(`s.college_id=$${values.length}`);
  }

  if (district_id) {
    values.push(district_id);
    fields.push(`dd.id=$${values.length}`);
  }

  if (edu_level_id) {
    values.push(edu_level_id);
    fields.push(`s.edu_level_id=$${values.length}`);
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

  // retrive full_name, email, contact_no, college_id, standard, department, year

  type Query = Pick<
    Student,
    | "id"
    | "full_name"
    | "contact_no"
    | "email"
    | "college_id"
    | "edu_level_id"
    | "status"
    | "upazila_id"
  > & {
    district_id: number;
    division_id: number;
    suspended_admin_id: number | null;
    suspend_admin_name: string | null;
    college_name: string;
    level_info: string;
    upazila_name: string;
    upazila_bn_name: string;
    district_name: string;
    district_bn_name: string;
    division_name: string;
    division_bn_name: string;
    total_count: number;
  };

  const pageSize = limit ?? 10;
  const pageNumber = Math.max(1, page ?? 1);
  const offset = (pageNumber - 1) * 10;

  const query = `
  SELECT
    s.id, s.full_name, s.contact_no, s.email, s.college_id, s.edu_level_id,
    s.status ,s.upazila_id, u.district_id, dd.division_id,
    s.suspended_by AS suspended_admin_id, a.full_name AS suspend_admin_name,
    c.name AS college_name, CONCAT(e.name, ' ', e.year, ' year') AS level_info,
    u.name_en AS upazila_name, u.bn_name AS upazila_bn_name,
    dd.name_en AS district_name, dd.bn_name AS district_bn_name,
    dv.name_en AS division_name, dv.bn_name AS division_bn_name,
    COUNT(*) OVER() AS total_count
  FROM students AS s
      LEFT JOIN admins as a ON s.suspended_by = a.id
      LEFT JOIN colleges AS c ON s.college_id = c.id
      LEFT JOIN education_levels AS e ON s.edu_level_id = e.id
      LEFT JOIN upazilas AS u ON s.upazila_id = u.id
      LEFT JOIN districts AS dd ON u.district_id = dd.id
      LEFT JOIN divisions AS dv ON dd.division_id = dv.id
      ${whereClause}
      ORDER BY s.created_at DESC LIMIT ${pageSize} OFFSET ${offset}
    `;

  const result = await db.query<Query>(query, values);
  const total =
    result.rows.length > 0 ? Number(result.rows[0]?.total_count) : 0;
  const students = result.rows.map(({ total_count, ...student }) => student);
  const totalPages = Math.ceil(total / pageSize);
  return {
    students,
    limit: pageSize,
    page: pageNumber,
    total,
    totalPages,
  };
}
