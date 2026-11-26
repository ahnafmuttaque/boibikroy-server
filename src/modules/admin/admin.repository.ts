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
    VALUES ($1, $2, $3, $4)
    RETURNING id, full_name, email, contact_no, role, status, created_at, updated_at;`;

  return db.query<
    Omit<Admin, "password_hash" | "suspended_by" | "suspended_at">
  >(query, [full_name, email, password, contact_no]);
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
  const { full_name, contact_no } = patchBody;

  const fields: Array<string> = [];
  const values: Array<any> = [];

  if (full_name !== undefined) {
    values.push(full_name);
    fields.push(`full_name = $${values.length}`);
  }
  if (contact_no !== undefined) {
    values.push(contact_no);
    fields.push(`contact_no = $${values.length}`);
  }
  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);
  const idIndex = values.length;

  const query = `UPDATE admins SET ${fields.join(",")} WHERE id=$${idIndex} RETURNING full_name, contact_no, email, role, status, created_at, updated_at;`;

  return db.query<
    Omit<Admin, "suspended_by" | "suspended_at" | "password_hash" | "id">
  >(query, values);
}

export async function deleteDBAdminById(id: number) {
  const query = `
  DELETE FROM admins WHERE id = $1;
`;

  return db.query(query, [id]);
}

export async function getAllDBAdmins(filters: GetAdminQuery) {
  const { email, status, full_name, limit, page } = filters;
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

  const pageSize = limit ?? 10;
  const pageNumber = Math.max(1, page ?? 1);
  const offset = (pageNumber - 1) * pageSize;

  const query = `
    SELECT id, full_name, email, contact_no, role, status, created_at , updated_at,
      COUNT(*) OVER() AS total_count
    FROM admins ${whereClause}
    ORDER BY created_at DESC, id DESC LIMIT ${pageSize} OFFSET ${offset}
    `;
  type Query = Omit<Admin, "password_hash" | "suspended_by" | "suspended_at"> & {
    total_count: number;
  };

  const result = await db.query<Query>(query, values);
  const total =
    result.rows.length > 0 ? Number(result.rows[0]?.total_count) : 0;
  const admins = result.rows.map(({ total_count, ...admin }) => admin);
  const totalPages = Math.ceil(total / pageSize);
  return {
    admins,
    limit: pageSize,
    page: pageNumber,
    total,
    totalPages,
  };
}

export async function getDBAdminForSuspension(id: number) {
  return db.query<Admin>(`SELECT * FROM admins WHERE id = $1;`, [id]);
}

export async function suspendDBAdmin(suspendId: number, masterAdminId: number) {
  return db.query<Admin>(
    `
  UPDATE admins SET status = 'suspended', suspended_by = $1, suspended_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
  WHERE id =$2
  RETURNING id, full_name, email, contact_no, role, status, suspended_by, suspended_at, created_at, updated_at;
    `,
    [masterAdminId, suspendId],
  );
}
