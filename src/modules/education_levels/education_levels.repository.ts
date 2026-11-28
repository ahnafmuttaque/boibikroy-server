import db from "@config/db.config.js";
import type { PublicEducationLevel } from "@typedefs/education_levels.type.js";

export async function getDBEducationLevels() {
  const query = `
    SELECT id, name, department, year
    FROM education_levels
      ORDER BY name ASC, department ASC, year ASC;
    `;
  return db.query<PublicEducationLevel>(query);
}
