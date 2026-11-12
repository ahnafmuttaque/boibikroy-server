import type { GetStudentsQuery } from "@validations/student.validation.js";
import { getDBStudentWithFilters } from "@modules/students/student.repository.js";

export async function getStudentsService(filters: GetStudentsQuery) {
  const queryResult = await getDBStudentWithFilters(filters);
  return queryResult;
}
