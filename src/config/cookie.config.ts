import type { CookieOptions } from "express";
import env from "@config/env.config.js";

export const cookieConfig: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000,
};
