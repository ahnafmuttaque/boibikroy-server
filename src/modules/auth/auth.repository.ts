import db from "@config/db.config.js";
import type { Admin } from "@typedefs/admin.type.js";

export async function getAdminByEmail(email: string) {
  const result = await db.query<Admin>(
    `
    SELECT t1.id, t1.full_name, t1.email, t1.role,  t1.contact_no, t1.password_hash,  t1.status FROM admins AS t1 LEFT JOIN admins AS t2 ON t1.suspended_by = t2.id WHERE t1.email = $1;
    `,
    [email],
  );
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0]!;
}
