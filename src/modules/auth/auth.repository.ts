import db from "@/config/db.config.js";
import type { Admin } from "@/types/admin.type.js";

export async function getAdminByEmail(email: string) {
  console.log(email);
  const result = await db.query<Admin>(
    `
    SELECT * FROM admins WHERE email=$1;
    `,
    [email],
  );
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0]!;
}
