import type { GetStudentsQuery } from "@validations/student.validation.js";
import type { Request, Response } from "express";
import { ApiResponse, PaginatedResponse } from "@utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import {
  getStudentByIdService,
  getStudentsService,
} from "./student.service.js";
import { asyncHandler } from "@utils/asyncHanlder.js";
import { getPositiveNumber } from "@validations/number.validation.js";

export async function postDeleteStudents(req: Request, res: Response) {}

export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.query as any as GetStudentsQuery;
  const { students, ...pagination } = await getStudentsService(filters);
  new PaginatedResponse(StatusCodes.OK, students, pagination).send(res);
});

export const getStudentById = asyncHandler(
  async (req: Request, res: Response) => {
    const idStr = req.params.id;
    const id = getPositiveNumber(idStr);
    const student = await getStudentByIdService(id);
    new ApiResponse(StatusCodes.OK, student).send(res);
  },
);

export async function postSuspendStudent(req: Request, res: Response) {}

export async function getStudentSelf(req: Request, res: Response) {}

export async function patchStudentSelf(req: Request, res: Response) {}
