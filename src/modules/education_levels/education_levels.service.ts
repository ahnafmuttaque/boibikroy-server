import { getDBEducationLevels } from "./education_levels.repository.js";

export async function getEducationLevelsService() {
  const result = await getDBEducationLevels();
  return result.rows;
}
