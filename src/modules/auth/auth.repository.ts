import db from "@/config/db.config.js";
import type { Admin } from "@/types/admin.type.js";

export async function getAdminByEmail(email: string) {
  const result = await db.query<Admin>(
    `
    SELECT t1.id, t1.full_name, t1.email, t1.contact_no, t1.password_hash,  t1.status,  t2.id AS suspender_id, t2.full_name AS suspender_name, t2.email AS suspender_email FROM admins AS t1 LEFT JOIN admins AS t2 ON t1.suspended_by = t2.id WHERE t1.email = $1;
    `,
    [email],
  );
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0]!;
}
