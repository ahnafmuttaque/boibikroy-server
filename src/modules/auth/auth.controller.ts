import type { NextFunction, Request, Response } from "express";
import type { AdminLogin } from "@validations/admin.validation.js";
import {
  adminLoginService,
  studentLoginService,
  studentRegisterService,
} from "@modules/auth/auth.service.js";
import { asyncHandler } from "@utils/asyncHanlder.js";
import { ApiResponse } from "@utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import { createJWT } from "@utils/createJWT.js";
import { cookieConfig } from "@config/cookie.config.js";
import type {
  StudentLogin,
  StudentRegister,
} from "@validations/student.validation.js";

export const postLoginAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const credentials: AdminLogin = req.body;
    const clientRes = await adminLoginService(credentials);
    const jwtPayload = {
      id: clientRes.id,
      email: clientRes.email,
      role: clientRes.role,
    };
    const token = createJWT(jwtPayload);
    res.cookie("token", token, cookieConfig);
    const { password_hash, ...rest } = clientRes;
    new ApiResponse(StatusCodes.OK, rest).send(res);
  },
);

export const postRegisterStudents = asyncHandler(async (req, res) => {
  const createStudentInput: StudentRegister = req.body;
  const insertedStudent = await studentRegisterService(createStudentInput);
  const jwtPayload = {
    id: insertedStudent.id,
    email: insertedStudent.email,
    role: insertedStudent.role,
  };
  const token = createJWT(jwtPayload);
  res.cookie("token", token, cookieConfig);
  const { password, ...rest } = insertedStudent;
  new ApiResponse(StatusCodes.CREATED, rest).send(res);
});

export const postLoginStudents = asyncHandler(async (req, res) => {
  const loginInput: StudentLogin = req.body;
  const desiredStudent = await studentLoginService(loginInput);
  const jwtPayload = {
    id: desiredStudent.id,
    email: desiredStudent.email,
    role: desiredStudent.role,
  };
  const token = createJWT(jwtPayload);
  res.cookie("token", token, cookieConfig);
  new ApiResponse(StatusCodes.OK, desiredStudent).send(res);
});

export const postLogout = asyncHandler(async (req, res) => {
  res.clearCookie("token", cookieConfig);
  new ApiResponse(StatusCodes.OK, {
    message: "logout successful",
  }).send(res);
});
