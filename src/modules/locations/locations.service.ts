import type {
  GetDistrictsQuery,
  GetUpazilasQuery,
} from "@validations/locations.validation.js";
import {
  getDBDistricts,
  getDBDivisions,
  getDBUpazilas,
} from "./locations.repository.js";

export async function getDivisionsService() {
  const result = await getDBDivisions();
  return result.rows;
}

export async function getDistrictsService(filters: GetDistrictsQuery) {
  const result = await getDBDistricts(filters);
  return result.rows;
}

export async function getUpazilasService(filters: GetUpazilasQuery) {
  const result = await getDBUpazilas(filters);
  return result.rows;
}
