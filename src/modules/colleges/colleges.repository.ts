import db from "@config/db.config.js";
import type { PublicCollege } from "@typedefs/colleges.type.js";
import type { GetCollegesQuery } from "@validations/colleges.validation.js";

export async function getDBColleges(filters: GetCollegesQuery) {
  const { search, limit, page } = filters;

  // only approved colleges are served
  const values: Array<any> = [];
  const fields: Array<string> = [`approved = '1'`];

  if (search) {
    values.push(`%${search}%`);
    const searchAttributes = ["name", "code", "address", "upazila", "district"];
    fields.push(
      `(${searchAttributes.map((field) => `${field} ILIKE $${values.length}`).join(" OR ")})`,
    );
  }

  const pageSize = limit ?? 10;
  const pageNumber = Math.max(1, page ?? 1);
  const offset = (pageNumber - 1) * pageSize;

  const query = `
    SELECT
      id, code, name, address, upazila, district, division,
      COUNT(*) OVER() AS total_count
    FROM colleges
      WHERE ${fields.join(" AND ")}
      ORDER BY name ASC, id ASC LIMIT ${pageSize} OFFSET ${offset}
    `;
  type Query = PublicCollege & { total_count: number };

  const result = await db.query<Query>(query, values);
  const total =
    result.rows.length > 0 ? Number(result.rows[0]?.total_count) : 0;
  const colleges = result.rows.map(({ total_count, ...college }) => college);
  const totalPages = Math.ceil(total / pageSize);
  return {
    colleges,
    limit: pageSize,
    page: pageNumber,
    total,
    totalPages,
  };
}

export async function getDBCollegeById(collegeId: number) {
  const query = `
    SELECT id, code, name, address, upazila, district, division
    FROM colleges
      WHERE id = $1 AND approved = '1';
    `;
  return db.query<PublicCollege>(query, [collegeId]);
}
