import db from "@config/db.config.js";
import type { Admin } from "@typedefs/admin.type.js";
import type { AdminRegister } from "@validations/admin.validation.js";

export async function createDBAdmin(credentials: AdminRegister) {
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

export async function getAdminByEmail(email: string) {
  const query = `
    SELECT * FROM admins where email = $1;
    `;
  const result = await db.query(query, [email]);
  return result.rowCount === 0;
}
