import db from "@config/db.config.js";
import type { Admin } from "@typedefs/admin.type.js";
import type { Student } from "@typedefs/student.type.js";
import type { StudentRegister } from "@validations/student.validation.js";

export async function getAdminByEmail(email: string) {
  const result = await db.query<Admin>(
    `
    SELECT t1.id, t1.full_name, t1.email, t1.role,  t1.contact_no, t1.password_hash,  t1.status FROM admins AS t1 WHERE t1.email = $1;
    `,
    [email],
  );
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0]!;
}

export async function getDBStudentByContactNo(contactNo: string) {
  return db.query(
    `
    SELECT * from students
    WHERE contact_no = $1
    `,
    [contactNo],
  );
}
export async function getDBStudentByEmail(email: string) {
  return db.query<
    Omit<Student, "suspended_by" | "suspend_reason" | "suspended_at">
  >(
    `
  SELECT id, full_name, contact_no, email, college_id, password_hash, role, edu_level_id, status, upazila_id, address, created_at, updated_at  FROM students
  WHERE email = $1;
  `,
    [email],
  );
}

export function getClgEduAndUpazliaExistance(
  college_id: number,
  edu_level_id: number,
  upazila_id: number,
) {
  type ExistType = {
    college_exists: boolean;
    education_levels_exists: boolean;
    upazila_exists: boolean;
  };
  return db.query<ExistType>(
    `
  SELECT
    EXISTS(
      SELECT 1 FROM colleges
      WHERE id = $1
    ) AS college_exists,
    EXISTS(
      SELECT 1 FROM education_levels
      WHERE id = $2
    ) AS education_levels_exists,
    EXISTS(
      SELECT 1 FROM upazilas
      WHERE id = $3
    ) AS upazila_exists
    ;
    `,
    [college_id, edu_level_id, upazila_id],
  );
}

export async function createDBStudent(createStudentInput: StudentRegister) {
  const {
    full_name,
    contact_no,
    email,
    college_id,
    password,
    edu_level_id,
    upazila_id,
    address,
  } = createStudentInput;

  const query = `
    INSERT INTO students
      (full_name, contact_no, email, college_id, password_hash, edu_level_id, upazila_id, address)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
      id, status, role, created_at, updated_at;
    `;
  return db.query<{
    id: number;
    status: string;
    role: "student";
    created_at: string;
    updated_at: string;
  }>(query, [
    full_name,
    contact_no,
    email,
    college_id,
    password,
    edu_level_id,
    upazila_id,
    address ?? null,
  ]);
}
