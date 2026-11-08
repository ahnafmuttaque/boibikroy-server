import db from "@config/db.config.js";
import type { Admin } from "@typedefs/admin.type.js";
import type {
  AdminPatch,
  AdminRegister,
  GetAdminQuery,
} from "@validations/admin.validation.js";

export async function insertDBAdmin(credentials: AdminRegister) {
  const { full_name, email, password, contact_no } = credentials;
  const query = `
    INSERT INTO admins (full_name, email, password_hash, contact_no)
      VALUES
          ($1, $2, $3, $4) RETURNING id;
    `;
  return db.query<Pick<Admin, "id">>(query, [
    full_name,
    email,
    password,
    contact_no,
  ]);
}

export async function getDBAdminByEmail(email: string) {
  const query = `
    SELECT * FROM admins where email = $1;
    `;
  return db.query(query, [email]);
}

export async function getDBAdminById(id: number) {
  const query = `
    SELECT id, full_name, email, contact_no, role, status, created_at from admins where id = $1;
    `;
  type QueryResult = Omit<
    Admin,
    "password_hash" | "suspended_by" | "suspended_at"
  >;
  return db.query<QueryResult>(query, [id]);
}

export async function updateFullNameAndContactDBAdmin(
  patchBody: AdminPatch,
  id: number,
) {
  const currentTime = new Date().toISOString();
  const { full_name, contact_no } = patchBody;

  const query = `UPDATE admins SET full_name=$1, contact_no=$2, updated_at=$3 WHERE id=$4 RETURNING full_name, contact_no, email, role, status, created_at, updated_at;`;

  return db.query<
    Exclude<Admin, "suspended_by" | "suspended_at" | "password_hash" | "id">
  >(query, [full_name, contact_no, currentTime, id]);
}

export async function deleteDBAdminById(id: number) {
  const query = `
  DELETE FROM admins WHERE id = $1;
`;

  const result = await db.query(query, [id]);
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0]!;
}

export async function getAllDBAdmins(filters: GetAdminQuery) {
  const { email, status, full_name } = filters;
  const values: Array<string> = [];
  const conditions: Array<string> = [];
  if (email) {
    values.push(`%${email.trim().toLowerCase()}%`);
    conditions.push(`email ilike $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status=$${values.length}`);
  }

  if (full_name) {
    values.push(`%${full_name.trim().toLowerCase()}%`);
    conditions.push(`full_name ilike $${values.length}`);
  }

  const whereClause = `where role <> 'admin' ${conditions.length === 0 ? "" : " AND " + conditions.join(" AND ")}`;
  const query = `SELECT full_name, email, contact_no, role, created_at , updated_at FROM admins ${whereClause}`;
  return db.query<Admin>(query, values);
}

export async function getDBAdminForSuspension(id: number) {
  return db.query<Admin>(`SELECT * FROM admins WHERE id = $1;`, [id]);
}

export async function suspendDBAdmin(suspendId: number, masterAdminId: number) {
  return db.query<Admin>(
    `
  UPDATE admins SET suspended_by = $1, suspended_at = CURRENT_TIMESTAMP WHERE id =$2  RETURNING full_name, email, contact_no, role, created_at, updated_at;
`,
    [masterAdminId, suspendId],
  );
}
