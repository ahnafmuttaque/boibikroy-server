import env from "@/config/env.config.js";
import jwt from "jsonwebtoken";

export function createJWT(payload: Record<string, any>) {
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
}
