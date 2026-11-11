import { StatusCodes } from "http-status-codes";
import * as authRepo from "@modules/auth/auth.repository.js";
import bcrypt from "bcryptjs";
import { AppError } from "@utils/AppError.js";
import type {
  AdminLogin,
  AdminUpdatePassword,
} from "@validations/admin.validation.js";
import {
  type StudentLogin,
  type StudentRegister,
  type StudentUpdatePassword,
} from "@validations/student.validation.js";

export async function adminLoginService(credentials: AdminLogin) {
  const { email, password } = credentials;

  const requestedAdmin = await authRepo.getAdminByEmail(email);

  if (!requestedAdmin) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(
    password,
    requestedAdmin.password_hash,
  );

  if (!isValidPassword) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }
  if (requestedAdmin.status === "suspended") {
    throw new AppError(StatusCodes.FORBIDDEN, "Your account is suspended");
  }
  return requestedAdmin;
}

export async function adminUpdatePassService(
  adminId: number,
  passInput: AdminUpdatePassword,
) {
  const getAdminRes = await authRepo.getDBAdminById(adminId);
  if (!getAdminRes.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Admin not found");
  }
  const getAdmin = getAdminRes.rows[0]!;

  if (getAdmin.status === "suspended") {
    throw new AppError(StatusCodes.FORBIDDEN, "Your account is suspended");
  }

  const validPassword = await bcrypt.compare(
    passInput.old_password,
    getAdmin.password_hash,
  );

  if (!validPassword) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid password");
  }

  const isNewPasswordIsOldPassword = await bcrypt.compare(
    passInput.new_password,
    getAdmin.password_hash,
  );
  if (isNewPasswordIsOldPassword) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Can't use old password");
  }

  const hashedPassword = await bcrypt.hash(passInput.new_password, 12);
  const upResult = await authRepo.updateDBAdminPasswordById(
    adminId,
    hashedPassword,
  );
  if (upResult.rowCount === 0) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Admin not found or update failed",
    );
  }
}

export async function studentRegisterService(
  createStudentInput: StudentRegister,
) {
  const { email, college_id, edu_level_id, upazila_id, password, contact_no } =
    createStudentInput;

  const [stuByEmailRes, stuByPhoneRes] = await Promise.all([
    authRepo.getDBStudentByEmail(email),
    authRepo.getDBStudentByContactNo(contact_no),
  ]);
  if (stuByEmailRes.rows.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email already exists");
  }
  if (stuByPhoneRes.rows.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Phone number already exists");
  }

  const clgAndEduExistanceResult = await authRepo.getClgEduAndUpazliaExistance(
    college_id,
    edu_level_id,
    upazila_id,
  );
  const { college_exists, education_levels_exists, upazila_exists } =
    clgAndEduExistanceResult.rows[0]!;

  if (!college_exists || !education_levels_exists || !upazila_exists) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Invalid ${!college_exists ? "college" : !education_levels_exists ? "standard" : "upazila"}`,
    );
  }
  createStudentInput.password = await bcrypt.hash(password, 12);
  const createStudentResult =
    await authRepo.createDBStudent(createStudentInput);
  const insertedStudent = {
    ...createStudentInput,
    ...createStudentResult.rows[0]!,
  };
  return insertedStudent;
}

export async function studentLoginService(loginInput: StudentLogin) {
  const stuByEmailRes = await authRepo.getDBStudentByEmail(loginInput.email);
  if (!stuByEmailRes.rows.length) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }
  const desiredStudent = stuByEmailRes.rows[0]!;
  const isValidPassword = await bcrypt.compare(
    loginInput.password,
    desiredStudent.password_hash,
  );
  if (!isValidPassword) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }
  if (desiredStudent.status === "suspended") {
    throw new AppError(StatusCodes.FORBIDDEN, "Your account is suspended");
  }
  const { password_hash, ...rest } = desiredStudent;
  return rest;
}

export async function studentUpdatePasswordService(
  studentId: number,
  passInput: StudentUpdatePassword,
) {
  const getStuByIdRes = await authRepo.getDBStudentById(studentId);
  if (!getStuByIdRes.rows.length) {
    throw new AppError(StatusCodes.NOT_FOUND, "Student not found");
  }
  const getStudent = getStuByIdRes.rows[0]!;
  if (getStudent.status === "suspended") {
    throw new AppError(StatusCodes.FORBIDDEN, "Your account is suspended");
  }
  const validPassword = await bcrypt.compare(
    passInput.old_password,
    getStudent.password_hash,
  );
  if (!validPassword) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid password");
  }
  const isNewPasswordIsOldPassword = await bcrypt.compare(
    passInput.new_password,
    getStudent.password_hash,
  );
  if (isNewPasswordIsOldPassword) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Can't use old password");
  }
  const hashedPassword = await bcrypt.hash(passInput.new_password, 12);
  const upResult = await authRepo.updateDBStudentPassword(
    studentId,
    hashedPassword,
  );
  if (upResult.rowCount === 0) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Student not found or update failed",
    );
  }
}
