import db from "@config/db.config.js";
import type { Admin } from "@typedefs/admin.type.js";
import type { AdminRegister } from "@validations/admin.validation.js";

export async function insertDBAdmin(credentials: AdminRegister) {
  const { full_name, email, password, contact_no } = credentials;
  const query = `
    INSERT INTO admins (full_name, email, password_hash, contact_no)
      VALUES
          ($1, $2, $3, $4) RETURNING id;
    `;
  const result = await db.query<Admin>(query, [
    full_name,
    email,
    password,
    contact_no,
  ]);
  return result.rows[0]!.id;
}

export async function getDBAdminByEmail(email: string) {
  const query = `
    SELECT * FROM admins where email = $1;
    `;
  const result = await db.query(query, [email]);
  return result.rowCount === 0;
}

export async function getDBAdminById(id: number) {
  const query = `
    SELECT full_name, email, contact_no, role, status, created_at from admins where id = $1;
    `;
  type QueryResult = Omit<
    Admin,
    "id" | "password_hash" | "suspended_by" | "suspended_at"
  >;
  const result = await db.query<QueryResult>(query, [id]);
  if (result.rowCount == 0) {
    return null;
  }
  return result.rows[0]!;
}
