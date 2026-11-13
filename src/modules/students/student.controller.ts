import type {
  GetStudentsQuery,
  StudentSuspend,
} from "@validations/student.validation.js";
import type { Request, Response } from "express";
import { ApiResponse, PaginatedResponse } from "@utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import {
  deleteStudentByIdService,
  getStudentByIdService,
  getStudentSelfService,
  getStudentsService,
  suspendStudentById,
} from "./student.service.js";
import { asyncHandler } from "@utils/asyncHanlder.js";
import { getPositiveNumber } from "@validations/number.validation.js";

export async function deleteStudentById(req: Request, res: Response) {
  const idStr = req.params.id;
  const studentId = getPositiveNumber(idStr);
  await deleteStudentByIdService(studentId);
  new ApiResponse(StatusCodes.OK, { message: "Student deleted successfully" });
}

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

export async function getStudentSelf(req: Request, res: Response) {
  const studentId = req.user!.id;
  const student = await getStudentSelfService(studentId);
  new ApiResponse(StatusCodes.OK, student).send(res);
}

export async function postSuspendStudent(req: Request, res: Response) {
  const idStr = req.params.id;
  const studentId = getPositiveNumber(idStr);
  const adminId = req.user!.id;
  const suspendBody: StudentSuspend = req.body;
  await suspendStudentById(studentId, adminId, suspendBody.suspend_reason);
  new ApiResponse(StatusCodes.OK, {
    message: "Student suspension successful",
  }).send(res);
}

export async function patchStudentSelf(req: Request, res: Response) {}
