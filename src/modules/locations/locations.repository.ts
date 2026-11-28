import db from "@config/db.config.js";
import type {
  District,
  Division,
  Upazila,
} from "@typedefs/locations.type.js";
import type {
  GetDistrictsQuery,
  GetUpazilasQuery,
} from "@validations/locations.validation.js";

export async function getDBDivisions() {
  const query = `
    SELECT id, name_en, bn_name
    FROM divisions
      ORDER BY name_en ASC;
    `;
  return db.query<Division>(query);
}

export async function getDBDistricts(filters: GetDistrictsQuery) {
  const { division_id } = filters;
  const values: Array<any> = [];
  const fields: Array<string> = [];

  if (division_id) {
    values.push(division_id);
    fields.push(`division_id = $${values.length}`);
  }

  const whereClause = fields.length ? `WHERE ${fields.join(" AND ")}` : "";
  const query = `
    SELECT id, division_id, name_en, bn_name
    FROM districts
      ${whereClause}
      ORDER BY name_en ASC;
    `;
  return db.query<District>(query, values);
}

export async function getDBUpazilas(filters: GetUpazilasQuery) {
  const { district_id } = filters;
  const values: Array<any> = [];
  const fields: Array<string> = [];

  if (district_id) {
    values.push(district_id);
    fields.push(`district_id = $${values.length}`);
  }

  const whereClause = fields.length ? `WHERE ${fields.join(" AND ")}` : "";
  const query = `
    SELECT id, district_id, name_en, bn_name
    FROM upazilas
      ${whereClause}
      ORDER BY name_en ASC;
    `;
  return db.query<Upazila>(query, values);
}
