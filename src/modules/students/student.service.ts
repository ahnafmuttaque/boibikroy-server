import type {
  GetStudentsQuery,
  StudentPatch,
} from "@validations/student.validation.js";
import {
  deleteDBStudentById,
  getDBShortStudentByContactNo,
  getDBStatusStudent,
  getDBStudentById,
  getDBStudentWithFilters,
  isUpazilaEduLevelAndCollegeExists,
  patchDBStudentById,
  suspendDBStudentById,
} from "@modules/students/student.repository.js";
import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";

const upazilaEduAndCollegeCheck = async function (
  upazilaId?: number,
  eduLevelId?: number,
  collegeId?: number,
) {
  const existanceCheck = await isUpazilaEduLevelAndCollegeExists(
    upazilaId,
    eduLevelId,
    collegeId,
  );
  const { upazilaExists, collegeExists, eduLevelExists } =
    existanceCheck.rows[0]!;
  if (!upazilaExists || !collegeExists || !eduLevelExists) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Invalid ${!upazilaExists ? "upazila" : !collegeExists ? "college" : "education level"} id`,
    );
  }
};

const checkForUniqueContactNo = async (
  contact_no: string,
  studentId: number,
) => {
  const studentContactRes = await getDBShortStudentByContactNo(contact_no);
  if (studentContactRes.rows.length) {
    const student = studentContactRes.rows[0]!;
    if (student.id !== studentId) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "contact no is already used by other student. use your own contact no",
      );
    }
  }
};

export async function getStudentsService(filters: GetStudentsQuery) {
  return await getDBStudentWithFilters(filters);
}

export async function getStudentSelfService(studentId: number) {
  const result = await getDBStudentById(studentId);
  if (!result.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
  const desiredStudent = result.rows[0]!;
  if (desiredStudent.status === "suspended") {
    throw new AppError(StatusCodes.FORBIDDEN, "Student is suspended");
  }
  return desiredStudent;
}

export async function studentPatchService(
  studentId: number,
  patchBody: StudentPatch,
) {
  const statusRes = await getDBStatusStudent(studentId);
  if (!statusRes.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
  if (statusRes.rows[0]!.status === "suspended") {
    throw new AppError(StatusCodes.FORBIDDEN, "Student is suspended");
  }
  // check for unique contact no
  if (patchBody.contact_no) {
    await checkForUniqueContactNo(patchBody.contact_no, studentId);
  }
  const { upazila_id, edu_level_id, college_id } = patchBody;
  if (
    upazila_id !== undefined ||
    edu_level_id !== undefined ||
    college_id !== undefined
  ) {
    await upazilaEduAndCollegeCheck(upazila_id, edu_level_id, college_id);
  }
  const patchResult = await patchDBStudentById(studentId, patchBody);
  if (patchResult.rowCount === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
}

export async function getStudentByIdService(studentId: number) {
  const result = await getDBStudentById(studentId);
  if (!result.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
  return result.rows[0]!;
}

export async function deleteStudentByIdService(studentId: number) {
  const deleteResult = await deleteDBStudentById(studentId);
  if (deleteResult.rowCount === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
}

export async function suspendStudentById(
  studentId: number,
  adminId: number,
  reason?: string,
) {
  const getResult = await getDBStatusStudent(studentId);
  if (!getResult.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
  const { status } = getResult.rows[0]!;
  if (status === "suspended") {
    throw new AppError(StatusCodes.CONFLICT, "student is suspended already");
  }
  const suspendResult = await suspendDBStudentById(studentId, adminId, reason);
  if (!suspendResult.rowCount) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
}
