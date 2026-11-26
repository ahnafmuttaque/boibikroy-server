import { asyncHandler } from "@utils/asyncHandler.js";
import { getPositiveNumber } from "@validations/number.validation.js";
import type {
  CreateSavedCampus,
  DeleteCampusQuery,
  UpdateSavedCampus,
} from "@validations/saved_campuses.validation.js";
import {
  campusByIdService,
  campusCreateService,
  campusDeleteService,
  campusGetAllService,
  patchCampusService,
} from "./saved_campuses.service.js";
import { ApiResponse } from "@utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";

export const postCreateSavedCampuses = asyncHandler(async (req, res) => {
  const studentId = req.user!.id;
  const createCampus: CreateSavedCampus = req.body;
  const campus = await campusCreateService(studentId, createCampus);
  new ApiResponse(StatusCodes.CREATED, campus).send(res);
});

export const getAllCampuses = asyncHandler(async (req, res) => {
  const studentId = req.user!.id;
  const campuses = await campusGetAllService(studentId);
  new ApiResponse(StatusCodes.OK, campuses).send(res);
});

export const getCampusById = asyncHandler(async (req, res) => {
  const campusId = getPositiveNumber(req.params.campus_id);
  const studentId = req.user!.id;
  const campus = await campusByIdService(studentId, campusId);
  new ApiResponse(StatusCodes.OK, campus).send(res);
});

export const deleteCampusById = asyncHandler(async (req, res) => {
  const studentId = req.user!.id;
  const campusId = getPositiveNumber(req.params.campus_id);
  const { altCampusId }: DeleteCampusQuery = req.query;
  await campusDeleteService(studentId, campusId, altCampusId);
  new ApiResponse(StatusCodes.OK, "campus deleted successfully").send(res);
});

export const patchCampusById = asyncHandler(async (req, res) => {
  const campusIdStr = req.params.campus_id;
  const campusId = getPositiveNumber(campusIdStr);
  const studentId = req.user!.id;
  const patchCampus: UpdateSavedCampus = req.body;
  const updatedCampus = await patchCampusService(
    studentId,
    campusId,
    patchCampus,
  );
  new ApiResponse(StatusCodes.OK, updatedCampus).send(res);
});

export const getAssociatedBooks = asyncHandler(async (req, res) => {
  const studentId = req.user!.id;
  const campusIdStr = req.params.campus_id;
  const campusId = getPositiveNumber(campusIdStr);
});
