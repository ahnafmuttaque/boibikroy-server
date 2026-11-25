import {
  MAX_SAVED_CAMPUSES,
  type CreateSavedCampus,
} from "@validations/saved_campuses.validation.js";
import type { UpdateSavedCampus } from "@validations/saved_campuses.validation.js";
import {
  deleteDBCampus,
  getCollegeCountWithId,
  getDBAssociatedBookCount,
  getDBAssociatedBooks,
  getDBCampusById,
  getDBCampuses,
  getDBCampusesWithCollege,
  insertDBCampus,
  updateBookWithAltCampus,
  updateDBCampus,
} from "./saved_campuses.repository.js";
import { AppError } from "@utils/AppError.js";
import { StatusCodes } from "http-status-codes";

export const campusCreateService = async (
  studentId: number,
  createCampus: CreateSavedCampus,
) => {
  const getCampusResult = await getDBCampuses(studentId);
  const campuses = getCampusResult.rows;
  if (campuses.length >= MAX_SAVED_CAMPUSES) {
    throw new AppError(StatusCodes.BAD_REQUEST, "max campus exceeds");
  }
  const isCampusExists = campuses.some(
    (campus) => campus.college_id === createCampus.college_id,
  );
  if (isCampusExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "campus already saved");
  }
  const insertedRes = await insertDBCampus(studentId, createCampus);
  return insertedRes.rows[0]!;
};

export const campusGetAllService = async (studentId: number) => {
  const getResult = await getDBCampusesWithCollege(studentId);
  return getResult.rows;
};

export const campusByIdService = async (
  studentId: number,
  campusId: number,
) => {
  const getCampusResult = await getDBCampusById(studentId, campusId);
  if (!getCampusResult.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "campus doesn't exist");
  }
  return getCampusResult.rows[0]!;
};

export const campusDeleteService = async (
  studentId: number,
  campusId: number,
  altCampusId?: number,
) => {
  if (campusId == altCampusId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "campus & aleternative campus can't be same",
    );
  }
  const associatedResult = await getDBAssociatedBookCount(studentId, campusId);
  if (associatedResult.rows[0]!.associated_count > 0) {
    if (altCampusId === undefined) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "alternative campus required",
      );
    }
    const getAltCampusResult = await getDBCampusById(studentId, altCampusId);
    if (getAltCampusResult.rowCount === 0) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "invalid alternative campus id",
      );
    }
    await updateBookWithAltCampus(studentId, campusId, altCampusId);
  }
  const deleteRes = await deleteDBCampus(studentId, campusId);
  if (deleteRes.rowCount === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "campus not found");
  }
};

export const patchCampusService = async (
  studentId: number,
  campusId: number,
  patchCampus: UpdateSavedCampus,
) => {
  if (patchCampus.college_id) {
    const getCollegeResult = await getCollegeCountWithId(
      patchCampus.college_id,
    );
    if (getCollegeResult.rows[0]!.college_count == 0) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid college id");
    }
  }
  const updateResult = await updateDBCampus(studentId, campusId, patchCampus);
  if (updateResult.rows.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "campus not found");
  }
  return updateResult.rows[0]!;
};

export const getAssociatedBooksService = async (
  studentId: number,
  campusId: number,
) => {
  const getCampusResult = await getDBCampusById(studentId, campusId);
  if (!getCampusResult.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "campus not found");
  }
  const associatedBooksResult = await getDBAssociatedBooks(studentId, campusId);
  return associatedBooksResult.rows!;
};
