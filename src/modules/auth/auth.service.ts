import { StatusCodes } from "http-status-codes";
import {
  createDBStudent,
  getAdminByEmail,
  getClgEduAndUpazliaExistance,
  getDBStudentByContactNo,
  getDBStudentByEmail,
} from "@modules/auth/auth.repository.js";
import bcrypt from "bcryptjs";
import { AppError } from "@utils/AppError.js";
import type { AdminLogin } from "@validations/admin.validation.js";
import {
  type StudentLogin,
  type StudentRegister,
} from "@validations/student.validation.js";

export async function adminLoginService(credentials: AdminLogin) {
  const { email, password } = credentials;

  const requestedAdmin = await getAdminByEmail(email);

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

  return requestedAdmin;
}

export async function studentRegisterService(
  createStudentInput: StudentRegister,
) {
  const { email, college_id, edu_level_id, upazila_id, password, contact_no } =
    createStudentInput;

  const [stuByEmailRes, stuByPhoneRes] = await Promise.all([
    getDBStudentByEmail(email),
    getDBStudentByContactNo(contact_no),
  ]);
  if (stuByEmailRes.rows.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email already exists");
  }
  if (stuByPhoneRes.rows.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Phone number already exists");
  }

  const clgAndEduExistanceResult = await getClgEduAndUpazliaExistance(
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
  const createStudentResult = await createDBStudent(createStudentInput);
  const insertedStudent = {
    ...createStudentInput,
    ...createStudentResult.rows[0]!,
  };
  return insertedStudent;
}

export async function studentLoginService(loginInput: StudentLogin) {
  const stuByEmailRes = await getDBStudentByEmail(loginInput.email);
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
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Your account has been suspended",
    );
  }
  const { password_hash, ...rest } = desiredStudent;
  return rest;
}
