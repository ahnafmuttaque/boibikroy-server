import db from "@config/db.config.js";
import type { Student } from "@typedefs/student.type.js";
import type {
  GetStudentsQuery,
  StudentPatch,
} from "@validations/student.validation.js";

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

  const pageSize = limit ?? 10;
  const pageNumber = Math.max(1, page ?? 1);
  const offset = (pageNumber - 1) * pageSize;

  const query = `
  SELECT
    s.id, s.full_name, s.contact_no, s.email, s.college_id, s.edu_level_id,
    s.status ,s.upazila_id, u.district_id, dd.division_id,
    s.suspended_by , a.full_name AS suspend_admin_name,
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
    | "suspended_by"
  > & {
    district_id: number;
    division_id: number;
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

export async function getDBStudentById(studentId: number) {
  const query = `
    SELECT
      s.id, s.full_name, s.contact_no, s.email, s.college_id, s.edu_level_id,
      s.status, s.upazila_id, u.district_id, dd.division_id, s.suspended_at,
      s.suspend_reason, s.address, s.created_at, s.updated_at,
      s.suspended_by , a.full_name AS suspend_admin_name,
      c.name AS college_name, CONCAT(e.name, ' ', e.year, ' year') AS level_info,
      u.name_en AS upazila_name, u.bn_name AS upazila_bn_name,
      dd.name_en AS district_name, dd.bn_name AS district_bn_name,
      dv.name_en AS division_name, dv.bn_name AS division_bn_name
    FROM students AS s
        LEFT JOIN admins as a ON s.suspended_by = a.id
        LEFT JOIN colleges AS c ON s.college_id = c.id
        LEFT JOIN education_levels AS e ON s.edu_level_id = e.id
        LEFT JOIN upazilas AS u ON s.upazila_id = u.id
        LEFT JOIN districts AS dd ON u.district_id = dd.id
        LEFT JOIN divisions AS dv ON dd.division_id = dv.id
    WHERE s.id = $1;
   `;

  type Query = Omit<Student, "password_hash" | "role"> & {
    district_id: number;
    division_id: number;
    suspend_admin_name: string;
    college_name: string;
    level_info: string;
    upazila_name: string;
    upazila_bn_name: string;
    division_name: string;
    division_bn_name: string;
    district_name: string;
    district_bn_name: string;
  };

  const result = db.query<Query>(query, [studentId]);
  return result;
}

export async function deleteDBStudentById(studentId: number) {
  const query = `
      DELETE FROM students
        WHERE id = $1;
    `;
  return db.query(query, [studentId]);
}

export async function getDBStatusStudent(studentId: number) {
  const query = `
    SELECT status FROM students
      WHERE id = $1;
    `;
  return db.query<Pick<Student, "status">>(query, [studentId]);
}

export async function suspendDBStudentById(
  studentId: number,
  adminId: number,
  reason?: string,
) {
  const query = `
    UPDATE students
      SET status = 'suspended', suspended_by = $1, suspended_at = CURRENT_TIMESTAMP, suspend_reason = $3
      WHERE id = $2;
    `;
  return db.query(query, [adminId, studentId, reason ?? null]);
}

export async function patchDBStudentById(
  studentId: number,
  patchBody: StudentPatch,
) {
  const fields: Array<string> = [];
  const values: Array<any> = [];
  const {
    contact_no,
    full_name,
    college_id,
    edu_level_id,
    upazila_id,
    address,
    status,
  } = patchBody;

  if (address !== undefined) {
    values.push(address);
    fields.push(`address=$${values.length}`);
  }

  if (contact_no) {
    values.push(contact_no);
    fields.push(`contact_no=$${values.length}`);
  }

  if (full_name) {
    values.push(full_name);
    fields.push(`full_name=$${values.length}`);
  }

  if (status) {
    values.push(status);
    fields.push(`status=$${values.length}`);
  }

  if (edu_level_id) {
    values.push(edu_level_id);
    fields.push(`edu_level_id=$${values.length}`);
  }

  if (upazila_id) {
    values.push(upazila_id);
    fields.push(`upazila_id=$${values.length}`);
  }

  if (college_id) {
    values.push(college_id);
    fields.push(`college_id=$${values.length}`);
  }

  values.push(studentId);
  fields.push(`updated_at= CURRENT_TIMESTAMP`);

  const query = `
      UPDATE students SET ${fields.join(" , ")}
        WHERE id=$${values.length};
  `;

  return db.query(query, values);
}

export async function getDBShortStudentByContactNo(contact_no: string) {
  const query = `
    SELECT id, contact_no FROM students
      WHERE contact_no = $1;
    `;
  return db.query<Pick<Student, "contact_no" | "id">>(query, [contact_no]);
}

export async function isUpazilaEduLevelAndCollegeExists(
  upazila_id?: number,
  edu_level_id?: number,
  college_id?: number,
) {
  const values: Array<any> = [];
  const fields: Array<any> = [];

  const getQueryForFields = (
    tableName: string,
    as: string,
    fieldValue: number | undefined,
  ) => {
    const start = "EXISTS(";
    const end = `) AS "${as}"`;
    if (fieldValue !== undefined) {
      values.push(fieldValue);
      fields.push(
        start + `SELECT 1 FROM ${tableName} WHERE id = $${values.length}` + end,
      );
      return;
    }
    values.push(1);
    fields.push(start + `SELECT $${values.length}` + end);
  };

  getQueryForFields("upazilas", "upazilaExists", upazila_id);
  getQueryForFields("education_levels", "eduLevelExists", edu_level_id);
  getQueryForFields("colleges", "collegeExists", college_id);

  type Query = {
    upazilaExists: boolean;
    eduLevelExists: boolean;
    collegeExists: boolean;
  };
  const query = `
        SELECT
          ${fields.join(" ,\n")};
    `;
  return db.query<Query>(query, values);
}
